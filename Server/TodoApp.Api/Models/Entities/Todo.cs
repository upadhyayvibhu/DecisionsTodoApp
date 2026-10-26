using TodoApp.Api.Models.Enums;

namespace TodoApp.Api.Models.Entities;

public class Todo
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;   // filled by the JOIN in read procedures
    public Priority Priority { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
