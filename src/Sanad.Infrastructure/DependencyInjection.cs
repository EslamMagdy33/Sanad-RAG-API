
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sanad.Application.Interfaces;
using Sanad.Infrastructure.Auth;
using Sanad.Infrastructure.Documents;
using Sanad.Infrastructure.Persistence;
using Sanad.Infrastructure.Persistence.Identity;

namespace Sanad.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<SanadDbContext>(o =>
            o.UseNpgsql(config.GetConnectionString("Default"), npg => npg.UseVector()));

        services.AddIdentityCore<ApplicationUser>(o => o.User.RequireUniqueEmail = true)
                .AddEntityFrameworkStores<SanadDbContext>();

        services.Configure<JwtSettings>(config.GetSection(JwtSettings.Section));
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDocumentTextExtractor, PdfTextExtractor>();

        return services;
    }
}