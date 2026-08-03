import HttpService from '../base/HttpService'

export default class AuthService extends HttpService {
  static api = process.env.VUE_APP_PERTAGAS

  authLogin(param, data) {
    const api = this.api + 'auth/login'

    return this.postLogin(param, api, data)
  }

  authLoginSso(param, data) {
    const api = this.api + 'auth/login-sso'

    return this.post(param, api)
  }
}
