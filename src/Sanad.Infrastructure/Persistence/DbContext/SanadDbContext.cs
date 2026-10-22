using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sanad.Domain.Entities;
using Sanad.Infrastructure.Persistence.Identity;

namespace Sanad.Infrastructure.Persistence;

public class SanadDbContext(DbContextOptions<SanadDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Chunk> Chunks => Set<Chunk>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.HasPostgresExtension("vector");

        b.Entity<Document>(e =>
        {
            e.HasIndex(d => d.UserId);
            e.Property(d => d.FileName).HasMaxLength(255);
            e.HasMany(d => d.Chunks).WithOne(c => c.Document)
             .HasForeignKey(c => c.DocumentId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Chunk>(e =>
        {
            e.Property(c => c.Embedding).HasColumnType("vector(768)"); // غيّر الرقم حسب الـ model
            e.HasIndex(c => c.Embedding).HasMethod("hnsw").HasOperators("vector_cosine_ops");
        });
    }
}