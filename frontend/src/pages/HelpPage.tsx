import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, Bot, ChevronDown, Quote, Rocket, Search, Wrench, type LucideIcon } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";

const CATEGORIES: { icon: LucideIcon; n: 1 | 2 | 3 | 4 | 5; to: string }[] = [
  { icon: Rocket, n: 1, to: "/documents" },
  { icon: Archive, n: 2, to: "/documents" },
  { icon: Bot, n: 3, to: "/chat" },
  { icon: Quote, n: 4, to: "/chat" },
  { icon: Wrench, n: 5, to: "/documents" },
];

const FAQ_KEYS: number[] = [1, 2, 3, 4, 5];

export function HelpPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  const faqs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return FAQ_KEYS.filter((n) => {
      if (!term) return true;
      const q = t(`help.faq${n}Q` as MessageKey).toLowerCase();
      const a = t(`help.faq${n}A` as MessageKey).toLowerCase();
      return q.includes(term) || a.includes(term);
    });
  }, [query, t]);

  return (
    <>
      <div className="help-hero">
        <span className="badge">{t("help.badge")}</span>
        <h1 className="page-title help-title">{t("help.title")}</h1>
        <p className="page-sub">{t("help.sub")}</p>

        <label className="help-search">
          <Search size={20} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("help.searchPlaceholder")}
            aria-label={t("help.searchLabel")}
          />
        </label>
      </div>

      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">{t("help.sectionEyebrow")}</span>
          <h2 className="section-title">{t("help.sectionTitle")}</h2>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <div key={c.n} className="card category-card">
              <div className="category-icon"><c.icon size={22} /></div>
              <span className="section-eyebrow">{t(`help.cat${c.n}Eyebrow` as MessageKey)}</span>
              <h3 className="category-title">{t(`help.cat${c.n}Title` as MessageKey)}</h3>
              <p className="muted">{t(`help.cat${c.n}Text` as MessageKey)}</p>
              <Link to={c.to} className="category-link">{t(`help.cat${c.n}Link` as MessageKey)} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">{t("help.faqEyebrow")}</span>
          <h2 className="section-title">{t("help.faqTitle")}</h2>
        </div>

        {faqs.length === 0 ? (
          <div className="card empty">{t("help.noResults")}</div>
        ) : (
          <div className="faq-list">
            {faqs.map((n) => {
              const open = openIndex === n;
              return (
                <div key={n} className={`card faq-item ${open ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : n)}
                  >
                    <span>{t(`help.faq${n}Q` as MessageKey)}</span>
                    <ChevronDown size={20} className="faq-chevron" />
                  </button>
                  {open && <p className="faq-a">{t(`help.faq${n}A` as MessageKey)}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <div className="card help-support">
          <h2 className="card-title">{t("help.supportTitle")}</h2>
          <p className="muted">{t("help.supportText")}</p>
        </div>
      </section>
    </>
  );
}
