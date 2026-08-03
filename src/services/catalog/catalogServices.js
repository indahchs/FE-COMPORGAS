import HttpService from "../base/HttpService";

export default class CatalogService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getAll(param) {
    const api = this.api + "ithelpdesk/catalog";

    return this.get(param, api);
  }

  getAllOptions(param) {
    const api = this.api + "ithelpdesk/catalog/options";

    return this.get(param, api);
  }

  add(param) {
    const api = this.api + "ithelpdesk/catalog";

    return this.post(param, api);
  }

  getDetail(param) {
    const api = this.api + "ithelpdesk/catalog/" + param;

    return this.get(param, api);
  }

  addPic(param) {
    const api = this.api + "ithelpdesk/catalog/pic";

    return this.post(param, api);
  }

}
