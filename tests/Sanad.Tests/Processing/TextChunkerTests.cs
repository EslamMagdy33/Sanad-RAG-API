using Sanad.Application.Interfaces;
using Sanad.Application.Processing;

namespace Sanad.Tests.Processing;

public class TextChunkerTests
{
    private static string Sentences(int count) =>
        string.Join(" ", Enumerable.Range(1, count).Select(i => $"هذه هي الجملة رقم {i} في المستند."));

    [Fact]
    public void EmptyOrWhitespacePages_ProduceNoChunks()
    {
        var chunks = TextChunker.Chunk([new ExtractedPage(1, ""), new ExtractedPage(2, "  \n  ")]);
        Assert.Empty(chunks);
    }

    [Fact]
    public void ShortPage_ProducesOneChunk_WithPageNumber()
    {
        var chunks = TextChunker.Chunk([new ExtractedPage(3, "جملة قصيرة واحدة.")]);

        var c = Assert.Single(chunks);
        Assert.Equal(3, c.PageNumber);
        Assert.Equal("جملة قصيرة واحدة.", c.Text);
    }

    [Fact]
    public void LongPage_NoChunkExceedsMax()
    {
        var chunks = TextChunker.Chunk([new ExtractedPage(1, Sentences(200))], maxChars: 800, overlapChars: 120);

        Assert.True(chunks.Count > 1);
        Assert.All(chunks, c => Assert.True(c.Text.Length <= 800, $"chunk length {c.Text.Length}"));
    }

    [Fact]
    public void ChunksNeverCrossPages_AndKeepTheirPageNumber()
    {
        var chunks = TextChunker.Chunk([
            new ExtractedPage(1, Sentences(60)),
            new ExtractedPage(2, "نص خاص بالصفحة الثانية فقط.")], maxChars: 400);

        Assert.DoesNotContain(chunks.Where(c => c.PageNumber == 1), c => c.Text.Contains("الصفحة الثانية"));
        Assert.Contains(chunks, c => c.PageNumber == 2 && c.Text.Contains("الصفحة الثانية"));
    }

    [Fact]
    public void IndexesAreSequentialAcrossPages()
    {
        var chunks = TextChunker.Chunk([new ExtractedPage(1, Sentences(60)), new ExtractedPage(2, Sentences(60))], maxChars: 400);

        Assert.Equal(Enumerable.Range(0, chunks.Count), chunks.Select(c => c.Index));
    }

    [Fact]
    public void ConsecutiveChunks_OverlapByAtLeastOneSentence()
    {
        var chunks = TextChunker.Chunk([new ExtractedPage(1, Sentences(100))], maxChars: 400, overlapChars: 120);

        for (var i = 1; i < chunks.Count; i++)
        {
            var lastSentenceOfPrev = chunks[i - 1].Text.Split('.', StringSplitOptions.RemoveEmptyEntries).Last().Trim();
            Assert.Contains(lastSentenceOfPrev, chunks[i].Text);
        }
    }

    [Fact]
    public void SingleHugeSentence_IsSplitByWords_AndStaysUnderMax()
    {
        var huge = string.Join(" ", Enumerable.Repeat("كلمة", 1000));   // من غير نقطة
        var chunks = TextChunker.Chunk([new ExtractedPage(1, huge)], maxChars: 300);

        Assert.True(chunks.Count > 1);
        Assert.All(chunks, c => Assert.True(c.Text.Length <= 300));
    }

    [Fact]
    public void NewLinesAndExtraSpaces_AreNormalized()
    {
        var chunks = TextChunker.Chunk([new ExtractedPage(1, "داخل\nشركة   النور.\n\nالجملة التالية.")]);

        Assert.Equal("داخل شركة النور. الجملة التالية.", chunks[0].Text);
    }
}