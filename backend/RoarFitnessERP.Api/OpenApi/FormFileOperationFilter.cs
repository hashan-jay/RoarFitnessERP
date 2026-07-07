using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace RoarFitnessERP.Api.OpenApi;

/// <summary>
/// Swashbuckle cannot document bare [FromForm] IFormFile parameters (or form models containing them).
/// This filter moves them into a multipart/form-data request body for OpenAPI/Scalar.
/// </summary>
public sealed class FormFileOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var formFileMembers = new List<(string Name, ApiParameterDescription Description)>();

        foreach (var description in context.ApiDescription.ParameterDescriptions)
        {
            if (description.Source != Microsoft.AspNetCore.Mvc.ModelBinding.BindingSource.Form)
                continue;

            foreach (var member in GetFormFileMembers(description.Type, description.Name))
                formFileMembers.Add((member, description));
        }

        if (formFileMembers.Count == 0)
            return;

        var properties = new Dictionary<string, IOpenApiSchema>();
        foreach (var (name, _) in formFileMembers)
        {
            properties[name] = new OpenApiSchema
            {
                Type = JsonSchemaType.String,
                Format = "binary",
            };
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = JsonSchemaType.Object,
                        Properties = properties,
                    },
                },
            },
        };

        if (operation.Parameters is null)
            return;

        var names = formFileMembers
            .Select(member => member.Description.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        for (var index = operation.Parameters.Count - 1; index >= 0; index--)
        {
            var name = operation.Parameters[index].Name;
            if (name is not null && names.Contains(name))
                operation.Parameters.RemoveAt(index);
        }
    }

    private static IEnumerable<string> GetFormFileMembers(Type type, string parameterName)
    {
        if (type == typeof(IFormFile) || type == typeof(IFormFileCollection))
        {
            yield return parameterName;
            yield break;
        }

        foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (property.PropertyType == typeof(IFormFile) || property.PropertyType == typeof(IFormFileCollection))
                yield return property.Name;
        }
    }
}
