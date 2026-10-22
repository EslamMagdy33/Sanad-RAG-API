namespace Sanad.Application.Interfaces;

public interface IDocumentTextExtractor
{
    IReadOnlyList<ExtractedPage> Extract(Stream Pdf);
}

public record ExtractedPage(int PageNumber, string Text);
