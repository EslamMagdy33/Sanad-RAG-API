// Ai/GeminiHttp.cs
namespace Sanad.Infrastructure.Ai;

public class GeminiException(int statusCode, string body)
    : Exception($"Gemini API failed with status {statusCode}: {(body.Length > 300 ? body[..300] : body)}")
{
    public int StatusCode { get; } = statusCode;
}

internal static class GeminiHttp
{
    // retry على 429/500/503 بـ backoff (2s, 4s, 8s)
    public static async Task<HttpResponseMessage> SendAsync(
        HttpClient http, Func<HttpRequestMessage> create,
        HttpCompletionOption option, CancellationToken ct, int maxAttempts = 4)
    {
        for (var attempt = 1; ; attempt++)
        {
            var response = await http.SendAsync(create(), option, ct);
            if (response.IsSuccessStatusCode) return response;

            var status = (int)response.StatusCode;
            var retryable = status is 429 or 500 or 503;

            if (!retryable || attempt >= maxAttempts)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                response.Dispose();
                throw new GeminiException(status, body);
            }

            response.Dispose();
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)), ct);
        }
    }
}