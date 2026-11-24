import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string | null;
  icon?: ReactNode;
};

/** الأيقونات بتتحط بالاتجاه الثابت (يمين/شمال) عشان ما تتداخلش مع النص */
export function TextField({ id, label, error, icon, required, className = "", ...rest }: TextFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="req"> *</span>}
      </label>
      <div className="input-wrap">
        <input
          id={id}
          required={required}
          aria-invalid={Boolean(error)}
          className={`input ${icon ? "has-icon-r" : ""} ${className}`}
          {...rest}
        />
        {icon && <span className="field-icon-r">{icon}</span>}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

type PasswordFieldProps = Omit<TextFieldProps, "type" | "icon" | "className">;

export function PasswordField({ id, label, error, required, ...rest }: PasswordFieldProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="req"> *</span>}
      </label>
      <div className="input-wrap">
        <input
          id={id}
          required={required}
          aria-invalid={Boolean(error)}
          type={visible ? "text" : "password"}
          dir="ltr"
          className="input has-icon-r has-action-l"
          {...rest}
        />
        <span className="field-icon-r">
          <Lock size={20} />
        </span>
        <button
          type="button"
          className="field-action-l"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
