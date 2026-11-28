namespace Sanad.Application.Interfaces;

//دي مسؤوليتها التعامل مع الـ LLM (Large Language Model)، يعني الموديل اللي هيستقبل السؤال والـ Context ويرجع إجابة للمستخدم.
public interface ILlmService
{
    IAsyncEnumerable<string> StreamAsync(string systemPrompt,string userPrompt, CancellationToken ct = default);
}
