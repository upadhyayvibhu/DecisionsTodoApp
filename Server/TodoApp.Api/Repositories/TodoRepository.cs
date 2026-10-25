using System.Data;
using Dapper;
using TodoApp.Api.Data;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public TodoRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Todo?> GetByIdAsync(int id, int userId, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Todos_GetById",
            new { Id = id, UserId = userId },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        return await connection.QuerySingleOrDefaultAsync<Todo>(command);
    }

    public async Task<(IReadOnlyList<Todo> Items, int TotalCount)> SearchAsync(
        int userId, TodoQuery query, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Todos_Search",
            new
            {
                UserId = userId,
                query.Search,
                Priority = (byte?)query.Priority,
                query.CategoryId,
                query.IsCompleted,
                query.SortBy,
                query.Page,
                query.PageSize
            },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        var rows = (await connection.QueryAsync<TodoRow>(command)).ToList();

        // Every row carries the same TotalCount; an empty page means no matches
        var total = rows.Count > 0 ? rows[0].TotalCount : 0;
        return (rows, total);
    }

    // Id == 0 means a new todo (insert); otherwise update. Returns null when no row matched.
    public async Task<int?> UpsertAsync(Todo todo, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Todos_Upsert",
            new
            {
                Id = todo.Id == 0 ? (int?)null : todo.Id,
                todo.UserId,
                todo.CategoryId,
                todo.Title,
                todo.Description,
                Priority = (byte)todo.Priority,
                todo.DueDate,
                todo.IsCompleted
            },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        return await connection.ExecuteScalarAsync<int?>(command);
    }

    public async Task<bool> DeleteAsync(int id, int userId, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Todos_Delete",
            new { Id = id, UserId = userId },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        var rowsAffected = await connection.ExecuteAsync(command);
        return rowsAffected > 0;
    }

    // Maps the extra TotalCount column returned by usp_Todos_Search
    private sealed class TodoRow : Todo
    {
        public int TotalCount { get; set; }
    }
}
