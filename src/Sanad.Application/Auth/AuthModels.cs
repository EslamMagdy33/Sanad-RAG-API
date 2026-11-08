namespace Sanad.Application.Auth;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, DateTime ExpiresAt);
public record AuthResult(bool Succeeded, AuthResponse? Response, IReadOnlyList<string> Errors);
