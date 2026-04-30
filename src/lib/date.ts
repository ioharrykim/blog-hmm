const formatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul"
});

export function formatDate(value?: string | null) {
  if (!value) return "";
  return formatter.format(new Date(value));
}

export function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function fromInputDateTime(value?: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return new Date(trimmed).toISOString();
}

export function readingMinutes(body: string) {
  const chars = body.replace(/\s+/g, "").length;
  return Math.max(1, Math.ceil(chars / 500));
}
