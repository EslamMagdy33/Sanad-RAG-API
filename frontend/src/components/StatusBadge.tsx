import type { components } from "../api/schema";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";

type Status = components["schemas"]["DocumentStatus"];

const CLASS: Record<Status, string> = {
  Pending: "badge-neutral",
  Processing: "badge-warning",
  Ready: "badge-success",
  Failed: "badge-danger",
};

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useI18n();
  return <span className={`badge ${CLASS[status]}`}>{t(`status.${status}` as MessageKey)}</span>;
}
