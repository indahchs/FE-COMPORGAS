import Oidc from "oidc-client";

Oidc.Log.logger = console;
Oidc.Log.level =
  process.env.NODE_ENV === "production" ? Oidc.Log.ERROR : Oidc.Log.DEBUG;

// OIDC configuration
let oidcProviderDomain = "https://login.qa.idaman.pertamina.com/";
let clientId = "07df88e7-51ed-43f2-ad23-5b2d07992df1";
let scopes =
  "openid, profile, email, offline_access, api.auth, application.read, application.readAll,user.read, user.readAll, user.role, user.whiteList.readAll,user.whiteList.read";

let instance;

// OIDC Client
export const getOidcClient = () => {
  if (instance) {
    return instance;
  }

  instance = new Oidc.UserManager({
    userStore: new Oidc.WebStorageStateStore(),
    authority: oidcProviderDomain,
    client_id: clientId,
    redirect_uri: window.location.origin + "/home",
    response_type: "code",
    scope: scopes,
    post_logout_redirect_uri: window.location.origin + "/home?action=logout",
    accessTokenExpiringNotificationTime: 10,
    automaticSilentRenew: false,
    filterProtocolClaims: false,
    loadUserInfo: true,
    includeIdTokenInSilentRenew: false,
  });
  return instance;
};
