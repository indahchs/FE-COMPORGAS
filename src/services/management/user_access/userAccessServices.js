import HttpService from "../../base/HttpService";

export default class UserAccessService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getData(param, data) {
    const api = this.api + "system/user-access";

    return this.get(param, api);
  }
  getUserId(param, data) {
    const api = this.api + "system/user/options/access-user";

    return this.get("", api);
  }
  getUser(param, data) {
    const api = this.api + "system/user/options";

    return this.get("", api);
  }
}
