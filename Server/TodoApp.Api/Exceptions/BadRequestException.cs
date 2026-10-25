namespace TodoApp.Api.Exceptions;

// For business-rule failures that input validation cannot catch,
// such as using a category that does not belong to the user.
public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message) { }

    public override int StatusCode => StatusCodes.Status400BadRequest;
    public override string Title => "Bad request";
}
