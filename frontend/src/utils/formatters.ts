/** 空值显示为 em dash */
export function displayValue(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  return String(val);
}
