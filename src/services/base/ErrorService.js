import Alert from '@/components/Alert'
import StorageConfig from '../config/StorageConfig'

export default class ErrorService extends Error {
  constructor(error) {
    super(error)
    this.error = error.response
  }

  showError() {
    const statusToken = this.error.data.message
    const status = this.error.status

    const icon = status === 500 ? 'error' : 'warning'

    let title
    if (status === 500) {
      title = this.error.data.error || 'Server Error'
    } else if (status === 401) {
      title = 'Unauthorized'
    } else if (status === 403) {
      title = 'Forbidden'
    } else if (status === 404) {
      title = 'Data Tidak Ditemukan'
    } else {
      title = 'Terjadi Kesalahan'
    }

    const text = this.error.data.message || 'Silahkan coba lagi'

    const shouldLogout = (status === 401)
    const shouldReload = shouldLogout || (status >= 500 && status < 600 && this.isServerError())

    Alert.error(
      () => {
        if (shouldLogout) {
          StorageConfig.clearSession()
          location.reload()
        } else if (shouldReload) {
          location.reload()
        }
      },
      icon,
      title,
      text,
    )
  }

  isServerError() {
    const businessLogicKeywords = [
      'not found',
      'tidak ditemukan',
      'already exists',
      'sudah ada',
      'invalid',
      'tidak valid',
      'expired',
      'kadaluarsa'
    ]

    const message = (this.error.data.message || '').toLowerCase()
    const hasBusinessLogicKeyword = businessLogicKeywords.some(keyword =>
      message.includes(keyword)
    )

    return !hasBusinessLogicKeyword
  }

  showErrorUpload() {
    const status = this.error.status
    const icon = 'error'
    const title = 'Upload Gagal'
    const text = this.error.data.message || 'Gagal mengupload file'

    Alert.error(
      () => {
        if (status === 401) {
          StorageConfig.clearSession()
          location.reload()
        }
      },
      icon,
      title,
      text,
    )
  }
}