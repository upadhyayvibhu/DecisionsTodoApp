namespace TodoApp.Api.Exceptions;

public class ConflictException : AppException
{
    public ConflictException(string message) : base(message) { }

    public override int StatusCode => StatusCodes.Status409Conflict;
    public override string Title => "Conflict";
}
