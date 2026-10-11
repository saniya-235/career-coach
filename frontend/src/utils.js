export function fmtDate(value) {
  if (!value) return "";
  const iso = /Z|[+-]\d\d:?\d\d$/.test(value) ? value : value + "Z";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function errMsg(err, fallback) {
  const detail = err?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}
