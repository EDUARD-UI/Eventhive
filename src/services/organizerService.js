export const organizerService = {
  async getDashboardSummary() {
    return {
      eventsActive: 8,
      ticketsSold: 3412,
      income: '$187M',
      attendees: 5098,
    };
  },

  async listEvents() {
    return [];
  },

  async createEvent(payload) {
    return {
      id: Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
    };
  },
};

export default organizerService;
