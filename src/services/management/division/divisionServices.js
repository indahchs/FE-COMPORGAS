import HttpService from "../../base/HttpService";

export default class DivisionService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getDivision(param, data) {
    const api = this.api + "system/division";

    return this.get(param, api);
  }
  getDetailDivision(param, data) {
    const api = this.api + "system/division";

    return this.get(param, api);
  }
  postDivision(param, data) {
    const api = this.api + "system/division";

    return this.post(param, api);
  }
  editDivision(param, data) {
    const api = this.api + "system/division";

    return this.put(param, api);
  }
  deleteDivision(param, data) {
    const api = this.api + "system/division/" + param;

    return this.deleteV2("", api);
  }
}
