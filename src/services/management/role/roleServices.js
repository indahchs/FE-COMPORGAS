import HttpService from "../../base/HttpService";

export default class RoleService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getRole(param, data) {
    const api = this.api + "system/role";

    return this.get(param, api);
  }
  getRoleOpt(param, data) {
    const api = this.api + "system/role/options";

    return this.get("", api);
  }
  getDetailRole(param, data) {
    const api = this.api + "system/role";

    return this.get(param, api);
  }
  postRole(param, data) {
    const api = this.api + "system/role";

    return this.post(param, api);
  }
  editRole(param, data) {
    const api = this.api + "system/role";

    return this.put(param, api);
  }
  deleteRole(param, data) {
    const api = this.api + "system/role/" + param;

    return this.deleteV2("", api);
  }
}
