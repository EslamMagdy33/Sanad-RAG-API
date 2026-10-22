using Sanad.Application.Interfaces;
using System.Text;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace Sanad.Infrastructure.Documents;

public class PdfTextExtractor : IDocumentTextExtractor
{
    public IReadOnlyList<ExtractedPage> Extract(Stream Pdf)
    {
        using var doc=PdfDocument.Open(Pdf);
        var pages= new List<ExtractedPage>();

        foreach (var page in doc.GetPages())
            pages.Add(new ExtractedPage(page.Number, ExtractText(page)));

        return pages;
    }
    private static string ExtractText(Page page)
    {
        var sb = new StringBuilder();
        double? lastY = null;

        foreach(var letter in page.Letters)
        {
            var y = letter.StartBaseLine.Y;
            if(lastY.HasValue && Math.Abs(y - lastY.Value) > letter.PointSize * 0.5)
                sb.Append('\n');
            sb.Append(letter.Value);
            lastY = y;
        }
        return sb.ToString();
    }
}
