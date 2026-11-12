
using Sanad.Application.Interfaces;

namespace Sanad.Infrastructure.Persistence.Repositories;

public class UnitOfWork(SanadDbContext dbContext) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken ct = default)=>
        dbContext.SaveChangesAsync(ct);
}
