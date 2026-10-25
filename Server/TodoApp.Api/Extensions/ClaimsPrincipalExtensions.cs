using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using TodoApp.Api.Exceptions;

namespace TodoApp.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    // The user id lives in the token's "sub" claim. Every service call takes it
    // as a parameter, so data access is always scoped to the signed-in user.
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return int.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedException("The access token does not contain a valid user id.");
    }
}
