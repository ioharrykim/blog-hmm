function cleanCredential(value: string | undefined, fallback: string) {
  const trimmed = (value || fallback).trim();
  const quote = trimmed[0];
  if ((quote === `"` || quote === `'`) && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function adminCredentials() {
  const username = cleanCredential(process.env.ADMIN_USERNAME, "hyunmin");
  const password = cleanCredential(process.env.ADMIN_PASSWORD, "change-this-before-deploy");
  const secret = cleanCredential(process.env.ADMIN_SESSION_SECRET, `${username}:${password}:hmmhmm`);

  return { username, password, secret };
}
