namespace TodoApp.Api.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message) { }

    public override int StatusCode => StatusCodes.Status404NotFound;
    public override string Title => "Resource not found";
}
