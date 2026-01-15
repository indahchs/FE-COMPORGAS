import axios from 'axios'

const ServiceConfig = axios.create({
  timeout: 30000,
  transformResponse: [
    function (data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          /* Ignore */
        }
      }

      return data
    },
  ],
})

// logging response request on development environment
if (process.env.NODE_ENV === 'development') {
  ServiceConfig.interceptors.request.use(
    function (config) {
      return config
    },
    function (error) {
      return Promise.reject(error)
    },
  )

  // Add a response interceptor
  ServiceConfig.interceptors.response.use(
    function (response) {
      return response
    },
    function (error) {
      return Promise.reject(error)
    },
  )
}

export default ServiceConfig
