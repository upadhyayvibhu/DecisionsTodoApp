using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TodoApp.Api.Middleware;

// Runs before every controller action. For each action argument it looks up a
// FluentValidation validator and short-circuits with a 400 if validation fails.
public class ValidationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;

    public ValidationFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var errors = new Dictionary<string, List<string>>();

        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (_serviceProvider.GetService(validatorType) is not IValidator validator) continue;

            var result = await validator.ValidateAsync(
                new ValidationContext<object>(argument), context.HttpContext.RequestAborted);

            foreach (var failure in result.Errors)
            {
                var key = ToCamelCase(failure.PropertyName);
                if (!errors.TryGetValue(key, out var messages))
                {
                    messages = new List<string>();
                    errors[key] = messages;
                }
                messages.Add(failure.ErrorMessage);
            }
        }

        if (errors.Count > 0)
        {
            var problem = new ValidationProblemDetails(
                errors.ToDictionary(e => e.Key, e => e.Value.ToArray()))
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "One or more validation errors occurred.",
                Instance = context.HttpContext.Request.Path
            };
            problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

            context.Result = new BadRequestObjectResult(problem);
            return;
        }

        await next();
    }

    // JSON property names are camelCase, so error keys should match what the client sent.
    private static string ToCamelCase(string name) =>
        string.IsNullOrEmpty(name) ? name : char.ToLowerInvariant(name[0]) + name[1..];
}
