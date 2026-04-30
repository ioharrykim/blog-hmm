import "server-only";

import { createHash } from "node:crypto";

export const adminCookieName = "hm_admin_session";

export function adminUsername() {
  return process.env.ADMIN_USERNAME || "hyunmin";
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "change-this-before-deploy";
}

export function adminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || `${adminUsername()}:${adminPassword()}:hmmhmm`;
}

export function adminSessionToken() {
  return createHash("sha256")
    .update(`${adminUsername()}:${adminPassword()}:${adminSessionSecret()}`)
    .digest("hex");
}

export function isValidAdminLogin(username: string, password: string) {
  return username === adminUsername() && password === adminPassword();
}
