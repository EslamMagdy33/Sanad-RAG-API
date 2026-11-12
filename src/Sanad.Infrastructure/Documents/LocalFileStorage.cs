// Auth/LocalFileStorage.cs
using Microsoft.Extensions.Configuration;
using Sanad.Application.Interfaces;

namespace Sanad.Infrastructure.Documents
{
    public class LocalFileStorage(IConfiguration config) : IFileStorage
    {
        private readonly string _root = Path.TrimEndingDirectorySeparator(Path.GetFullPath(config["Storage:RootPath"] ?? "storage"));
        public async Task<string> SaveAsync(Guid userId, string extension, Stream content, CancellationToken ct)
        {
            var relative = Path.Combine(userId.ToString("N"), $"{Guid.NewGuid():N}{extension}");
            var full = Path.Combine(_root, relative);
            Directory.CreateDirectory(Path.GetDirectoryName(full)!);

            await using var fs = File.Create(full);
            await content.CopyToAsync(fs, ct);
            return relative;
        }
        public void Delete(string path)
        {
            var full = Path.GetFullPath(Path.Combine(_root, path));
            if (full.StartsWith(_root + Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase) && File.Exists(full))
                File.Delete(full);
        }
    }
}
