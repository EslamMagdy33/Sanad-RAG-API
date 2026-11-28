
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sanad.Application.Interfaces;
using Sanad.Infrastructure.Ai;
using Sanad.Infrastructure.Auth;
using Sanad.Infrastructure.Documents;
using Sanad.Infrastructure.Persistence;
using Sanad.Infrastructure.Persistence.Identity;
using Sanad.Infrastructure.Persistence.Repositories;

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
        services.AddScoped<IFileStorage, LocalFileStorage>();

        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.Configure<GeminiOptions>(config.GetSection("Gemini"));
        services.AddHttpClient<IEmbeddingService, GeminiEmbeddingService>(ConfigureGemini);
        services.AddHttpClient<ILlmService, GeminiLlmService>(ConfigureGemini);

        return services;
    }
    private static void ConfigureGemini(IServiceProvider sp, HttpClient client)
    {
        var o = sp.GetRequiredService<IOptions<GeminiOptions>>().Value;
        if (string.IsNullOrWhiteSpace(o.ApiKey))
            throw new InvalidOperationException("Gemini:ApiKey is missing. Set it with dotnet user-secrets.");

        client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/");
        client.DefaultRequestHeaders.Add("x-goog-api-key", o.ApiKey);
        client.Timeout = TimeSpan.FromMinutes(2);
    }
}