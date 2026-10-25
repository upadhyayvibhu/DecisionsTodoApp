using FluentValidation;
using TodoApp.Api.Models.Dtos;

namespace TodoApp.Api.Validators;

public class TodoQueryValidator : AbstractValidator<TodoQuery>
{
    private static readonly string[] AllowedSortFields = { "created", "dueDate", "priority" };

    public TodoQueryValidator()
    {
        RuleFor(x => x.Search)
            .MaximumLength(100).WithMessage("Search text must be 100 characters or fewer.");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Priority must be Low, Medium or High.");

        RuleFor(x => x.SortBy)
            .Must(s => AllowedSortFields.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Sort by must be one of: created, dueDate, priority.");

        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1).WithMessage("Page must be 1 or greater.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100.");
    }
}
