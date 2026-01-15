import HttpService from "../../base/HttpService";

export default class FooterService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getFooter(param, data) {
    const api = this.api + "system/footer/find";

    return this.get(param, api);
  }
  postFooter(param, data) {
    const api = this.api + "system/footer";

    return this.post(param, api);
  }
  deleteFooter(param, data) {
    const api = this.api + "system/footer";

    return this.deleteV2(param, api);
  }
}
