using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace TodoApp.Api.OpenApi;

internal sealed class BearerSecurityTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes = new Dictionary<string, IOpenApiSecurityScheme>
        {
            ["Bearer"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Paste the token returned by /api/auth/login. The Bearer prefix is added for you."
            }
        };

        // Register and login are public; everything else needs the token
        foreach (var (route, pathItem) in document.Paths)
        {
            if (route.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase) || pathItem.Operations is null)
                continue;

            foreach (var operation in pathItem.Operations.Values)
            {
                operation.Security ??= [];
                operation.Security.Add(new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                });
            }
        }

        return Task.CompletedTask;
    }
}
