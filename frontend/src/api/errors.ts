import { ApiError } from "./client";
import type { MessageKey } from "../i18n/messages";

/** أكواد الباك اللي ليها رسالة مترجمة */
const KNOWN_CODES = new Set([
  "document.empty",
  "document.too_large",
  "document.unsupported_type",
  "document.invalid_pdf",
  "document.not_found",
]);

/** بيرجّع مفتاح الترجمة المناسب للخطأ، والـ fallback لو الكود مش معروف */
export function errorKey(err: unknown, fallback: MessageKey): MessageKey {
  if (err instanceof ApiError) {
    if (err.code === "network") return "err.network";
    if (err.code && KNOWN_CODES.has(err.code)) return `err.${err.code}` as MessageKey;
  }
  return fallback;
}
