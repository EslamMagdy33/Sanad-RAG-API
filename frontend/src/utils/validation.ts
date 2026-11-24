import type { MessageKey } from "../i18n/messages";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** بترجّع مفتاح الخطأ، أو null لو مفيش مشكلة */
export function validateEmail(value: string): MessageKey | null {
  return EMAIL_RE.test(value.trim()) ? null : "err.emailInvalid";
}

/** نفس قواعد الباك: 6 حروف، رقم، حرف كبير وصغير، ورمز */
export function passwordRules(value: string): { key: MessageKey; ok: boolean }[] {
  return [
    { key: "rule.length", ok: value.length >= 6 },
    { key: "rule.digit", ok: /\d/.test(value) },
    { key: "rule.case", ok: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { key: "rule.symbol", ok: /[^A-Za-z0-9]/.test(value) },
  ];
}

export function validatePassword(value: string): MessageKey | null {
  const failed = passwordRules(value).find((rule) => !rule.ok);
  return failed ? failed.key : null;
}

export function validateDocumentFile(file: File): MessageKey | null {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isTxt = name.endsWith(".txt") || file.type === "text/plain";

  if (!isPdf && !isTxt) return "err.document.unsupported_type";
  if (file.size === 0) return "err.document.empty";
  if (file.size > MAX_FILE_BYTES) return "err.document.too_large";
  return null;
}
