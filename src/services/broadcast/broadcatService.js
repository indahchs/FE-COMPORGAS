import HttpService from "../base/HttpService";

export default class BroadcastServices extends HttpService {
  static api = process.env.VUE_APP_BROADCAST;

  getImage(id) {
    const api = this.api + `bcImage/${id}`;
    return this.getBroadcast("", api);
  }
}
