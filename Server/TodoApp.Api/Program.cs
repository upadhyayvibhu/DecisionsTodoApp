using TodoApp.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDataAccess();
builder.Services.AddErrorHandling();

var app = builder.Build();
// First in the pipeline so it can catch exceptions from everything after it
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "TodoApp API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
