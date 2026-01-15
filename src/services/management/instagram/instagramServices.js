import HttpService from "../../base/HttpService";

export default class QuoteService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getData(param, data) {
    const api = this.api + "instagram";

    return this.get(param, api);
  }
  detail(param, data) {
    const api = this.api + "instagram/" + param;

    return this.get("", api);
  }
  add(param, data) {
    const api = this.api + "instagram";

    return this.post(param, api);
  }
  update(param, data) {
    const api = this.api + "instagram";

    return this.put(param, api);
  }
  delete(param, data) {
    const api = this.api + "instagram/" + param;

    return this.deleteV2("", api);
  }
  popup(param, data) {
    const api = this.api + "system/quote/home";

    return this.get(param, api);
  }
}
