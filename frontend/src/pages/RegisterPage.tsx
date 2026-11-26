import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import { errorKey } from "../api/errors";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField, TextField } from "../components/Fields";
import { passwordRules, validateEmail, validatePassword } from "../utils/validation";

type FieldErrors = { email?: string | null; password?: string | null; confirm?: string | null };

export function RegisterPage() {
  const { user, register } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const rules = passwordRules(password);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const emailKey = validateEmail(email);
    const passwordKey = validatePassword(password);
    const next: FieldErrors = {
      email: emailKey ? t(emailKey) : null,
      password: passwordKey ? `${t("auth.passwordNeeds")} ${t(passwordKey)}` : null,
      confirm: password === confirm ? null : t("auth.passwordsMismatch"),
    };
    setErrors(next);
    if (next.email || next.password || next.confirm) return;

    setSubmitting(true);
    try {
      await register(email.trim(), password, true);
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(t(errorKey(err, "err.registerFailed")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSub")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="auth-link">{t("auth.signInLink")}</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <TextField
          id="email"
          label={t("auth.email")}
          type="email"
          dir="ltr"
          required
          autoComplete="email"
          placeholder="name@company.gov.sa"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail size={20} />}
        />

        <div className="field">
          <PasswordField
            id="password"
            label={t("auth.password")}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <ul className="rules" aria-label={t("auth.rulesTitle")}>
            {rules.map((rule) => (
              <li key={rule.key} className={rule.ok ? "ok" : ""}>
                {rule.ok ? "✓" : "○"} {t(rule.key)}
              </li>
            ))}
          </ul>
        </div>

        <PasswordField
          id="confirm"
          label={t("auth.confirmPassword")}
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        {formError && <div role="alert" className="alert alert-error">{formError}</div>}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" /> {t("auth.creatingAccount")}
            </>
          ) : (
            <>
              {t("auth.createAccount")} <Arrow size={18} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
