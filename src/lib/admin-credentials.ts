export function adminCredentials() {
  const username = (process.env.ADMIN_USERNAME || "hyunmin").trim();
  const password = (process.env.ADMIN_PASSWORD || "change-this-before-deploy").trim();
  const secret = (process.env.ADMIN_SESSION_SECRET || `${username}:${password}:hmmhmm`).trim();

  return { username, password, secret };
}
