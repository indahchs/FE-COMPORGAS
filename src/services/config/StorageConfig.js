const TOKEN_KEY = "token";

const StorageConfig = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
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
