export const NumberParser = (v) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const x = parseFloat(String(v ?? "").replace(/[, ]+/g, ""));
  return Number.isFinite(x) ? x : 0;
};
