
using Microsoft.EntityFrameworkCore;
using Sanad.Application.Documents;
using Sanad.Application.Interfaces;
using Sanad.Domain.Entities;
using Sanad.Infrastructure.Persistence;

namespace Sanad.Infrastructure.Documents;

public class DocumentService(SanadDbContext dbContext, IFileStorage storage) : IDocumentService
{
    private const long MaxBytes = 10 * 1024 * 1024;
    private static readonly string[] AllowedExtensions = [".pdf", ".txt"]; 
    public async Task<UploadResult> UploadAsync(Guid userId, string fileName, string contentType, long size, Stream content, CancellationToken ct)
    {
        var safeName = Path.GetFileName(fileName);
        var extension= Path.GetExtension(safeName).ToLowerInvariant();

        if (size <= 0) 
            return new(null, "الملف فاضي ");
        if (size > MaxBytes)
            return new(null, "حجم الملف اكبر من 10 MB");
        if (!AllowedExtensions.Contains(extension))
            return new(null, "نوع الملف غير مدعوم (pdf او txt فقط)");
        if (extension == ".pdf" && !await HasPdfHeaderAsync(content, ct))
            return new(null, " الملف ليس pdf صالح");

        var path = await storage.SaveAsync(userId, extension, content, ct);
        try
        {
            var document = new Document
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FileName = safeName,
                StoragePath = path,
                ContentType = extension == ".pdf" ? "application/pdf" : "text/plain",
                SizeBytes = size
            };
            dbContext.Documents.Add(document);
            await dbContext.SaveChangesAsync(ct);
            return new(ToDto(document), null);
        }
        catch
        {
            storage.Delete(path);
            throw;
        }
    }
    public async Task<IReadOnlyList<DocumentDto>> ListAsync(Guid userId, CancellationToken ct)=>
        await dbContext.Documents.AsNoTracking()
            .Where(d=>d.UserId==userId)
            .OrderByDescending(d=>d.UploadedAt)
            .Select(d=>ToDto(d))
            .ToListAsync(ct);


    public async Task<DocumentDto?> GetAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var document = await dbContext.Documents.AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId, ct);
        return document is null ?null: ToDto(document);
    }
    public async Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var document=await dbContext.Documents
            .FirstOrDefaultAsync(d=>d.UserId== userId && d.Id== id, ct);
        if(document is null)
            return false;
        dbContext.Documents.Remove(document);
        await dbContext.SaveChangesAsync();
        storage.Delete(document.StoragePath);
        return true;
    }

    private static async Task<bool> HasPdfHeaderAsync(Stream stream, CancellationToken ct)
    {
        if (!stream.CanSeek)
            return false;
        var buffer = new byte[5];
        var read = 0;
        while(read < buffer.Length)
        {
            var n = await stream.ReadAsync(buffer, ct);
            if (n == 0)
                break;
            read += n; 
        }
        stream.Position = 0;

        return read == 5 && buffer.AsSpan().SequenceEqual("%PDF-"u8);
    }
    private static DocumentDto ToDto(Document document) => new (
        document.Id, document.FileName, document.ContentType, document.SizeBytes,
        document.Status.ToString(), document.FailureReason, document.PageCount, document.UploadedAt);
        
}

