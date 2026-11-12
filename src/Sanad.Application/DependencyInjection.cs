using Microsoft.Extensions.DependencyInjection;
using Sanad.Application.Documents;
using Sanad.Application.Interfaces;

namespace Sanad.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IDocumentService, DocumentService>();
        return services;
    }
}