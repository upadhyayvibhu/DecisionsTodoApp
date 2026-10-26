using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Services;

public interface ITokenService
{
    AuthResponse CreateToken(User user);
}
