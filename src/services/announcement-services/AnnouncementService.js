import HttpService from "../base/HttpService";
import Alert from '@/components/Alert';

export default class AnnouncementService extends HttpService {
  constructor() {
    super();
    this.api = process.env.VUE_APP_PERTAGAS || '';
  }

  getAnnouncementPage(params = {}) {
    const api = this.api + "broadcast";
    return this.get(params, api);
  }

  getAnnouncementDetail(id, params = {}) {
    const api = this.api + `broadcast/${id}`;
    return this.get(params, api);
  }

  getAnnouncementFile(folder, filename, params = {}) {
    const api = this.api + `broadcast/${folder}/${filename}`;
    return this.get(params, api);
  }

  getAnnouncementHome(params = {}) {
    const api = this.api + "broadcast/home";
    return this.get(params, api);
  }

  deleteAnnouncement(id, params = {}) {
    const api = this.api + `broadcast/${id}`;
    return this.deleteV2(params, api);
  }

  async createAnnouncement(formData) {
    const api = this.api + "broadcast";
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
        Alert.error(null, "error", "Gagal Menambahkan Pengumuman", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Create announcement error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Menambahkan Pengumuman", errorMessage);
      throw error;
    }
  }

  async updateAnnouncement(id, formData) {
    const api = this.api + `broadcast/${id}`;
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
        Alert.error(null, "error", "Gagal Update Pengumuman", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Update announcement error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Update Pengumuman", errorMessage);
      throw error;
    }
  }

  async updateStatusEnable(id) {
    const api = this.api + `broadcast/${id}/enable`;
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
        Alert.error(null, "error", "Gagal Update Status Aktif Pengumuman", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Enable announcement error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Update Status Aktif Pengumuman", errorMessage);
      throw error;
    }
  }

  async updateStatusDisable(id) {
    const api = this.api + `broadcast/${id}/disable`;
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
        Alert.error(null, "error", "Gagal Update Status Tidak Aktif Pengumuman", errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Disable announcement error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.error(null, "error", "Gagal Update Status Tidak Aktif Pengumuman", errorMessage);
      throw error;
    }
  }
}