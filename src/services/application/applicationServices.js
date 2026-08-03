import HttpService from "../base/HttpService";

export default class ApplicationService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getApps(param, data) {
    const api = this.api + "personal-apps/list";

    return this.get("", api);
  }
  getAppsBsns(param, data) {
    const api = this.api + "business-apps/list/division";

    return this.get(param, api);
  }
  postApps(param, data) {
    const api = this.api + "personal-apps";

    return this.post(param, api);
  }

  editApps(param, data) {
    const api = this.api + "personal-apps";

    return this.put(param, api);
  }

  getFile(param) {
    const api = `${this.api}+"personal-apps/${param}?download=true`;

    return this.downloadExcel("", api);
  }
  deleteApps(param, data) {
    const api = this.api + "personal-apps/" + param;

    return this.deleteV2("", api);
  }
  deleteAppsBsns(param, data) {
    const api = this.api + "business-apps/" + param;

    return this.deleteV2("", api);
  }
  postAppsBsns(param, data) {
    const api = this.api + "business-apps";

    return this.post(param, api);
  }

  editAppsBsns(param, data) {
    const api = this.api + "business-apps";

    return this.put(param, api);
  }
  getEventsDivision(param, data) {
    const api = this.api + "system/division/options";

    return this.get(param, api);
  }
}
