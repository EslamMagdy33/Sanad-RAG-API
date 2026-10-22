using System.Text;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

if (args.Length == 0) { Console.WriteLine("Usage: dotnet run -- <file.pdf>"); return; }

var path = args[0];
using var doc = PdfDocument.Open(path);

var sb = new StringBuilder();
int totalChars = 0, presentationForms = 0, arabicLetters = 0;

foreach (var page in doc.GetPages())
{
    var text = ExtractText(page);
    totalChars += text.Length;
    foreach (var ch in text)
    {
        if (ch >= '\u0600' && ch <= '\u06FF') arabicLetters++;
        if (ch >= '\uFB50' && ch <= '\uFEFF') presentationForms++;
    }
    sb.AppendLine($"--- Page {page.Number} ---");
    sb.AppendLine(text);
}

var outPath = Path.ChangeExtension(path, ".extracted.txt");
File.WriteAllText(outPath, sb.ToString(), new UTF8Encoding(true));

Console.WriteLine($"Pages: {doc.NumberOfPages}");
Console.WriteLine($"Total chars: {totalChars}");
Console.WriteLine($"Arabic letters (normal range): {arabicLetters}");
Console.WriteLine($"Presentation-form letters: {presentationForms}");
Console.WriteLine($"Output saved to: {outPath}");

static string ExtractText(Page page)
{
    var sb = new StringBuilder();
    double? lastY = null;

    foreach (var letter in page.Letters)
    {
        var y = letter.StartBaseLine.Y;
        if (lastY.HasValue && Math.Abs(y - lastY.Value) > letter.PointSize * 0.5)
            sb.Append('\n');

        sb.Append(letter.Value);
        lastY = y;
    }
    return sb.ToString();
}