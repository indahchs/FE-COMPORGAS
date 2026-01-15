import HttpService from "../base/HttpService";
import Alert from '@/components/Alert';

export default class BannerService extends HttpService {
  constructor() {
    super();
    this.api = process.env.VUE_APP_PERTAGAS || '';
  }

  getBannerPage(params = {}) {
    const api = this.api + "instagram";
    return this.get(params, api);
  }

  getBannerHome(manual, params = {}) {
    const api = this.api + `instagram/home?manual=${manual}`;
    return this.get(params, api);
  }

  getBannerDetail(id, params = {}) {
    const api = this.api + `instagram/${id}`;
    return this.get(params, api);
  }

  deleteBanner(id, params = {}) {
    const api = this.api + `instagram/${id}`;
    return this.deleteV2(params, api);
  }

  async createBanner(formData) {
    const api = this.api + "instagram";
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(api, {
        method: 'POST',
        body: formData,
        headers: {
          'x-app-token': `${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.status >= 400 && result.success === false) {
        const errorMessage = result.message || 'Server returned an error';
        Alert.error(null, "error", "Gagal Menambahkan Berita", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Create banner error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Menambahkan Berita", errorMessage);
      throw error;
    }
  }

  async updateBanner(id, formData) {
    const api = this.api + `instagram/${id}`;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(api, {
        method: 'PUT',
        body: formData,
        headers: {
          'x-app-token': `${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.status >= 400 && result.success === false) {
        const errorMessage = result.message || 'Server returned an error';
        Alert.error(null, "error", "Gagal Update Berita", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Update banner error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Update Berita", errorMessage);
      throw error;
    }
  }

  async updateStatusEnable(id) {
    const api = this.api + `instagram/${id}/enable`;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(api, {
        method: 'PUT',
        headers: {
          'x-app-token': `${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.status >= 400 && result.success === false) {
        const errorMessage = result.message || 'Server returned an error';
        Alert.error(null, "error", "Gagal Update Status Aktif Berita", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Enable banner error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Update Status Aktif Berita", errorMessage);
      throw error;
    }
  }

  async updateStatusDisable(id) {
    const api = this.api + `instagram/${id}/disable`;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(api, {
        method: 'PUT',
        headers: {
          'x-app-token': `${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.status >= 400 && result.success === false) {
        const errorMessage = result.message || 'Server returned an error';
        Alert.error(null, "error", "Gagal Update Status Tidak Aktif Berita", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Disable banner error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Update Status Tidak Aktif Berita", errorMessage);
      throw error;
    }
  }
}