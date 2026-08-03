import HttpService from "../base/HttpService";

export default class HelpdeskDashboardService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getAllTicketsCount(param) {
    const api = this.api + "ithelpdesk/dashboard/status/all" ;

    return this.get(param, api);
  }

  getTicketAssignedCount(param) {
    const api = this.api + "ithelpdesk/dashboard/status/assigned";

    return this.get(param, api);
  }

  getTicketInProgressCount(param) {
    const api = this.api + "ithelpdesk/dashboard/status/inprogress";

    return this.get(param, api);
  }

  getTicketPendingCount(param) {
    const api = this.api + "ithelpdesk/dashboard/status/pending";

    return this.get(param, api);
  }

  getTicketResolvedCount(param) {
    const api = this.api + "ithelpdesk/dashboard/status/resolved";

    return this.get(param, api);
  }

  getTicketLateCount(param) {
    const api = this.api + "ithelpdesk/dashboard/status/late";

    return this.get(param, api);
  }

  getTicketCountByMonth(param) {
    const api = this.api + "ithelpdesk/dashboard/list/month";

    return this.get(param, api);
  }
  
  getTicketCountByCatalog(param) {
    const api = this.api + "ithelpdesk/dashboard/list/catalog";

    return this.get(param, api);
  }

  getTicketCountByCatalogSlaHours(param) {
    const api = this.api + "ithelpdesk/dashboard/list/catalog-sla";

    return this.get(param, api);
  }

  getTicketCountByPic(param) {
    const api = this.api + "ithelpdesk/dashboard/list/pic";

    return this.get(param, api);
  }
  
  getTicketCountByOffice(param) {
    const api = this.api + "ithelpdesk/dashboard/list/office";

    return this.get(param, api);
  }

  getYearOptions(param) {
    const api = this.api + "ithelpdesk/dashboard/options/year";

    return this.get(param, api);
  }

}
