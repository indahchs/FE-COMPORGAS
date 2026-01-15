const TOKEN_KEY = "token";

const StorageConfig = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getPathListPermohonan() {
    const role = JSON.parse(localStorage.getItem("dataUser")).userRoleCode;
    if (role == "4") {
      return "admin/up3/permohonan";
    } else if (role == "2") {
      return "admin/pusat/permohonan";
    } else if (role == "3") {
      return "admin/uid/permohonan";
    } else if (role == "6") {
      return "admin/sbu/permohonan";
    } else if (role == "7") {
      return "admin/pusat/permohonan";
    }
  },

  getPathCountPermohonan() {
    const role = JSON.parse(localStorage.getItem("dataUser")).userRoleCode;
    if (role == "4") {
      return "admin/up3/permohonan/counts";
    } else if (role == "2") {
      return "admin/pusat/permohonan/counts";
    } else if (role == "3") {
      return "admin/uid/permohonan/counts";
    } else if (role == "6") {
      return "admin/sbu/permohonan/counts";
    } else if (role == "7") {
      return "admin/pusat/permohonan/counts";
    }
  },
  getPathSummary() {
    const role = JSON.parse(localStorage.getItem("dataUser")).userRoleCode;
    if (role == "7") {
      return "pln";
    } else if (role == "2") {
      return "pusat";
    } else if (role == "3") {
      return "uid";
    } else if (role == "4") {
      return "up3";
    } else if (role == "6") {
      return "sbu";
    }
  },

  saveToken(accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  },

  saveData(data) {
    localStorage.setItem("dataUser", data);
  },

  clearSession() {
    localStorage.clear();
    localStorage.removeItem(TOKEN_KEY);
  },
};

export default StorageConfig;
