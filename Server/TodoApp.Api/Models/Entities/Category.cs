namespace TodoApp.Api.Models.Entities;

public class Category
{
    public int Id { get; set; }
    public int? UserId { get; set; }   // null = system category
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
