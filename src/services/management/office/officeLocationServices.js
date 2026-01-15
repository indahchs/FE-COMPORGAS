import HttpService from "../../base/HttpService";

export default class OfficeLocationService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getAll(param) {
    const api = this.api + "office-location";

    return this.get(param, api);
  }
  getDetail(param, data) {
    const api = this.api + "office-location/" + param;

    return this.get(param, api);
  }
  add(param) {
    const api = this.api + "office-location";

    return this.post(param, api);
  }
  update(param, data) {
    const api = this.api + "office-location";

    return this.put(param, api);
  }
  delete(param, data) {
    const api = this.api + "office-location/" + param;

    return this.deleteV2("", api);
  }
  getOptions() {
    const api = this.api + "office-location/options";

    return this.get("", api);
  }
}
