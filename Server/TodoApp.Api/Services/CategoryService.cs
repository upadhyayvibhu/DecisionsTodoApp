using TodoApp.Api.Exceptions;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;
using TodoApp.Api.Repositories;

namespace TodoApp.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categories;

    public CategoryService(ICategoryRepository categories)
    {
        _categories = categories;
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(int userId, CancellationToken ct = default)
    {
        var categories = await _categories.GetForUserAsync(userId, ct);

        return categories
            .Select(c => new CategoryResponse(c.Id, c.Name, IsSystem: c.UserId is null))
            .ToList();
    }

    public async Task<CategoryResponse> CreateAsync(int userId, CreateCategoryRequest request, CancellationToken ct = default)
    {
        var name = request.Name.Trim();
        await EnsureNameIsAvailableAsync(userId, name, excludeId: null, ct);

        var id = await _categories.UpsertAsync(new Category { UserId = userId, Name = name }, ct)
                 ?? throw new InvalidOperationException("Category insert did not return an id.");

        return new CategoryResponse(id, name, IsSystem: false);
    }

    public async Task<CategoryResponse> RenameAsync(int userId, int id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var existing = await _categories.GetByIdAsync(id, userId, ct)
                       ?? throw new NotFoundException($"Category {id} was not found.");

        if (existing.UserId is null)
            throw new BadRequestException("System categories cannot be renamed.");

        var name = request.Name.Trim();
        await EnsureNameIsAvailableAsync(userId, name, excludeId: id, ct);

        var updated = await _categories.UpsertAsync(new Category { Id = id, UserId = userId, Name = name }, ct);
        if (updated is null)
            throw new NotFoundException($"Category {id} was not found.");

        return new CategoryResponse(id, name, IsSystem: false);
    }

    // Names are compared across system and personal categories so the user never
    // ends up with two "Work" entries in the same list.
    private async Task EnsureNameIsAvailableAsync(int userId, string name, int? excludeId, CancellationToken ct)
    {
        var visible = await _categories.GetForUserAsync(userId, ct);

        var taken = visible.Any(c =>
            c.Id != excludeId && string.Equals(c.Name, name, StringComparison.OrdinalIgnoreCase));

        if (taken)
            throw new ConflictException($"A category named '{name}' already exists.");
    }
}
