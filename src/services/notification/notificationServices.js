import HttpService from "../base/HttpService";

export default class NotificationService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getLatest() {
    const api = this.api + "notif/personal/latest";

    return this.get("", api);
  }
  getPage(param) {
    const api = this.api + "notif/personal/page";

    return this.get(param, api);
  }
  postReadNotif(param, data) {
    const api = this.api + "notif/personal/read";

    return this.post(param, api);
  }
  postDeleteNotif(param, data) {
    const api = this.api + "notif/personal/delete";

    return this.post(param, api);
  }
}
