using System.Data;
using Dapper;
using TodoApp.Api.Data;
using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> CreateAsync(User user, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Users_Create",
            new { user.FullName, user.Email, user.PasswordHash },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        return await connection.ExecuteScalarAsync<int>(command);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            "dbo.usp_Users_GetByEmail",
            new { Email = email },
            commandType: CommandType.StoredProcedure,
            cancellationToken: ct);

        return await connection.QuerySingleOrDefaultAsync<User>(command);
    }
}
