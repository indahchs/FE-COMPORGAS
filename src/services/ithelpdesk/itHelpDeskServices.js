import HttpService from "../base/HttpService";

export default class ItHelpDeskService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getHelpDesk(param, data) {
    const api = this.api + "ithelpdesk/catalog/options";

    return this.get(param, api);
  }
  getHelpDeskPage(param, data) {
    const api = this.api + "ithelpdesk/catalog";

    return this.get(param, api);
  }
  getHelpDeskOpt(param, data) {
    const api = this.api + "system/category-event/options";

    return this.get(param, api);
  }
  getHelpDeskDivision(param, data) {
    const api = this.api + "system/division/options";

    return this.get(param, api);
  }
  getDetailHelpDesk(param, data) {
    const api = this.api + "event";

    return this.get(param, api);
  }
  getHelpDeskById(param, data) {
    const api = this.api + "ithelpdesk/catalog/" + param;

    return this.get("", api);
  }
  postHelpDesk(param, data) {
    const api = this.api + "ithelpdesk/catalog";

    return this.post(param, api);
  }
  putHelpDesk(param, data) {
    const api = this.api + "ithelpdesk/catalog";

    return this.put(param, api);
  }
  deleteTicket(param) {
    const api = this.api + "ithelpdesk/ticket/" + param;
    return this.deleteV2("", api);
  }
  deleteHelpDesk(param, data) {
    const api = this.api + "ithelpdesk/catalog/" + param;

    return this.deleteV2("", api);
  }
  deleteHelpDeskPic(param, data) {
    const api = this.api + "ithelpdesk/catalog/pic/" + param;

    return this.deleteV2("", api);
  }
  postHelpDeskPic(param, data) {
    const api = this.api + "ithelpdesk/catalog/pic";

    return this.post(param, api);
  }
  putHelpDeskPic(param, data) {
    const api = this.api + "ithelpdesk/catalog/pic";

    return this.put(param, api);
  }
  approveHelpDesk(param, data) {
    const api = this.api + "event/approve/" + param;

    return this.put("", api);
  }
  rejectHelpDesk(param, data) {
    const api = this.api + "event/reject/" + param;

    return this.put(data, api);
  }
  editHelpDesk(param, data) {
    const api = this.api + "event";

    return this.put(param, api);
  }
  getLocation() {
    const api = this.api + "office-location/options";

    return this.get("", api);
  }
  getPic() {
    const api = this.api + "system/user/options/ithelpdesk";

    return this.get("", api);
  }
  getTicketPage(param) {
    const api = this.api + "ithelpdesk/ticket";

    return this.get(param, api);
  }
  getTicket(param) {
    const api = this.api + "ithelpdesk/ticket/list/user";

    return this.get(param, api);
  }
  getTicketPic(param) {
    const api = this.api + "ithelpdesk/ticket/list/pic";

    return this.get(param, api);
  }
  postTicket(param) {
    const api = this.api + "ithelpdesk/ticket";

    return this.post(param, api);
  }
  postChat(param) {
    const api = this.api + "ithelpdesk/ticket-chat";

    return this.post(param, api);
  }
  getChat(param) {
    const api = this.api + `ithelpdesk/ticket-chat/list/${param}`;

    return this.get("", api);
  }
  getTImeline(param) {
    const api = this.api + `ithelpdesk/ticket/log/${param}`;

    return this.get("", api);
  }
  ticketResume(param, data) {
    const api = this.api + "ithelpdesk/ticket/resume/" + param;

    return this.put(data, api);
  }
  ticketResolved(param, data) {
    const api = this.api + "ithelpdesk/ticket/resolve/" + param;

    return this.put("", api);
  }
  ticketPending(param, data) {
    const api = this.api + "ithelpdesk/ticket/pending/" + param;

    return this.put(data, api);
  }
  ticketAssign(param) {
    const api = this.api + "ithelpdesk/ticket/assign";

    return this.put(param, api);
  }
  ticketResume(param) {
    const api = this.api + "ithelpdesk/ticket/resume/" + param;

    return this.put("", api);
  }

  ticketGetDispatch(param) {
    const api = this.api + "ithelpdesk/ticket/dispatch";

    return this.get(param, api);
  }

  postFeedback(param) {
    const api = this.api + "ithelpdesk/ticket/feedback";

    return this.put(param, api);
  }

  export(param) {
    const api = this.api + "g/export/ticket?download=true";

    return this.downloadExcel(param, api);
  }
}
