import "server-only";

import { createHash } from "node:crypto";
import { adminCredentials } from "@/lib/admin-credentials";

export const adminCookieName = "hm_admin_session";

export function adminUsername() {
  return adminCredentials().username;
}

export function adminPassword() {
  return adminCredentials().password;
}

export function adminSessionSecret() {
  return adminCredentials().secret;
}

export function adminSessionToken() {
  const { username, password, secret } = adminCredentials();
  return createHash("sha256")
    .update(`${username}:${password}:${secret}`)
    .digest("hex");
}

export function isValidAdminLogin(username: string, password: string) {
  const credentials = adminCredentials();
  return username.trim() === credentials.username && password.trim() === credentials.password;
}
