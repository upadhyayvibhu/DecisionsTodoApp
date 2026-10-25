using System.Data;
using Dapper;
using TodoApp.Api.Data;
using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public CategoryRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Category>> GetForUserAsync(int userId, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Categories_GetForUser",
            new { UserId = userId },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        var categories = await connection.QueryAsync<Category>(command);
        return categories.ToList();
    }

    public async Task<Category?> GetByIdAsync(int id, int userId, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Categories_GetById",
            new { Id = id, UserId = userId },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        return await connection.QuerySingleOrDefaultAsync<Category>(command);
    }

    // Id == 0 means a new category (insert); otherwise rename. Returns null when no row matched.
    public async Task<int?> UpsertAsync(Category category, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Categories_Upsert",
            new
            {
                Id = category.Id == 0 ? (int?)null : category.Id,
                category.UserId,
                category.Name
            },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        return await connection.ExecuteScalarAsync<int?>(command);
    }
}
