// Endpoints/AuthEndpoints.cs
using System.Security.Claims;
using Sanad.Application.Auth;
using Sanad.Application.Interfaces;

namespace Sanad.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", Register);
        group.MapPost("/login", Login);
        group.MapGet("/me", Me).RequireAuthorization();

        return app;
    }

    private static async Task<IResult> Register(RegisterRequest req, IAuthService auth)
    {
        var r = await auth.RegisterAsync(req);
        return r.Succeeded ? Results.Ok(r.Response) : Results.BadRequest(new { errors = r.Errors });
    }

    private static async Task<IResult> Login(LoginRequest req, IAuthService auth)
    {
        var r = await auth.LoginAsync(req);
        return r.Succeeded ? Results.Ok(r.Response) : Results.Unauthorized();
    }

    private static IResult Me(ClaimsPrincipal user) => Results.Ok(new
    {
        id = user.FindFirstValue(ClaimTypes.NameIdentifier),
        email = user.FindFirstValue(ClaimTypes.Email)
    });
}