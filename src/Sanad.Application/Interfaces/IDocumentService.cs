using Sanad.Application.Common;
using Sanad.Application.Documents;

namespace Sanad.Application.Interfaces;

public interface IDocumentService
{
    Task<Result<DocumentDto>> UploadAsync(Guid userId, string fileName,long size,
        Stream content, CancellationToken ct);
    Task<IReadOnlyList<DocumentDto>> ListAsync(Guid userId, CancellationToken ct);
    Task<Result<DocumentDto?>> GetAsync(Guid userId, Guid id, CancellationToken ct);
    Task<Result> DeleteAsync(Guid userId, Guid id, CancellationToken ct);
}
