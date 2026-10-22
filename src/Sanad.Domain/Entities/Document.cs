using Sanad.Domain.Enums;
namespace Sanad.Domain.Entities;

public class Document
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FileName { get; set; } = default!;
    public string StoragePath { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public long SizeBytes { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Pending;
    public string? FailureReason { get; set; }
    public int PageCount { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public List<Chunk> Chunks { get; set; } = new();
}