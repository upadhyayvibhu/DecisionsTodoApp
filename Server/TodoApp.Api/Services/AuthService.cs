using TodoApp.Api.Exceptions;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;
using TodoApp.Api.Repositories;

namespace TodoApp.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository users, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = NormalizeEmail(request.Email);

        if (await _users.GetByEmailAsync(email, ct) is not null)
            throw new ConflictException("An account with this email already exists.");

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Password)
        };

        // Two simultaneous sign-ups can slip past the check above; the unique index
        // then raises a SQL error, which the global handler maps to 409 as well.
        user.Id = await _users.CreateAsync(user, ct);

        return _tokenService.CreateToken(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(NormalizeEmail(request.Email), ct);

        // Same message for "no such user" and "wrong password" so the API
        // does not reveal which emails are registered.
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        return _tokenService.CreateToken(user);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
