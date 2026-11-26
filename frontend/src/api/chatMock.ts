import type { components } from "./schema";
import type { Lang } from "../i18n/messages";

type ChatEvent = components["schemas"]["ChatEvent"];

const ANSWER: Record<Lang, string> = {
  ar: "هذا رد تجريبي من الواجهة. عند تفعيل الباك اند ستظهر هنا إجابة مبنية على نص المستندات المرفوعة فقط، مع الاستشهاد بالصفحة والمقتطف الداعم.",
  en: "This is a sample response from the interface. Once the backend is connected, answers will be based only on your uploaded documents, with page-level citations and supporting excerpts.",
};

const SOURCE: Record<Lang, { fileName: string; snippet: string }> = {
  ar: { fileName: "مستند تجريبي.pdf", snippet: "مقتطف تجريبي يوضح شكل بطاقة المصدر في الواجهة." },
  en: { fileName: "sample-document.pdf", snippet: "Sample excerpt showing how a source card appears." },
};

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** نفس شكل الـ SSE اللي الباك هيبعته، عشان نبدّله بالـ API الحقيقي من غير ما الصفحات تتغير */
export async function mockStream(
  question: string,
  documentId: string | undefined,
  lang: Lang,
  onEvent: (event: ChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  await wait(400, signal);

  // في الـ mock: السؤال القصير جداً بيعتبر "معلومات غير كافية"
  if (question.trim().length < 6) {
    onEvent({ type: "insufficient" });
    onEvent({ type: "done" });
    return;
  }

  for (const word of ANSWER[lang].split(" ")) {
    await wait(40, signal);
    onEvent({ type: "token", text: `${word} ` });
  }

  onEvent({
    type: "sources",
    sources: [
      {
        documentId: documentId ?? "mock-document",
        fileName: SOURCE[lang].fileName,
        page: 1,
        snippet: SOURCE[lang].snippet,
      },
    ],
  });
  onEvent({ type: "done" });
}
