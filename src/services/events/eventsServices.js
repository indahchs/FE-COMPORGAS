import HttpService from "../base/HttpService";

export default class EventService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getEvents(param, data) {
    const api = this.api + "event";

    return this.get(param, api);
  }
  getMyEvents(param, data) {
    const api = this.api + "event/myevent";

    return this.get(param, api);
  }
  getEventsUpcoming(officeLocationId = null) {
    let api = this.api + "event/upcoming";

    if (officeLocationId) {
      api += `?officeLocationId=${officeLocationId}`;
    }

    return this.get("", api);
  }
  getEventsHome(month, year, officeLocationId) {
    let api = this.api + "event/home";

    api += `?month=${month}&year=${year}`;

    if (officeLocationId) {
      api += `&officeLocationId=${officeLocationId}`;
    }

    return this.get("", api);
  }
  getEventsList(param, data) {
    const api = this.api + "event/home";

    return this.get("", api);
  }
  getEventsOpt(param, data) {
    const api = this.api + "system/category-event/options";

    return this.get(param, api);
  }
  getEventsDivision(param, data) {
    const api = this.api + "system/division/options";

    return this.get(param, api);
  }
  getEventsLocation(param, data) {
    const api = this.api + "office-location/options";

    return this.get(param, api);
  }
  getDetailEvents(param, data) {
    const api = this.api + "event";

    return this.get(param, api);
  }
  postEvents(param, data) {
    const api = this.api + "event";

    return this.post(param, api);
  }
  approveEvents(param, data) {
    const api = this.api + "event/approve/" + param;

    return this.put("", api);
  }
  rejectEvents(param, data) {
    const api = this.api + "event/reject/" + param;

    return this.put(data, api);
  }
  editEvents(param, data) {
    const api = this.api + "event";

    return this.put(param, api);
  }
  deleteEvent(param, data) {
    const api = this.api + "event/cancel/" + param;

    return this.put("", api);
  }
}
