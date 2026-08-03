import HttpService from "../../base/HttpService";

export default class BroadcastService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getData(param, data) {
    const api = this.api + "broadcast";

    return this.get(param, api);
  }
  detail(param, data) {
    const api = this.api + "broadcast/" + param;

    return this.get(param, api);
  }
  home(param, data) {
    const api = this.api + "broadcast/home";

    return this.get(param, api);
  }
}
