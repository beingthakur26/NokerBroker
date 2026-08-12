export function normalizeIndianNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

export function toMsg91Mobile(phone: string): string {
  return normalizeIndianNumber(phone).replace(/^\+/, "");
}

export function isValidIndianNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  return (
    (digits.length === 10 && /^[6-9]/.test(digits)) ||
    (digits.length === 12 && digits.startsWith("91"))
  );
}

export function normalizePhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return digits;
}
