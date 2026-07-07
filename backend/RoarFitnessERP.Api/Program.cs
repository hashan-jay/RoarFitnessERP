using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.OpenApi;
using RoarFitnessERP.Api.Serialization;
using RoarFitnessERP.Api.Services;
using RoarFitnessERP.Api.Services.Interfaces;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// --- MVC, JSON serialization, and validation ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new AppDateTimeJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new AppNullableDateTimeJsonConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    e => e.Key,
                    e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray());

            return new BadRequestObjectResult(new
            {
                message = "Validation failed. Check required fields.",
                errors
            });
        };
    });
builder.Services.AddRoarFitnessOpenApi();

// --- Dependency injection: EF Core and application services ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IMembershipService, MembershipService>();
builder.Services.AddScoped<IPaymentGatewayService, PaymentGatewayService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IPosService, PosService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IPublicContentService, PublicContentService>();
builder.Services.AddScoped<ISpecialSessionService, SpecialSessionService>();
builder.Services.AddScoped<IMemberPlanService, MemberPlanService>();
builder.Services.AddScoped<IGeneralClassService, GeneralClassService>();
builder.Services.AddScoped<InstructorPhotoStorage>();

// --- JWT authentication (Bearer tokens; validated on every [Authorize] endpoint) ---
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddResponseCaching();

// --- CORS: allow local Vite dev servers; must run before auth middleware ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5190", "http://localhost:5200", "http://localhost:5210", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// --- Startup: ensure database exists, schema is current, and seed data ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.InitializeAsync();
}

if (app.Environment.IsDevelopment())
{
    // --- Development: Swagger UI and Scalar API reference ---
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Roar Fitness ERP API v1");
        c.RoutePrefix = "swagger";
    });

    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("Roar Fitness ERP API")
            .WithOpenApiRoutePattern("/swagger/{documentName}/swagger.json")
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseCors("Frontend");
app.UseResponseCaching();
// Static uploads (instructor photos) — served before MVC so /uploads/* bypasses controllers.
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        if (ctx.Context.Request.Path.StartsWithSegments("/uploads/instructors"))
        {
            ctx.Context.Response.Headers.CacheControl = "public,max-age=300";
        }
        else if (ctx.Context.Request.Path.StartsWithSegments("/uploads"))
        {
            ctx.Context.Response.Headers.CacheControl = "public,max-age=604800";
        }
    }
});
// Order matters: Authentication must precede Authorization on protected controllers.
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapControllers();

app.Run();
