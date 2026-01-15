import HttpService from "../base/HttpService";

export default class FaqService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getAll(param) {
    const api = this.api + "faq";

    return this.get(param, api);
  }

  getByDomain(param) {
    const api = this.api + "faq/list/domain";

    return this.get(param, api);
  }

  getByCategory(param) {
    const api = this.api + "faq/list/category" + param;

    return this.get(param, api);
  }

  getExternal(param) {
    const api = this.api + "faq/list/domain/external";

    return this.get(param, api);
  }

  getInternal(param) {
    const api = this.api + "faq/list/domain/internal";

    return this.get(param, api);
  }

  getDetail(param, data) {
    const api = this.api + "faq/" + param;

    return this.get(param, api);
  }
  
  add(param) {
    const api = this.api + "faq";

    return this.post(param, api);
  }
  update(param, data) {
    const api = this.api + "faq";

    return this.put(param, api);
  }
  delete(param, data) {
    const api = this.api + "faq/" + param;

    return this.deleteV2("", api);
  }

  downloadFile(id) {
    const api = this.api + "g/faq/" + id + "?download=true";

    return this.get(id, api);
  }


}
