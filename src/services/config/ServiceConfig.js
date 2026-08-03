import axios from 'axios'
import StorageConfig from '../config/StorageConfig'
import router from '../../router'

const ServiceConfig = axios.create({
  timeout: 30000,
  transformResponse: [
    function (data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
        }
      }

      return data
    },
  ],
})

if (process.env.NODE_ENV === 'development') {
  ServiceConfig.interceptors.request.use(
    function (config) {
      return config
    },
    function (error) {
      return Promise.reject(error)
    },
  )

  // Tambah renspon API dengan interceptor
  ServiceConfig.interceptors.response.use(
    response => response,
    error => {
      if (error.response.status === 401) {
        StorageConfig.clearSession()
        router.push('/login')
      }
    }
  )
}

export default ServiceConfig
