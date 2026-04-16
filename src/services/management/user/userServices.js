import HttpService from "../../base/HttpService";

export default class UserService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getUser(param) {
    const api = this.api + "system/user";
    return this.get(param, api);
  }

  getDetailUser(param) {
    const api = this.api + "system/user";
    return this.get(param, api);
  }

  postUser(param) {
    const api = this.api + "system/user";
    const token = localStorage.getItem("token");
    return this.http.post(api, param, {
      headers: {
        "x-app-token": token,
        "Content-Type": "application/json",
      },
    });
  }

  editUser(param) {
    const api = this.api + "system/user";
    const token = localStorage.getItem("token");
    return this.http.put(api, param, {
      headers: {
        "x-app-token": token,
        "Content-Type": "application/json",
      },
    });
  }

  deleteUser(id) {
    const api = this.api + "system/user/" + id;
    const token = localStorage.getItem("token");
    return this.http.delete(api, {
      headers: {
        "x-app-token": token,
        "Content-Type": "application/json",
      },
    });
  }
}