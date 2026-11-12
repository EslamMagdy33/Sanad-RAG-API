
using Microsoft.EntityFrameworkCore;
using Sanad.Application.Interfaces;
using Sanad.Domain.Entities;

namespace Sanad.Infrastructure.Persistence.Repositories;

public class DocumentRepository(SanadDbContext dbContext) : IDocumentRepository
{
    public Task<Document?> GetAsync(Guid userId, Guid id, CancellationToken ct = default)=>
        dbContext.Documents.FirstOrDefaultAsync(d=>d.UserId==userId&&d.Id==id, ct);

    public async Task<IReadOnlyList<Document>> ListAsync(Guid userId, CancellationToken ct = default)=>
        await dbContext.Documents.AsNoTracking()
        .Where(d=>d.UserId==userId)
        .OrderByDescending(d=>d.UploadedAt)
        .ToListAsync(ct);
    public void Add(Document document)=>
        dbContext.Documents.Add(document);
    public void Remove(Document document)=>
        dbContext.Documents.Remove(document);
}
