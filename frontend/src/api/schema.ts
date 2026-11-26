/**
 * أنواع الـ API مطابقة لعقود الباك اند.
 * لما الباك يكون شغال، شغّلي `npm run gen:api` عشان تتولد تلقائياً من Swagger،
 * ولو الناتج اختلف عن الملف ده، الناتج هو المرجع.
 */
export interface components {
  schemas: {
    AuthResponse: {
      token: string;
      expiresAt: string;
    };
    MeResponse: {
      id: string;
      email: string;
    };
    DocumentStatus: "Pending" | "Processing" | "Ready" | "Failed";
    DocumentDto: {
      id: string;
      fileName: string;
      contentType: string;
      sizeBytes: number;
      status: "Pending" | "Processing" | "Ready" | "Failed";
      failureReason: string | null;
      pageCount: number | null;
      uploadedAt: string;
    };
    ApiProblem: {
      title?: string;
      status?: number;
      code?: string;
    };
    Source: {
      documentId: string;
      fileName: string;
      page: number;
      snippet: string;
    };
    ChatEvent:
      | { type: "token"; text: string }
      | { type: "sources"; sources: components["schemas"]["Source"][] }
      | { type: "insufficient" }
      | { type: "done" };
  };
}
