import createAuth0Client from "@auth0/auth0-spa-js";
import { user, isAuthenticated, popupOpen, token } from "./store";

function createClient() {
  return createAuth0Client({
    domain: domain_env,
    client_id: clientID_env,
  });
}

async function loginWithPopup(client, options) {
  popupOpen.set(true);
  try {
    await client.loginWithPopup(options);
    user.set(await client.getUser());
    const accessToken = await client.getIdTokenClaims();
    token.set(accessToken.__raw);
    isAuthenticated.set(true);
  } catch (e) {
    throw new Error(errors[0].message || "Unknown error");
  } finally {
    popupOpen.set(false);
  }
}

function logout(client) {
  return client.logout();
}

const auth = {
  createClient,
  loginWithPopup,
  logout,
};

export default auth;
