using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Repositories;

public interface IUserRepository
{
    Task<int> CreateAsync(User user, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
}
