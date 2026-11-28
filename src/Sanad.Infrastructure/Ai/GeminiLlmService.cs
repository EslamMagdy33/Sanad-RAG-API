using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Sanad.Application.Interfaces;

namespace Sanad.Infrastructure.Ai;

public class GeminiLlmService(HttpClient http, IOptions<GeminiOptions> options) : ILlmService
{
    private readonly GeminiOptions _o = options.Value;

    public async IAsyncEnumerable<string> StreamAsync(
        string systemPrompt, string userPrompt, [EnumeratorCancellation] CancellationToken ct)
    {
        var payload = new
        {
            systemInstruction = new { parts = new[] { new { text = systemPrompt } } },
            contents = new[] { new { role = "user", parts = new[] { new { text = userPrompt } } } },
            generationConfig = new { temperature = 0.2 }
        };

        using var response = await GeminiHttp.SendAsync(http,
            () => new HttpRequestMessage(HttpMethod.Post, $"models/{_o.ChatModel}:streamGenerateContent?alt=sse")
            {
                Content = JsonContent.Create(payload)
            },
            HttpCompletionOption.ResponseHeadersRead, ct);

        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        while (await reader.ReadLineAsync(ct) is { } line)
        {
            if (!line.StartsWith("data:")) continue;
            var json = line["data:".Length..].Trim();
            if (json.Length == 0) continue;

            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                continue;
            if (!candidates[0].TryGetProperty("content", out var content) ||
                !content.TryGetProperty("parts", out var parts))
                continue;

            foreach (var part in parts.EnumerateArray())
            {
                if (part.TryGetProperty("thought", out var th) && th.ValueKind == JsonValueKind.True) continue;
                if (part.TryGetProperty("text", out var text) && text.GetString() is { Length: > 0 } t)
                    yield return t;
            }
        }
    }
}