
namespace Sanad.Infrastructure.Ai;

//تجميع إعدادات الاتصال بـ Gemini في مكان واحد.
public class GeminiOptions
{
    public string ApiKey { get; set; } = "";
    public string EmbeddingModel { get; set; } = "gemini-embedding-001";
    public string ChatModel { get; set; } = "gemini-3.5-flash";
    public int EmbeddingDimensions { get; set; } = 768;
}
