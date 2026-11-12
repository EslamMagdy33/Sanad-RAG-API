using Sanad.Api.Extensions;
using Sanad.Application.Interfaces;
using System.Security.Claims;

namespace Sanad.Api.Endpoints;

public static class DocumentEndpoints
{
    public static IEndpointRouteBuilder MapDocumentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/documents")
                       .WithTags("Documents")
                       .RequireAuthorization();

        group.MapPost("/", Upload).DisableAntiforgery();
        group.MapGet("/", List);
        group.MapGet("/{id:guid}", Get);
        group.MapDelete("/{id:guid}", Delete);
        return app;
    }

    private static async Task<IResult> Upload(IFormFile file, ClaimsPrincipal user,
        IDocumentService docs, CancellationToken ct)
    {
        await using var stream = file.OpenReadStream();
        var result = await docs.UploadAsync(user.GetUserId(), file.FileName,
            file.Length, stream, ct);

        return result.ToHttp(d => Results.Created($"/api/documents/{d.Id}", d));
    }

    private static async Task<IResult> List(ClaimsPrincipal user, IDocumentService docs, CancellationToken ct) =>
        Results.Ok(await docs.ListAsync(user.GetUserId(), ct));

    private static async Task<IResult> Get(Guid id, ClaimsPrincipal user, IDocumentService docs, CancellationToken ct)
    {
        var result = await docs.GetAsync(user.GetUserId(), id, ct);
        return result.ToHttp(d => Results.Ok(d));
    }

    private static async Task<IResult> Delete(Guid id, ClaimsPrincipal user, IDocumentService docs, CancellationToken ct) 
    {
        var result = await docs.DeleteAsync(user.GetUserId(), id, ct);
        return result.ToHttp(()=>Results.NoContent());
    }
        
}