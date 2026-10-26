using TodoApp.Api.Models.Dtos;

namespace TodoApp.Api.Services;

public interface ITodoService
{
    Task<PagedResult<TodoResponse>> SearchAsync(int userId, TodoQuery query, CancellationToken ct = default);
    Task<TodoResponse> GetByIdAsync(int userId, int id, CancellationToken ct = default);
    Task<TodoResponse> CreateAsync(int userId, CreateTodoRequest request, CancellationToken ct = default);
    Task<TodoResponse> UpdateAsync(int userId, int id, UpdateTodoRequest request, CancellationToken ct = default);
    Task<TodoResponse> SetCompletedAsync(int userId, int id, bool isCompleted, CancellationToken ct = default);
    Task DeleteAsync(int userId, int id, CancellationToken ct = default);
}
