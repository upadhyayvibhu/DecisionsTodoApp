using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TodoApp.Api.Exceptions;

namespace TodoApp.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private const int SqlUniqueConstraintViolation = 2627;
    private const int SqlUniqueIndexViolation = 2601;

    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, detail) = Map(exception);

        if (status >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception on {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);
        }
        else
        {
            _logger.LogWarning("{Title}: {Detail}", title, detail);
        }

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };
        problem.Extensions["traceId"] = httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(
            problem, options: null, contentType: "application/problem+json", cancellationToken);

        return true;
    }

    // Only AppException messages are safe to show. Anything unexpected gets a
    // generic message, and the real details go to the log, not the client.
    private static (int Status, string Title, string Detail) Map(Exception exception) => exception switch
    {
        AppException app => (app.StatusCode, app.Title, app.Message),

        SqlException { Number: SqlUniqueConstraintViolation or SqlUniqueIndexViolation } =>
            (StatusCodes.Status409Conflict, "Conflict", "A record with the same unique value already exists."),

        _ => (StatusCodes.Status500InternalServerError, "Server error",
              "An unexpected error occurred. Please try again later.")
    };
}
