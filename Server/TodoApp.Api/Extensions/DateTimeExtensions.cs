namespace TodoApp.Api.Extensions;

public static class DateTimeExtensions
{
    // Dates are stored as UTC in SQL Server. A value read back has Kind = Unspecified,
    // so without this the JSON would carry no "Z" and the browser would treat it as local time.
    public static DateTime AsUtc(this DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}
