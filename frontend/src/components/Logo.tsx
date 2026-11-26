type LogoProps = { height?: number };

/** اللوجو بخلفية شفافة: نسخة للوضع الفاتح ونسخة للداكن (النص فاتح) */
export function Logo({ height = 60 }: LogoProps) {
  const style = { height, width: "auto" } as const;
  return (
    <>
      <img className="logo-light" src="/sanad-logo.png" alt="سند | SANAD" style={style} />
      <img className="logo-dark" src="/sanad-logo-dark.png" alt="" aria-hidden="true" style={style} />
    </>
  );
}
