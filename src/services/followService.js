import { organizationService } from './organizerService.js';
import { session } from './session.js';

const STORAGE_PREFIX = 'eventhive_following_';

function getUserId(user) {
  const u = user || session.getUser();
  return u?.id || u?.usuarioId || 'guest';
}

export const followService = {
  getFollowedIds(userId) {
    try {
      const uid = userId || getUserId();
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${uid}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveFollowedIds(userId, ids) {
    try {
      const uid = userId || getUserId();
      const safeIds = Array.isArray(ids) ? ids : [];
      localStorage.setItem(`${STORAGE_PREFIX}${uid}`, JSON.stringify(safeIds.map(String)));
    } catch {
      // ignore
    }
  },

  isFollowing(orgId, userId) {
    if (!orgId) return false;
    try {
      const ids = this.getFollowedIds(userId);
      return Array.isArray(ids) && ids.map(String).includes(String(orgId));
    } catch {
      return false;
    }
  },

  async syncWithBackend(userId) {
    const uid = userId || getUserId();
    const token = session.getToken();
    if (!token || uid === 'guest') {
      return this.getFollowedIds(uid);
    }

    try {
      const seguidas = await organizationService.getOrganizacionesSeguidas({ page: 0, size: 100 });
      const backendIds = (seguidas || []).map((o) => String(o.id)).filter(Boolean);
      
      const localIds = new Set(this.getFollowedIds(uid).map(String));
      backendIds.forEach((id) => localIds.add(id));
      
      const merged = Array.from(localIds);
      this.saveFollowedIds(uid, merged);
      return merged;
    } catch {
      return this.getFollowedIds(uid);
    }
  },

  async follow(orgId, userId) {
    if (!orgId) return;
    const uid = userId || getUserId();
    const strId = String(orgId);

    // Optimistic local update
    const current = new Set(this.getFollowedIds(uid).map(String));
    current.add(strId);
    this.saveFollowedIds(uid, Array.from(current));

    // Dispatch global sync event
    this.notifyChange(strId, true);

    try {
      await organizationService.followOrganization(orgId);
    } catch (err) {
      // Rollback on failure
      const rollback = new Set(this.getFollowedIds(uid).map(String));
      rollback.delete(strId);
      this.saveFollowedIds(uid, Array.from(rollback));
      this.notifyChange(strId, false);
      throw err;
    }
  },

  async unfollow(orgId, userId) {
    if (!orgId) return;
    const uid = userId || getUserId();
    const strId = String(orgId);

    // Optimistic local update
    const current = new Set(this.getFollowedIds(uid).map(String));
    current.delete(strId);
    this.saveFollowedIds(uid, Array.from(current));

    // Dispatch global sync event
    this.notifyChange(strId, false);

    try {
      await organizationService.unfollowOrganization(orgId);
    } catch (err) {
      // Rollback on failure
      const rollback = new Set(this.getFollowedIds(uid).map(String));
      rollback.add(strId);
      this.saveFollowedIds(uid, Array.from(rollback));
      this.notifyChange(strId, true);
      throw err;
    }
  },

  notifyChange(orgId, isFollowing) {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('eventhive:follow_changed', {
            detail: { orgId: String(orgId), isFollowing },
          })
        );
      }
    } catch {
      // ignore
    }
  },
};

export default followService;

