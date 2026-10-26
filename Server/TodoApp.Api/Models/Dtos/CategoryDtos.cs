namespace TodoApp.Api.Models.Dtos;

public record CategoryResponse(int Id, string Name, bool IsSystem);

public record CreateCategoryRequest(string Name);
