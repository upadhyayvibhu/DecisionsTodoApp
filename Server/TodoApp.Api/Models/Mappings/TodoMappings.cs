using TodoApp.Api.Extensions;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Models.Entities;

namespace TodoApp.Api.Models.Mappings;

public static class TodoMappings
{
    public static TodoResponse ToResponse(this Todo todo) => new(
        todo.Id,
        todo.Title,
        todo.Description,
        todo.Priority,
        todo.CategoryId,
        todo.CategoryName,
        todo.DueDate?.AsUtc(),
        todo.IsCompleted,
        todo.CreatedAt.AsUtc(),
        todo.UpdatedAt?.AsUtc());
}
