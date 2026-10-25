using TodoApp.Api.Models.Dtos;

namespace TodoApp.Api.Services;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(int userId, CancellationToken ct = default);
    Task<CategoryResponse> CreateAsync(int userId, CreateCategoryRequest request, CancellationToken ct = default);
    Task<CategoryResponse> RenameAsync(int userId, int id, UpdateCategoryRequest request, CancellationToken ct = default);
}
