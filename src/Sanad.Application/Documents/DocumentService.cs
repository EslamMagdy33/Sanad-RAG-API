using Sanad.Application.Common;
using Sanad.Application.Interfaces;
using Sanad.Domain.Entities;

namespace Sanad.Application.Documents;

public class DocumentService(
    IDocumentRepository documents,IUnitOfWork uow,
    IFileStorage storage) : IDocumentService
{
    private const long MaxBytes = 10 * 1024 * 1024;
    private static readonly string[] AllowedExtensions = [".pdf", ".txt"];

    public async Task<Result<DocumentDto>> UploadAsync(Guid userId, string fileName, long size,
        Stream content, CancellationToken ct)
    {
        var safeName = Path.GetFileName(fileName);
        var ext = Path.GetExtension(safeName).ToLowerInvariant();

        if (size <= 0) return DocumentErrors.Empty;
        if (size > MaxBytes) return DocumentErrors.TooLarge;
        if (!AllowedExtensions.Contains(ext)) return DocumentErrors.UnsupportedType;
        if (ext == ".pdf" && !await HasPdfHeaderAsync(content, ct)) return DocumentErrors.InvalidPdf;

        var path = await storage.SaveAsync(userId, ext, content, ct);

        var doc = new Document
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FileName = safeName,
            StoragePath = path,
            ContentType = ext == ".pdf" ? "application/pdf" : "text/plain",
            SizeBytes = size
        };

        try
        {
            documents.Add(doc);
            await uow.SaveChangesAsync(ct);
        }
        catch
        {
            storage.Delete(path);   // منسيبش ملف يتيم لو الـ DB فشلت
            throw;
        }

        return ToDto(doc);
    }

    public async Task<IReadOnlyList<DocumentDto>> ListAsync(Guid userId, CancellationToken ct)
    {
        var docs = await documents.ListAsync(userId, ct);
        return docs.Select(ToDto).ToList();
    }

    public async Task<Result<DocumentDto>> GetAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var doc = await documents.GetAsync(userId, id, ct);
        if (doc is null) return DocumentErrors.NotFound;
        return ToDto(doc);
    }

    public async Task<Result> DeleteAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var doc = await documents.GetAsync(userId, id, ct);
        if (doc is null) return Result.Failure(DocumentErrors.NotFound);

        documents.Remove(doc);                 // الـ Chunks بتتمسح بالـ Cascade
        await uow.SaveChangesAsync(ct);
        storage.Delete(doc.StoragePath);       // بعد نجاح الـ DB
        return Result.Success();
    }

    private static async Task<bool> HasPdfHeaderAsync(Stream s, CancellationToken ct)
    {
        var buffer = new byte[5];
        try { await s.ReadExactlyAsync(buffer, ct); }
        catch (EndOfStreamException) { return false; }

        if (s.CanSeek) s.Position = 0;
        return buffer.SequenceEqual("%PDF-"u8.ToArray());
    }

    private static DocumentDto ToDto(Document d) => new(
        d.Id, d.FileName, d.ContentType, d.SizeBytes,
        d.Status.ToString(), d.FailureReason, d.PageCount, d.UploadedAt);
}