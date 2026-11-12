namespace Sanad.Application.Interfaces;

public interface IFileStorage
{
    Task<string> SaveAsync(Guid userId, string extension, Stream content, CancellationToken ct);
    void Delete(string path);
}
