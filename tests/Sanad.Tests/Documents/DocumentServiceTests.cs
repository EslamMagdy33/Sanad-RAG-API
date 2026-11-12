using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Sanad.Application.Documents;
using Sanad.Application.Interfaces;
using Sanad.Domain.Entities;
using Sanad.Domain.Enums;

namespace Sanad.Tests.Documents;

public class DocumentServiceTests
{
    private readonly IDocumentRepository _repo=Substitute.For<IDocumentRepository>();
    private readonly IUnitOfWork _uow=Substitute.For<IUnitOfWork>();
    private readonly IFileStorage _storage = Substitute.For<IFileStorage>();
    private readonly DocumentService _sut;

    private readonly Guid _userId = Guid.NewGuid();
    private readonly CancellationToken _ct = CancellationToken.None;

    public DocumentServiceTests()
    {
        _sut = new DocumentService(_repo,_uow,_storage);
        _storage.SaveAsync(default, default!, default!, default).ReturnsForAnyArgs("user/file.pdf");
    }
    private static MemoryStream PdfStream() => new("%PDF-1.7 fake content"u8.ToArray());

    // ---------- Upload: validation ----------
    [Fact]
    public async Task Upload_EmptyFile_ReturnsEmptyError()
    {
        var result = await _sut.UploadAsync(_userId, "a.pdf", 0, PdfStream(), _ct);

        Assert.False(result.IsSuccess);
        Assert.Equal(DocumentErrors.Empty.Code, result.Error!.Code);
    }
    [Fact]
    public async Task Upload_TooLarge_ReturnsTooLargeError()
    {
        var result = await _sut.UploadAsync(_userId, "a.pdf", 11 * 1024 * 1024, PdfStream(), _ct);

        Assert.Equal(DocumentErrors.TooLarge.Code, result.Error!.Code);
    }
    [Theory]
    [InlineData("a.exe")]
    [InlineData("a.docx")]
    [InlineData("noextension")]
    public async Task Upload_UnsupportedExtension_ReturnsUnsupportedTypeError(string name)
    {
        var result = await _sut.UploadAsync(_userId, name, 100, PdfStream(), _ct);

        Assert.Equal(DocumentErrors.UnsupportedType.Code, result.Error!.Code);
    }
    [Fact]
    public async Task Upload_FakePdf_ReturnsInvalidPdfError()
    {
        using var notPdf = new MemoryStream("hello world"u8.ToArray());

        var result = await _sut.UploadAsync(_userId, "fake.pdf", notPdf.Length, notPdf, _ct);

        Assert.Equal(DocumentErrors.InvalidPdf.Code, result.Error!.Code);
    }

    [Fact]
    public async Task Upload_TinyFile_ReturnsInvalidPdfError_NotException()
    {
        using var tiny = new MemoryStream("%P"u8.ToArray());

        var result = await _sut.UploadAsync(_userId, "tiny.pdf", tiny.Length, tiny, _ct);

        Assert.Equal(DocumentErrors.InvalidPdf.Code, result.Error!.Code);
    }

    [Fact]
    public async Task Upload_InvalidInput_NeverTouchesStorageOrDb()
    {
        await _sut.UploadAsync(_userId, "a.exe", 100, PdfStream(), _ct);

        await _storage.DidNotReceiveWithAnyArgs().SaveAsync(default, default!, default!, default);
        _repo.DidNotReceiveWithAnyArgs().Add(default!);
        await _uow.DidNotReceiveWithAnyArgs().SaveChangesAsync(default);
    }

    // ---------- Upload: success + failure ----------

    [Fact]
    public async Task Upload_ValidPdf_SavesDocumentAsPendingForTheUser()
    {
        Document? saved = null;
        _repo.When(r => r.Add(Arg.Any<Document>())).Do(c => saved = c.Arg<Document>());

        var result = await _sut.UploadAsync(_userId, "report.pdf", 500, PdfStream(), _ct);

        Assert.True(result.IsSuccess);
        Assert.NotNull(saved);
        Assert.Equal(_userId, saved!.UserId);
        Assert.Equal("report.pdf", saved.FileName);
        Assert.Equal(DocumentStatus.Pending, saved.Status);
        Assert.Equal("user/file.pdf", saved.StoragePath);
        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Upload_PathInFileName_IsStrippedToFileNameOnly()
    {
        Document? saved = null;
        _repo.When(r => r.Add(Arg.Any<Document>())).Do(c => saved = c.Arg<Document>());

        await _sut.UploadAsync(_userId, @"..\..\secret\report.pdf", 500, PdfStream(), _ct);

        Assert.Equal("report.pdf", saved!.FileName);
    }

    [Fact]
    public async Task Upload_WhenDbFails_DeletesStoredFileAndRethrows()
    {
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("db down"));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _sut.UploadAsync(_userId, "a.pdf", 500, PdfStream(), _ct));

        _storage.Received(1).Delete("user/file.pdf");
    }

    // ---------- Get / Delete ----------

    [Fact]
    public async Task Get_AsksRepositoryForThatUsersDocumentOnly()
    {
        var id = Guid.NewGuid();
        _repo.GetAsync(_userId, id, Arg.Any<CancellationToken>()).Returns((Document?)null);

        var result = await _sut.GetAsync(_userId, id, _ct);

        Assert.Equal(DocumentErrors.NotFound.Code, result.Error!.Code);
        await _repo.Received(1).GetAsync(_userId, id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Delete_NotFound_ReturnsErrorAndDeletesNothing()
    {
        _repo.GetAsync(_userId, Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Document?)null);

        var result = await _sut.DeleteAsync(_userId, Guid.NewGuid(), _ct);

        Assert.Equal(DocumentErrors.NotFound.Code, result.Error!.Code);
        _repo.DidNotReceiveWithAnyArgs().Remove(default!);
        _storage.DidNotReceiveWithAnyArgs().Delete(default!);
    }

    [Fact]
    public async Task Delete_Found_RemovesFromDbBeforeDeletingTheFile()
    {
        var doc = new Document { Id = Guid.NewGuid(), UserId = _userId, StoragePath = "user/file.pdf" };
        _repo.GetAsync(_userId, doc.Id, Arg.Any<CancellationToken>()).Returns(doc);

        var result = await _sut.DeleteAsync(_userId, doc.Id, _ct);

        Assert.True(result.IsSuccess);
        Received.InOrder(() =>
        {
            _repo.Remove(doc);
            _uow.SaveChangesAsync(Arg.Any<CancellationToken>());
            _storage.Delete("user/file.pdf");
        });
    }


}
