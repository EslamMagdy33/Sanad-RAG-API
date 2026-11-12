using Sanad.Domain.Entities;

namespace Sanad.Application.Interfaces;

public interface IDocumentRepository
{
    Task<Document?> GetAsync(Guid userId, Guid id, CancellationToken ct=default);
    Task<IReadOnlyList<Document>> ListAsync(Guid userId, CancellationToken ct=default);
    void Add(Document document);
    void Remove(Document document);
}