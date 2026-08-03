import HttpService from "../../base/HttpService";

export default class EventCategoryService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getAll(param) {
    const api = this.api + "system/category-event";

    return this.get(param, api);
  }
  getDetail(param, data) {
    const api = this.api + "system/category-event/" + param;

    return this.get(param, api);
  }
  add(param) {
    const api = this.api + "system/category-event";

    return this.post(param, api);
  }
  update(param, data) {
    const api = this.api + "system/category-event";

    return this.put(param, api);
  }
  delete(param, data) {
    const api = this.api + "system/category-event/" + param;

    return this.deleteV2("", api);
  }
  getOptions() {
    const api = this.api + "system/category-event/options";

    return this.get("", api);
  }
}
