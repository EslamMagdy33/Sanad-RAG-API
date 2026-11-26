import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import { Logo } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <LanguageSwitch />
      </div>

      <div className="auth-shell">
        <div className="card auth-card">
          <div className="auth-brand">
            <Logo height={84} />
            <span className="auth-badge">{t("brand.badge")}</span>
          </div>

          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>

          {children}

          <div className="auth-foot">{footer}</div>
        </div>

        <p className="auth-legal">
          <ShieldCheck size={15} />
          {t("auth.secureNote")} · {t("footer.copy")}
        </p>
      </div>
    </div>
  );
}
