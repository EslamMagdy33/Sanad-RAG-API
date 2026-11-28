using System.Text;
using System.Text.RegularExpressions;
using Sanad.Application.Interfaces;

namespace Sanad.Application.Processing;

public record TextChunk(int Index, int PageNumber, string Text);

public static class TextChunker
{
    private static readonly Regex Whitespace = new(@"\s+", RegexOptions.Compiled);
    private static readonly Regex SentenceEnd = new(@"(?<=[\.\!\?؟؛])\s+", RegexOptions.Compiled);

    // لتجهيز النصوص فقط
    public static List<TextChunk> Chunk(IEnumerable<ExtractedPage> pages,int maxChars=800,int overlapChars=120) 
    {
        var result = new List<TextChunk>();
        foreach (var page in pages)
        {
            var text = Whitespace.Replace(page.Text ?? "", " ").Trim();
            if (text.Length == 0) continue;
            foreach (var piece in ChunkPage(text, maxChars, overlapChars))
            {
                result.Add(new TextChunk(result.Count, page.PageNumber, piece));
            }
        }
        return result;
    }
    //التقسيم الفعلي: دي المسؤولة عن إنها تاخد نص صفحة واحدة، وتقسمه إلى Chunks مع محاولة الحفاظ على سياق الكلام باستخدام الـ Overlap.
    public static IEnumerable<string> ChunkPage(string text, int max,int overlap)
    {
        var units = SentenceEnd.Split(text).SelectMany(s => SplitLong(s, max)).ToList();
        var current = new List<string>(); // الجمل اللي بنجمعها حاليًا في الـ Chunk.
        var len = 0; // الطول الحالي للـ Chunk.

        foreach (var unit in units)
        {
            //لو إضافة الجملة الجديدة هتخلّي حجم الـ Chunk يتجاوز الحد المسموح، يبقى لازم نطلع الـ Chunk الحالي ونبدأ واحد جديد.
            if (len + unit.Length + 1 > max && current.Count > 0)
            {
                yield return string.Join(" ", current);//بنرجّع الـ Chunk الحالي.

                // عايزين نحتفظ بدل ما نبدأ من الصفر، بنحاول نحتفظ بآخر جمل من الـ Chunk السابق

                var keep = new List<string>();
                var keepLen = 0;
                for (int i = current.Count-1 ; i >=0 && keepLen + current[i].Length + 1 <=overlap ; i--) // ببدا الجمل بالعكس لاحظ إننا بنبدأ من آخر عنصر وبنرجع للخلف، ونضيف الجمل طالما حجمها داخل حدود الـ Overlap.
                {
                    keep.Insert(0, current[i]);// علشان نحافظ على ترتيب الجمل الأصلي؛ لأننا بنقرأها بالعكس.
                    keepLen += current[i].Length+1;
                }

                if (keepLen + unit.Length + 1 > max) 
                { 
                    keep.Clear();
                    keepLen = 0; 
                }
                current = keep;
                len = keepLen;
            }

            current.Add(unit);
            len += unit.Length + 1;
        }

        if (current.Count > 0) 
            yield return string.Join(" ", current);
    }

    public static IEnumerable<string> SplitLong(string sentance,int max)
    {
        if (sentance.Length <= max)
        {
            yield return sentance;
            yield break; // yield break معناها إنهاء الـ Iterator بالكامل، مش مجرد الخروج من الـ if.
        }
        var sb = new StringBuilder();
        foreach (var word in sentance.Split(' '))
        {
            if(sb.Length + word.Length + 1 >max && sb.Length > 0)
            {
                yield return sb.ToString();
                sb.Clear();
            }
            if (sb.Length > 0) sb.Append(' ');
            sb.Append(word);
        }

        if (sb.Length > 0)
            yield return sb.ToString();
    }

}