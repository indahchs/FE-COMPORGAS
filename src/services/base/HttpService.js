import { Deserialize, Serialize } from "cerialize";
import BaseService from "./BaseService";
import ErrorService from "./ErrorService";
import ServiceConfig from "../config/ServiceConfig";
import StorageConfig from "../config/StorageConfig";

export default class HttpService extends BaseService {
  static api = "";

  static entity = "";

  constructor(api = "", entity = "", options = {}, http = null) {
    super(options);
    this.api = api;
    this.entity = entity;
    this.http = http || ServiceConfig;
  }

  static build(options) {
    return new this(this.api, this.entity, options);
  }

  static checkResponse(response) {
    if (response.data && response.data.hasOwnProperty('success') && !response.data.success) {
      const errorResponse = {
        response: {
          status: response.data.status || 500,
          data: {
            message: response.data.message || 'Terjadi kesalahan',
            error: response.data.error || response.data.message || 'Internal Server Error'
          }
        }
      };
      throw new ErrorService(errorResponse);
    }

    if (response.data && response.data.status && response.data.status !== 200) {
      const errorResponse = {
        response: {
          status: response.data.status,
          data: {
            message: response.data.message || 'Terjadi kesalahan',
            error: response.data.error || response.data.message || 'Error'
          }
        }
      };
      throw new ErrorService(errorResponse);
    }

    return response;
  }

  static then(response) {
    HttpService.checkResponse(response);
    return response;
  }

  static setHeader() {
    ServiceConfig.defaults.headers.common["x-app-token"] = `${StorageConfig.getToken()}`;
    ServiceConfig.defaults.headers.common["Content-Type"] = "application/json";
    ServiceConfig.defaults.headers.common.Accept = "application/json";
  }

  static setHeaderEms() {
    ServiceConfig.defaults.headers.common["client-id"] = "plnmobile";
    ServiceConfig.defaults.headers.common["signature"] =
      "00c42ff22fff8217d2f4106dc7e7a5fc0b4e40401897ba32b46ad4c3a61d60f3";
    ServiceConfig.defaults.headers.common["timestamp"] = Date.now();
    ServiceConfig.defaults.headers.common["Content-Type"] = "application/json";
    ServiceConfig.defaults.headers.common.Accept = "application/json";
  }

  static setHeaderBroadcast() {
    ServiceConfig.defaults.headers.common["Authorization"] =
      "Bearer 1|8efBkwvBFfzLyJ7y0uFKIXIqd7pWKUTO5birs6HUb1afc7b7";
  }

  static removeHeader() {
    ServiceConfig.defaults.headers.common = {};
  }

  get(param = {}, url = "") {
    const api = url === "" ? this.api : url;
    return this.http.get(api, { params: param, data: {} })
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  getBroadcast(param = {}, url = "") {
    const headers = {
      headers: {
        Authorization:
          "Bearer 1|8efBkwvBFfzLyJ7y0uFKIXIqd7pWKUTO5birs6HUb1afc7b7",
      },
    };
    const api = url === "" ? this.api : url;
    return this.http
      .get(api, { params: param, data: {} }, headers)
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  downloadExcel(param = {}, url = "") {
    const headers = {
      headers: { "Content-Type": "application/octet-stream " },
    };
    const api = url === "" ? this.api : url;
    return this.http
      .get(api, { responseType: "arraybuffer", params: param }, headers)
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  downloadPdf(param = {}, url = "") {
    const headers = {
      headers: { "Content-Type": "application/octet-stream " },
    };
    const api = url === "" ? this.api : url;
    return this.http
      .get(api, { responseType: "blob" }, { params: param }, headers)
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  post(data, url = "", param = {}) {
    const api = url === "" ? this.api : url;
    const deserializeData = Deserialize(data, this.entity);

    return this.http
      .post(api, Serialize(deserializeData), { params: param })
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  put(data, url = "") {
    const api = url === "" ? this.api : url;
    const deserializeData = Deserialize(data, this.entity);

    return this.http
      .put(api, Serialize(deserializeData))
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  patch(data, url = "") {
    const api = url === "" ? this.api : url;
    const deserializeData = Deserialize(data, this.entity);

    return this.http
      .patch(api, Serialize(deserializeData))
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  deleteV2(param = {}, url = "") {
    const api = url === "" ? this.api : url;

    return this.http
      .delete(api, { params: param })
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  upload(data, url = "") {
    const api = url === "" ? `${this.api}/upload` : url;

    return this.http
      .post(api, data, {
        headers: {
          Authorization: "Basic QUlSU0FMRTo0MXI1NExFMjAyMSFAIyQl",
        },
      })
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showErrorUpload();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  uploadData(data, url = "") {
    const api = url === "" ? this.api : url;

    return this.http
      .post(api, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  uploadDataPut(data, url = "") {
    const api = url === "" ? this.api : url;

    return this.http
      .put(api, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }

  postLogin(data, url = "", token) {
    const username = token.email;
    const password = token.password;
    const basicAuth = "Basic " + btoa(username + ":" + password);
    const headers = {
      headers: { Authorization: basicAuth, "Content-Type": "application/json" },
    };
    const api = url === "" ? this.api : url;

    return this.http
      .post(api, data, headers)
      .then(this.constructor.then)
      .catch((e) => {
        if (e instanceof ErrorService) {
          e.showError();
        } else {
          const alert = new ErrorService(e);
          alert.showError();
        }
      });
  }
}