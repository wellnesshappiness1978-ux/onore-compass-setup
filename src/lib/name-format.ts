export function formatPersonalName(value: string, upper = false) {
  const normalized = value.replace(/[\s　]+/g, "　");
  return upper ? normalized.toUpperCase() : normalized;
}

export function finalizePersonalName(value: string, upper = false) {
  return formatPersonalName(value, upper).replace(/^　+|　+$/g, "");
}