using TodoApp.Api.Exceptions;
using TodoApp.Api.Extensions;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;
using TodoApp.Api.Models.Mappings;
using TodoApp.Api.Repositories;

namespace TodoApp.Api.Services;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _todos;
    private readonly ICategoryRepository _categories;

    public TodoService(ITodoRepository todos, ICategoryRepository categories)
    {
        _todos = todos;
        _categories = categories;
    }

    public async Task<PagedResult<TodoResponse>> SearchAsync(int userId, TodoQuery query, CancellationToken ct = default)
    {
        var normalized = Normalize(query);
        var (items, totalCount) = await _todos.SearchAsync(userId, normalized, ct);

        return new PagedResult<TodoResponse>(
            items.Select(t => t.ToResponse()).ToList(),
            totalCount,
            normalized.Page,
            normalized.PageSize);
    }

    public async Task<TodoResponse> GetByIdAsync(int userId, int id, CancellationToken ct = default)
    {
        var todo = await _todos.GetByIdAsync(id, userId, ct)
                   ?? throw new NotFoundException($"Todo {id} was not found.");

        return todo.ToResponse();
    }

    public async Task<TodoResponse> CreateAsync(int userId, CreateTodoRequest request, CancellationToken ct = default)
    {
        await EnsureCategoryIsAvailableAsync(request.CategoryId, userId, ct);

        var todo = new Todo
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            Title = request.Title.Trim(),
            Description = CleanOptional(request.Description),
            Priority = request.Priority,
            DueDate = request.DueDate?.AsUtc()
        };

        var id = await _todos.UpsertAsync(todo, ct)
                 ?? throw new InvalidOperationException("Todo insert did not return an id.");

        return await GetByIdAsync(userId, id, ct);
    }

    public async Task<TodoResponse> UpdateAsync(int userId, int id, UpdateTodoRequest request, CancellationToken ct = default)
    {
        await EnsureCategoryIsAvailableAsync(request.CategoryId, userId, ct);

        var todo = new Todo
        {
            Id = id,
            UserId = userId,
            CategoryId = request.CategoryId,
            Title = request.Title.Trim(),
            Description = CleanOptional(request.Description),
            Priority = request.Priority,
            DueDate = request.DueDate?.AsUtc(),
            IsCompleted = request.IsCompleted
        };

        // The procedure returns NULL when no row matched this id for this user
        if (await _todos.UpsertAsync(todo, ct) is null)
            throw new NotFoundException($"Todo {id} was not found.");

        return await GetByIdAsync(userId, id, ct);
    }

    public async Task<TodoResponse> SetCompletedAsync(int userId, int id, bool isCompleted, CancellationToken ct = default)
    {
        var todo = await _todos.GetByIdAsync(id, userId, ct)
                   ?? throw new NotFoundException($"Todo {id} was not found.");

        todo.IsCompleted = isCompleted;
        await _todos.UpsertAsync(todo, ct);

        return todo.ToResponse();
    }

    public async Task DeleteAsync(int userId, int id, CancellationToken ct = default)
    {
        if (!await _todos.DeleteAsync(id, userId, ct))
            throw new NotFoundException($"Todo {id} was not found.");
    }

    // A category is usable if it is a system category or one the user owns
    private async Task EnsureCategoryIsAvailableAsync(int categoryId, int userId, CancellationToken ct)
    {
        if (await _categories.GetByIdAsync(categoryId, userId, ct) is null)
            throw new BadRequestException($"Category {categoryId} does not exist or is not available to you.");
    }

    private static TodoQuery Normalize(TodoQuery query) => new()
    {
        Search = CleanOptional(query.Search),
        Priority = query.Priority,
        CategoryId = query.CategoryId,
        IsCompleted = query.IsCompleted,
        SortBy = CanonicalSortField(query.SortBy),
        Page = query.Page,
        PageSize = query.PageSize
    };

    // The stored procedure compares against these exact names
    private static string CanonicalSortField(string sortBy) => sortBy.ToLowerInvariant() switch
    {
        "duedate" => "dueDate",
        "priority" => "priority",
        _ => "created"
    };

    private static string? CleanOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
