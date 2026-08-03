import axios from 'axios'

/**
 * LOAD DATA
 * set Axios Wrapper API Base End Point
 */

const baseapi = process.env.VUE_APP_PERTAGAS

export const hitAPI = axios.create({
  baseURL: baseapi,
})

hitAPI.interceptors.request.use(
  config => {
    config.headers = {
      'x-app-token': localStorage.getItem('token'),
      'Content-Type': 'multipart/form-data',
    }

    return config
  },
  error => Promise.reject(error),
)
