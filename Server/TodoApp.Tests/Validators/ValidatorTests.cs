using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Enums;
using TodoApp.Api.Validators;

namespace TodoApp.Tests.Validators;

public class ValidatorTests
{
    private readonly CreateTodoRequestValidator _todoValidator = new();

    [Fact]
    public void CreateTodo_WithValidData_Passes()
    {
        var request = new CreateTodoRequest("Buy milk", null, Priority.Medium, 1, null);

        var result = _todoValidator.Validate(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void CreateTodo_WithEmptyTitle_Fails()
    {
        var request = new CreateTodoRequest("", null, Priority.Low, 1, null);

        var result = _todoValidator.Validate(request);

        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateTodoRequest.Title));
    }

    [Fact]
    public void CreateTodo_WithUnknownPriority_Fails()
    {
        var request = new CreateTodoRequest("Buy milk", null, (Priority)99, 1, null);

        var result = _todoValidator.Validate(request);

        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateTodoRequest.Priority));
    }

    [Fact]
    public void Register_WithWeakPassword_Fails()
    {
        var validator = new RegisterRequestValidator();
        var request = new RegisterRequest("Test User", "test@example.com", "password");

        var result = validator.Validate(request);

        Assert.Contains(result.Errors, e => e.PropertyName == nameof(RegisterRequest.Password));
    }

    [Fact]
    public void TodoQuery_WithOversizedPage_Fails()
    {
        var validator = new TodoQueryValidator();
        var query = new TodoQuery { PageSize = 500 };

        var result = validator.Validate(query);

        Assert.Contains(result.Errors, e => e.PropertyName == nameof(TodoQuery.PageSize));
    }
}
