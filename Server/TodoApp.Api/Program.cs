using System.Text.Json.Serialization;
using TodoApp.Api.Extensions;
using TodoApp.Api.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddOpenApi(options => options.AddDocumentTransformer<BearerSecurityTransformer>());
builder.Services.AddDataAccess();
builder.Services.AddApplicationServices();
builder.Services.AddErrorHandling();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddClientCors(builder.Configuration);

var app = builder.Build();

// First in the pipeline so it can catch exceptions from everything after it
app.UseExceptionHandler();

// Turns empty 401/403/404 responses into ProblemDetails JSON too
app.UseStatusCodePages();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "TodoApp API v1");
        options.RoutePrefix = "swagger";
        options.EnablePersistAuthorization();
    });
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
