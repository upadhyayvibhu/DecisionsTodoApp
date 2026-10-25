using NSubstitute;
using TodoApp.Api.Exceptions;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;
using TodoApp.Api.Models.Enums;
using TodoApp.Api.Repositories;
using TodoApp.Api.Services;
using Xunit;

namespace TodoApp.Tests.Services;

public class TodoServiceTests
{
    private const int UserId = 1;

    private readonly ITodoRepository _todos = Substitute.For<ITodoRepository>();
    private readonly ICategoryRepository _categories = Substitute.For<ICategoryRepository>();
    private readonly TodoService _service;

    public TodoServiceTests()
    {
        _service = new TodoService(_todos, _categories);
    }

    [Fact]
    public async Task GetById_WhenTodoDoesNotExist_ThrowsNotFound()
    {
        _todos.GetByIdAsync(99, UserId, Arg.Any<CancellationToken>()).Returns((Todo?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _service.GetByIdAsync(UserId, 99, CancellationToken.None));
    }

    [Fact]
    public async Task Create_WithUnavailableCategory_ThrowsBadRequestAndDoesNotSave()
    {
        _categories.GetByIdAsync(42, UserId, Arg.Any<CancellationToken>()).Returns((Category?)null);
        var request = new CreateTodoRequest("Write tests", null, Priority.High, 42, null);

        await Assert.ThrowsAsync<BadRequestException>(
            () => _service.CreateAsync(UserId, request, CancellationToken.None));

        await _todos.DidNotReceive().UpsertAsync(Arg.Any<Todo>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Create_TrimsTitleAndReturnsSavedTodo()
    {
        _categories.GetByIdAsync(1, UserId, Arg.Any<CancellationToken>())
            .Returns(new Category { Id = 1, Name = "Work" });
        _todos.UpsertAsync(Arg.Any<Todo>(), Arg.Any<CancellationToken>()).Returns(10);
        _todos.GetByIdAsync(10, UserId, Arg.Any<CancellationToken>()).Returns(new Todo
        {
            Id = 10, UserId = UserId, CategoryId = 1, CategoryName = "Work",
            Title = "Write tests", Priority = Priority.High
        });

        var result = await _service.CreateAsync(
            UserId, new CreateTodoRequest("  Write tests  ", null, Priority.High, 1, null), CancellationToken.None);

        Assert.Equal(10, result.Id);
        await _todos.Received(1).UpsertAsync(
            Arg.Is<Todo>(t => t.Id == 0 && t.UserId == UserId && t.Title == "Write tests"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Update_WhenNoRowMatches_ThrowsNotFound()
    {
        _categories.GetByIdAsync(1, UserId, Arg.Any<CancellationToken>())
            .Returns(new Category { Id = 1, Name = "Work" });
        _todos.UpsertAsync(Arg.Any<Todo>(), Arg.Any<CancellationToken>()).Returns((int?)null);
        var request = new UpdateTodoRequest("Title", null, Priority.Low, 1, null, false);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _service.UpdateAsync(UserId, 5, request, CancellationToken.None));
    }

    [Fact]
    public async Task Delete_WhenNothingWasDeleted_ThrowsNotFound()
    {
        _todos.DeleteAsync(5, UserId, Arg.Any<CancellationToken>()).Returns(false);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _service.DeleteAsync(UserId, 5, CancellationToken.None));
    }

    [Fact]
    public async Task SetCompleted_ChangesOnlyTheFlag()
    {
        var existing = new Todo
        {
            Id = 5, UserId = UserId, CategoryId = 2, CategoryName = "Personal",
            Title = "Call home", Priority = Priority.Low, IsCompleted = false
        };
        _todos.GetByIdAsync(5, UserId, Arg.Any<CancellationToken>()).Returns(existing);
        _todos.UpsertAsync(Arg.Any<Todo>(), Arg.Any<CancellationToken>()).Returns(5);

        var result = await _service.SetCompletedAsync(UserId, 5, true, CancellationToken.None);

        Assert.True(result.IsCompleted);
        await _todos.Received(1).UpsertAsync(
            Arg.Is<Todo>(t => t.Id == 5 && t.IsCompleted && t.Title == "Call home" && t.CategoryId == 2),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Search_NormalizesTextAndSortFieldBeforeQueryingRepository()
    {
        IReadOnlyList<Todo> none = new List<Todo>();
        _todos.SearchAsync(UserId, Arg.Any<TodoQuery>(), Arg.Any<CancellationToken>()).Returns((none, 0));

        var result = await _service.SearchAsync(
            UserId, new TodoQuery { Search = "  milk  ", SortBy = "DUEDATE" }, CancellationToken.None);

        Assert.Equal(0, result.TotalCount);
        await _todos.Received(1).SearchAsync(
            UserId,
            Arg.Is<TodoQuery>(q => q.Search == "milk" && q.SortBy == "dueDate"),
            Arg.Any<CancellationToken>());
    }
}
