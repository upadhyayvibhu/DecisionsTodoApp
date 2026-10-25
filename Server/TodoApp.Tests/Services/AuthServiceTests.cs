using NSubstitute;
using TodoApp.Api.Exceptions;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;
using TodoApp.Api.Repositories;
using TodoApp.Api.Services;
using Xunit;

namespace TodoApp.Tests.Services;

public class AuthServiceTests
{
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
    private readonly ITokenService _tokens = Substitute.For<ITokenService>();
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _service = new AuthService(_users, _hasher, _tokens);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ThrowsConflict()
    {
        _users.GetByEmailAsync("a@b.com", Arg.Any<CancellationToken>()).Returns(new User { Id = 1 });

        await Assert.ThrowsAsync<ConflictException>(() => _service.RegisterAsync(
            new RegisterRequest("Ann", "a@b.com", "Passw0rd1"), CancellationToken.None));
    }

    [Fact]
    public async Task Register_LowercasesEmailAndStoresHashedPassword()
    {
        _users.GetByEmailAsync("a@b.com", Arg.Any<CancellationToken>()).Returns((User?)null);
        _users.CreateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(7);
        _hasher.Hash("Passw0rd1").Returns("hashed");
        _tokens.CreateToken(Arg.Any<User>()).Returns(new AuthResponse("token", DateTime.UtcNow, "Ann", "a@b.com"));

        var result = await _service.RegisterAsync(
            new RegisterRequest("Ann", "  A@B.com ", "Passw0rd1"), CancellationToken.None);

        Assert.Equal("token", result.Token);
        await _users.Received(1).CreateAsync(
            Arg.Is<User>(u => u.Email == "a@b.com" && u.PasswordHash == "hashed"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Login_WithWrongPassword_ThrowsUnauthorized()
    {
        _users.GetByEmailAsync("a@b.com", Arg.Any<CancellationToken>())
            .Returns(new User { Id = 1, Email = "a@b.com", PasswordHash = "hashed" });
        _hasher.Verify("wrong", "hashed").Returns(false);

        await Assert.ThrowsAsync<UnauthorizedException>(() => _service.LoginAsync(
            new LoginRequest("a@b.com", "wrong"), CancellationToken.None));
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ThrowsUnauthorized()
    {
        _users.GetByEmailAsync("nobody@b.com", Arg.Any<CancellationToken>()).Returns((User?)null);

        await Assert.ThrowsAsync<UnauthorizedException>(() => _service.LoginAsync(
            new LoginRequest("nobody@b.com", "Passw0rd1"), CancellationToken.None));
    }
}
