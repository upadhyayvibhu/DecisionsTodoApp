namespace DecisionsTodo.Api.Models;

public sealed class TodoItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TodoPriority Priority { get; set; } = TodoPriority.Medium;

    public TodoCategory Category { get; set; } = TodoCategory.Personal;

    public bool IsCompleted { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}