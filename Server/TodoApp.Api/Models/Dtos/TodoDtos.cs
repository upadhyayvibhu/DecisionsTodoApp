using TodoApp.Api.Models.Enums;

namespace TodoApp.Api.Models.Dtos;

public record CreateTodoRequest(
    string Title,
    string? Description,
    Priority Priority,
    int CategoryId,
    DateTime? DueDate);

public record UpdateTodoRequest(
    string Title,
    string? Description,
    Priority Priority,
    int CategoryId,
    DateTime? DueDate,
    bool IsCompleted);

public record TodoResponse(
    int Id,
    string Title,
    string? Description,
    Priority Priority,
    int CategoryId,
    string CategoryName,
    DateTime? DueDate,
    bool IsCompleted,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public class TodoQuery
{
    public string? Search { get; set; }
    public Priority? Priority { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsCompleted { get; set; }
    public string SortBy { get; set; } = "created";   // created | dueDate | priority
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
