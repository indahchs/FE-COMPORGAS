import HttpService from "../../base/HttpService";

export default class UserService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getUser(param, data) {
    const api = this.api + "system/user";

    return this.get(param, api);
  }
  getDetailUser(param, data) {
    const api = this.api + "system/user";

    return this.get(param, api);
  }
  postUser(param, data) {
    const api = this.api + "system/user";

    return this.post(param, api);
  }
  editUser(param, data) {
    const api = this.api + "system/user";

    return this.put(param, api);
  }
  deleteUser(param, data) {
    const api = this.api + "system/user/" + param;

    return this.deleteV2("", api);
  }
}
