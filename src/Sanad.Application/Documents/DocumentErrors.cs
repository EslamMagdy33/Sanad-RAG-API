using Sanad.Application.Common;

namespace Sanad.Application.Documents;

public static class DocumentErrors
{
    public static readonly Error Empty =
        new("document.empty", "الملف فاضي",ErrorType.Validation);

    public static readonly Error TooLarge =
        new("document.too_large", "حجم الملف أكبر من الحد المسموح", ErrorType.Validation);

    public static readonly Error UnsupportedType =
        new("document.unsupported_type", "نوع الملف غير مدعوم (PDF أو TXT فقط)", ErrorType.Validation);

    public static readonly Error InvalidPdf =
        new("document.invalid_pdf", "الملف ليس PDF صالح", ErrorType.Validation);

    public static readonly Error NotFound =
        new("document.not_found", "المستند غير موجود", ErrorType.NotFound);
}