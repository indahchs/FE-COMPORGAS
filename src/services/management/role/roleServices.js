import HttpService from "../../base/HttpService";

export default class RoleService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getRole(param) {
    const api = this.api + "system/role";
    return this.get(param, api);
  }

  getRoleOpt() {
    const api = this.api + "system/role/options";
    return this.get("", api);
  }

  getDetailRole(param) {
    const api = this.api + "system/role";
    return this.get(param, api);
  }

  postRole(param) {
    const api = this.api + "system/role";
    const token = localStorage.getItem("token");
    return this.http.post(api, param, {
      headers: {
        "x-app-token": token,
        "Content-Type": "application/json",
      },
    });
  }

  editRole(param) {
    const api = this.api + "system/role";
    const token = localStorage.getItem("token");
    return this.http.put(api, param, {
      headers: {
        "x-app-token": token,
        "Content-Type": "application/json",
      },
    });
  }

  deleteRole(id) {
    const api = this.api + "system/role/" + id;
    const token = localStorage.getItem("token");
    return this.http.delete(api, {
      headers: {
        "x-app-token": token,
        "Content-Type": "application/json",
      },
    });
  }
}