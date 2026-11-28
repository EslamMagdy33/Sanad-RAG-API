// Ai/GeminiEmbeddingService.cs
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Sanad.Application.Interfaces;

namespace Sanad.Infrastructure.Ai;

public class GeminiEmbeddingService(HttpClient http, IOptions<GeminiOptions> options) : IEmbeddingService
{
    private const int BatchSize = 20;
    private readonly GeminiOptions _o = options.Value;

    public async Task<float[]> EmbedAsync(string text, CancellationToken ct) =>
        (await EmbedBatchAsync([text], ct))[0];

    public async Task<IReadOnlyList<float[]>> EmbedBatchAsync(IReadOnlyList<string> texts, CancellationToken ct)
    {
        var all = new List<float[]>(texts.Count);

        foreach (var batch in texts.Chunk(BatchSize))
        {
            var payload = new
            {
                requests = batch.Select(t => new
                {
                    model = $"models/{_o.EmbeddingModel}",
                    content = new { parts = new[] { new { text = t } } },
                    outputDimensionality = _o.EmbeddingDimensions
                })
            };

            using var response = await GeminiHttp.SendAsync(http,
                () => new HttpRequestMessage(HttpMethod.Post, $"models/{_o.EmbeddingModel}:batchEmbedContents")
                {
                    Content = JsonContent.Create(payload)
                },
                HttpCompletionOption.ResponseContentRead, ct);

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);

            foreach (var emb in doc.RootElement.GetProperty("embeddings").EnumerateArray())
                all.Add(emb.GetProperty("values").EnumerateArray().Select(v => v.GetSingle()).ToArray());
        }

        return all;
    }
}