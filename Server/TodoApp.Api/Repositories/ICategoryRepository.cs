using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Repositories;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetForUserAsync(int userId, CancellationToken ct = default);
    Task<Category?> GetByIdAsync(int id, int userId, CancellationToken ct = default);
    Task<int?> UpsertAsync(Category category, CancellationToken ct = default);
}
