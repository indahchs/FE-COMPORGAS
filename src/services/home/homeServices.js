import HttpService from "../base/HttpService";

export default class HomeService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS;

  getIg(param, data) {
    const api =
      "https://graph.instagram.com/me/media?access_token=" +
      "IGQWRPcGNlQnZARMGVRelZAteVdabkhXMF9VMkxYWmVtYXhodGVVVVBfNEpFdWs4R3FaWUJHNjczSGlRX3dxZAzZA3QTdUVTBBSUkxOWZARRVZAidTJNNFZAWbmhwSUVDSjloM3ZALOW0tbVBYU3B4MkF0aWktR3RPVng0S0UZD" +
      "&fields=thumbnail_url,media_url,media_type,caption,permalink,profile_picture_url,profile_pic,has_profile_picture,followed_by_count,timestamp,username&limit=9";

    return this.get("", api);
  }
  getApiIg(param, data) {
    const api = this.api + "instagram/home"

    return this.get("", api);
  }
}
