using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Repositories;

public interface ITodoRepository
{
    Task<Todo?> GetByIdAsync(int id, int userId, CancellationToken ct = default);
    Task<(IReadOnlyList<Todo> Items, int TotalCount)> SearchAsync(int userId, TodoQuery query, CancellationToken ct = default);
    Task<int?> UpsertAsync(Todo todo, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, int userId, CancellationToken ct = default);
}
