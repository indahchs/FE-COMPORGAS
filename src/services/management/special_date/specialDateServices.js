import HttpService from "../../base/HttpService";

export default class SpecialDateService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getData(param, data) {
    const api = this.api + "system/special-date";

    return this.get(param, api);
  }
  detail(param, data) {
    const api = this.api + "system/special-date" + param;

    return this.get(param, api);
  }
  add(param, data) {
    const api = this.api + "system/special-date";

    return this.post(param, api);
  }
  update(param, data) {
    const api = this.api + "system/special-date";

    return this.put(param, api);
  }
  delete(param, data) {
    const api = this.api + "system/special-date/" + param;

    return this.deleteV2("", api);
  }
  popup(param, data) {
    const api = this.api + "system/special-date/home";

    return this.get(param, api);
  }
}
