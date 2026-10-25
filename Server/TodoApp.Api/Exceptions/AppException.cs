namespace TodoApp.Api.Exceptions;

// Base type for errors the API raises on purpose. The global handler
// reads StatusCode and Title instead of switching on every subclass.
public abstract class AppException : Exception
{
    protected AppException(string message) : base(message) { }

    public abstract int StatusCode { get; }
    public abstract string Title { get; }
}
