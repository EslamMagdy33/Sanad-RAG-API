using System.Security.Claims;

namespace Sanad.Api.Extensions;

public static class ClaimsExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)=> 
        Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
