import HttpService from "../../base/HttpService";

export default class MeetingRoomService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getAll(param) {
    const api = this.api + "meeting-room";

    return this.get(param, api);
  }
  getMeeting(param) {
    const api = this.api + "meeting";

    return this.get(param, api);
  }
  getMeetingById(param) {
    const api = this.api + "meeting/mymeeting";

    return this.get(param, api);
  }
  getListMeeting(param) {
    const api = this.api + "meeting/home";

    return this.get("", api);
  }
  bookMeeting(param) {
    const api = this.api + "meeting";

    return this.post(param, api);
  }
  deleteMeeting(param) {
    const api = this.api + "meeting/" + param;

    return this.deleteV2("", api);
  }
  approveMeeting(param) {
    const api = this.api + "meeting/approve/" + param;

    return this.put("", api);
  }
  rejectMeeting(param, data) {
    const api = this.api + "meeting/reject/" + param;

    return this.put(data, api);
  }
  getDetail(param) {
    const api = this.api + "meeting-room";

    return this.get(param, api);
  }
  getMeetingSummary() {
    const api = this.api + "meeting-room/summary";

    return this.get('', api);
  }
  add(param) {
    const api = this.api + "meeting-room";

    return this.post(param, api);
  }
  update(param) {
    const api = this.api + "meeting-room";

    return this.put(param, api);
  }
  delete(param) {
    const api = this.api + "meeting-room/" + param;

    return this.deleteV2("", api);
  }
  getOptions() {
    const api = this.api + "meeting-room/options";

    return this.get("", api);
  }
  getLocation() {
    const api = this.api + "office-location/options";

    return this.get("", api);
  }
  getRoomById(param) {
    const api = this.api + "meeting-room/list/" + param;

    return this.get("", api);
  }
  getDivision(param, data) {
    const api = this.api + "system/division/options";

    return this.get(param, api);
  }
}
