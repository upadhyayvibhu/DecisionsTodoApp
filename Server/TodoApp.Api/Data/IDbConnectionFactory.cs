using System.Data;

namespace TodoApp.Api.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
