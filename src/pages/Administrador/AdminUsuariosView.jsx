import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Eye,
  Mail,
} from 'lucide-react';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalDetalleUsuarioAdmin from '../../components/componentsAdmin/ModalDetalleUsuarioAdmin.jsx';
import ComposeMailDrawer from '../../components/Shared/ComposeMailDrawer.jsx';
import adminService from '../../features/admin/services/adminService.js';

export default function AdminUsuariosView({
  usuarios: initialUsuarios = [],
  onUpdateUsuario,
}) {
  const [usuariosList, setUsuariosList] = useState(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Modales a la derecha
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState(null);
  const [mailDrawer, setMailDrawer] = useState({
    isOpen: false,
    email: '',
    name: '',
    subject: '',
  });

  // Carga reactiva de usuarios desde endpoint paginado GET /api/usuarios o búsqueda
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsuarios({
        page: 0,
        size: 200,
      });
      if (res.success && Array.isArray(res.data)) {
        setUsuariosList(res.data);
      }
    } catch (err) {
      console.warn('Error al cargar lista de usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUsuarios && initialUsuarios.length > 0) {
      setUsuariosList(initialUsuarios);
    } else {
      fetchUsuarios();
    }
  }, [initialUsuarios, fetchUsuarios]);

  // Filtrado 100% en el Frontend por Rol y Búsqueda
  const filteredUsers = useMemo(() => {
    return usuariosList.filter((user) => {
      // 1. Filtrado por Rol en el Frontend
      if (filtroRol !== 'TODOS') {
        const userRoles = Array.isArray(user.roles) && user.roles.length > 0
          ? user.roles.map((r) => (typeof r === 'object' && r !== null ? r.nombre || r.name || '' : String(r)).toUpperCase())
          : [(user.rolNombre || user.rol || 'CLIENTE').toUpperCase()];

        if (!userRoles.includes(filtroRol.toUpperCase())) {
          return false;
        }
      }

      // 2. Filtrado por término de búsqueda en el Frontend
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const nombre = (user.nombre || user.name || '').toLowerCase();
        const correo = (user.correo || user.email || user.correoElectronico || user.correoUsuario || '').toLowerCase();
        const tel = (user.telefono || user.phone || '').toLowerCase();
        if (!nombre.includes(term) && !correo.includes(term) && !tel.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [usuariosList, filtroRol, searchTerm]);

  // Paginación en Frontend
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const renderRoleBadge = (rol) => {
    const r = (rol || 'CLIENTE').toUpperCase();
    let dotColor = 'bg-[#0F2342]';
    if (r === 'ADMINISTRADOR') dotColor = 'bg-[#DC2626]';
    if (r === 'MODERADOR') dotColor = 'bg-[#F5B800]';
    if (r === 'REPRESENTANTE') dotColor = 'bg-[#D97706]';
    if (r === 'OPERADOR') dotColor = 'bg-[#0F2342]';

    return (
      <span className="font-mono text-[11px] font-bold text-[#0F2342] uppercase tracking-wider inline-flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {r}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F2342] font-display">
            DIRECTORIO DE USUARIOS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cuentas registradas, perfiles operativos y organizaciones vinculadas en plataforma.
          </p>
        </div>
      </div>

      {/* Barra de Resumen en Línea */}
      <div className="bg-white border border-[#E2E8F0] rounded-[2px] p-3 flex flex-wrap items-center divide-x divide-[#E2E8F0] shadow-sm">
        <div className="px-4 py-1 text-left">
          <span className="font-mono text-[10px] text-slate-500 tracking-wider uppercase block">TOTAL CUENTAS</span>
          <span className="font-mono text-sm font-bold text-[#0F2342]">{usuariosList.length}</span>
        </div>
        <div className="px-4 py-1 text-left">
          <span className="font-mono text-[10px] text-slate-500 tracking-wider uppercase block">FILTRADAS</span>
          <span className="font-mono text-sm font-bold text-[#0F2342]">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3 rounded-[2px] border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#0F2342] transition-colors"
          />
        </div>

        {/* Filtro por Rol */}
        <select
          value={filtroRol}
          onChange={(e) => {
            setFiltroRol(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto text-xs font-mono uppercase px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-white text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors"
        >
          <option value="TODOS">TODOS LOS ROLES</option>
          <option value="ADMINISTRADOR">ADMINISTRADORES</option>
          <option value="MODERADOR">MODERADORES</option>
          <option value="REPRESENTANTE">REPRESENTANTES</option>
          <option value="OPERADOR">OPERADORES</option>
          <option value="CLIENTE">CLIENTES</option>
          <option value="MARKETING">MARKETING</option>
        </select>
      </div>

      {/* Tabla de Usuarios con scroll editorial */}
      <div className="bg-white rounded-[2px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto editorial-scroll-x">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4 text-center">Rol</th>
                <th className="py-3 px-4">Organización Vinculada</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                    Cargando directorio de usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                    No se encontraron usuarios con los criterios especificados.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const rolDisplay = user.rolNombre || user.rol || 'CLIENTE';
                  const userEmail = user.correo || user.email || user.correoElectronico || user.correoUsuario || '';
                  const orgName =
                    typeof user.organizacion === 'object' && user.organizacion !== null
                      ? user.organizacion.razonSocial || user.organizacion.nombre
                      : typeof user.organizacion === 'string' && user.organizacion.trim()
                      ? user.organizacion
                      : null;

                  return (
                    <tr key={user.id} className="hover:bg-[#F8F9FA] transition-colors">
                      {/* Nombre y correo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[2px] bg-[#0F2342] text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                            {user.nombre?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F2342] block">{user.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{userEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        {user.telefono ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.telefono}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Rol */}
                      <td className="py-3 px-4 text-center">
                        {renderRoleBadge(rolDisplay)}
                      </td>

                      {/* Organización Vinculada */}
                      <td className="py-3 px-4">
                        {orgName ? (
                          <span className="font-mono text-xs font-bold text-[#0F2342]">
                            {orgName}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px] italic">
                            Sin organización
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForDrawer(user)}
                            className="px-2.5 py-1 rounded-[2px] border border-[#0F2342] text-[#0F2342] hover:bg-[#0F2342] hover:text-white transition-colors cursor-pointer text-[11px] font-mono font-bold inline-flex items-center gap-1"
                            title="Ver detalle y editar usuario"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>DETALLE</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setMailDrawer({
                                isOpen: true,
                                email: userEmail,
                                name: user.nombre || 'Usuario',
                                subject: `Comunicación oficial de EventHive`,
                              })
                            }
                            className="p-1.5 rounded-[2px] border border-[#E2E8F0] text-[#0F2342] hover:bg-[#0F2342] hover:text-white transition-colors cursor-pointer"
                            title="Enviar correo individual"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Modal Drawer a la Derecha para Consulta de Usuario */}
      {selectedUserForDrawer && (
        <ModalDetalleUsuarioAdmin
          usuario={selectedUserForDrawer}
          onClose={() => setSelectedUserForDrawer(null)}
          onUserUpdated={fetchUsuarios}
        />
      )}

      {/* Drawer Desplegable para Enviar Correo */}
      <ComposeMailDrawer
        isOpen={mailDrawer.isOpen}
        onClose={() => setMailDrawer((prev) => ({ ...prev, isOpen: false }))}
        recipientEmail={mailDrawer.email}
        recipientName={mailDrawer.name}
        initialSubject={mailDrawer.subject}
      />
    </div>
  );
}