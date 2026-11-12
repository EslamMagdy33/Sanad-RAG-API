namespace Sanad.Application.Documents;

public record DocumentDto(
    Guid Id, string FileName, string ContentType, long SizeBytes,
    string Status, string? FailureReason, int PageCount, DateTime UploadedAt);

public record UploadResult(DocumentDto? Document, string? Error);