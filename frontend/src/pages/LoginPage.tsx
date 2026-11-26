import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import { errorKey } from "../api/errors";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField, TextField } from "../components/Fields";
import { validateEmail } from "../utils/validation";

export function LoginPage() {
  const { user, login } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const problem = validateEmail(email);
    setEmailError(problem ? t(problem) : null);
    if (problem) return;

    if (!password) {
      setFormError(t("auth.enterPassword"));
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(t(errorKey(err, "err.loginFailed")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSub")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="auth-link">{t("auth.createNew")}</Link>
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
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          error={emailError}
          icon={<Mail size={20} />}
        />

        <PasswordField
          id="password"
          label={t("auth.password")}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="row-between">
          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            {t("auth.remember")}
          </label>
          <button type="button" className="btn-ghost" onClick={() => setShowForgot((v) => !v)}>
            {t("auth.forgot")}
          </button>
        </div>

        {showForgot && <div className="alert alert-info">{t("auth.forgotInfo")}</div>}
        {formError && <div role="alert" className="alert alert-error">{formError}</div>}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" /> {t("auth.signingIn")}
            </>
          ) : (
            <>
              {t("auth.signIn")} <Arrow size={18} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
