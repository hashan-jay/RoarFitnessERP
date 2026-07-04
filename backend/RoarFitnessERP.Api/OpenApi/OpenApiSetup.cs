using System.Reflection;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace RoarFitnessERP.Api.OpenApi;

/// <summary>Registers Swagger/OpenAPI documentation with JWT security and module tags.</summary>
public static class OpenApiSetup
{
    /// <summary>Adds API explorer, Swagger generation, Bearer auth scheme, and XML comment inclusion.</summary>
    public static IServiceCollection AddRoarFitnessOpenApi(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Roar Fitness ERP API",
                Version = "v1",
                Description = """
                    REST API for **Roar Fitness** gym ERP (Colombo, Sri Lanka).

                    ## Modules
                    - **Authentication** — login and JWT session
                    - **Membership** — packages, registration, admin member/instructor management
                    - **Payment Gateway** — PayHere membership payments
                    - **Attendance** — fingerprint scanner entry validation
                    - **Inventory** — stock management (Admin)
                    - **POS** — in-gym point of sale
                    - **Reports** — membership and POS revenue
                    - **Public** — website content (trainers, contact)

                    ## Auth
                    Use **Authorize** with a JWT from `POST /api/authentication/login`.
                    Default admin: `admin@roarfitness.lk` / `Admin@123`
                    """,
                Contact = new OpenApiContact
                {
                    Name = "Roar Fitness",
                    Email = "admin@roarfitness.lk"
                }
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "JWT Bearer token. Example: `Bearer {your token}`",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            });

            options.TagActionsBy(api =>
            {
                if (api.GroupName is not null)
                    return [api.GroupName];

                var controller = api.ActionDescriptor.RouteValues.TryGetValue("controller", out var name)
                    ? name
                    : "Default";

                return [MapControllerTag(controller)];
            });

            options.DocInclusionPredicate((_, _) => true);
            options.OrderActionsBy(apiDesc =>
            {
                apiDesc.ActionDescriptor.RouteValues.TryGetValue("controller", out var controller);
                return $"{MapControllerTag(controller)}_{apiDesc.HttpMethod}";
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
        });

        return services;
    }

    private static string MapControllerTag(string? controller) => controller switch
    {
        "Authentication" => "1. Authentication",
        "Membership" => "2. Membership",
        "PaymentGateway" => "3. Payment Gateway",
        "Attendance" => "4. Attendance",
        "Inventory" => "5. Inventory",
        "Pos" => "6. POS",
        "Reports" => "7. Reports",
        "Public" => "8. Public Website",
        _ => controller ?? "API"
    };
}
