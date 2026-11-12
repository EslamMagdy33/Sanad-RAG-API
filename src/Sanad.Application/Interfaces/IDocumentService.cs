using Sanad.Application.Documents;

namespace Sanad.Application.Interfaces;

public interface IDocumentService
{
    Task<UploadResult> UploadAsync(Guid userId, string fileName, string contentType,
        long size, Stream content, CancellationToken ct);
    Task<IReadOnlyList<DocumentDto>> ListAsync(Guid userId, CancellationToken ct);
    Task<DocumentDto?> GetAsync(Guid userId, Guid id, CancellationToken ct);
    Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken ct);
}
