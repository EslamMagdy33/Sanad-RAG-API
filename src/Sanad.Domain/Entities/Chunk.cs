using Pgvector;

namespace Sanad.Domain.Entities;

public class Chunk
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Document Document { get; set; } = default!;
    public int ChunkIndex { get; set; }
    public int PageNumber { get; set; }
    public string Text { get; set; } = default!;
    public Vector Embedding { get; set; } = default!;
}
