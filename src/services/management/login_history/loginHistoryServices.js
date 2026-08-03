import HttpService from "../../base/HttpService";

export default class LoginHistoryService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getData(param, data) {
    const api = this.api + "system/login-history";

    return this.get(param, api);
  }
  getEmail(param, data) {
    const api = this.api + "system/user/options/login-history";

    return this.get("", api);
  }
  getUser(param, data) {
    const api = this.api + "system/user/options";

    return this.get("", api);
  }
}
