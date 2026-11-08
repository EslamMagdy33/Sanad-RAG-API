// Auth/AuthService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Sanad.Application.Auth;
using Sanad.Application.Interfaces;
using Sanad.Infrastructure.Persistence.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Sanad.Infrastructure.Auth;

public class AuthService(UserManager<ApplicationUser> users, IOptions<JwtSettings> options) : IAuthService
{
    private readonly JwtSettings _jwt = options.Value;

    public async Task<AuthResult> RegisterAsync(RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email,
            Email = request.Email
        };

        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return new AuthResult(false, null, result.Errors.Select(e => e.Description).ToList());

        return new AuthResult(true, CreateToken(user), []);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null || !await users.CheckPasswordAsync(user, request.Password))
            return new AuthResult(false, null, ["Invalid email or password"]);

        return new AuthResult(true, CreateToken(user), []);
    }

    private AuthResponse CreateToken(ApplicationUser user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes);

        var token = new JwtSecurityToken(_jwt.Issuer, _jwt.Audience, claims,
            expires: expires, signingCredentials: creds);

        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}