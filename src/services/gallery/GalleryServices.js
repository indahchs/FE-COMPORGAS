import HttpService from "../base/HttpService";

class GalleryService extends HttpService {
  constructor() {
    super();
    this.api = process.env.VUE_APP_PERTAGAS;
  }

  getFolders(param = {}) {
    const api = this.api + "gallery/folders/search";
    return this.get(param, api);
  }

  getFolderPhotos(folderId, param = {}) {
    const api = this.api + `gallery/folders/${folderId}/photos`;
    return this.get(param, api);
  }

  getImage(folder, filename) {
    const api = this.api + `gallery/${folder}/${filename}`;
    return this.get({}, api);
  }

  createFolder(folderData) {
    const api = this.api + "gallery/folders";
    return this.post(folderData, api);
  }
  
  updateFolder(id, data) {
    const api = this.api + `gallery/folders/${id}`
    return this.put(data, api)
  }

  async uploadPhoto(formData) {
    const api = this.api + "gallery/upload";
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
      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  deleteFolder(id) {
    const api = this.api + `gallery/folders/${id}`;
    return this.deleteV2("", api);
  }

  deletePhoto(id) {
    const api = this.api + `gallery/photos/${id}`;
    return this.deleteV2("", api);
  }
}

export default new GalleryService();