using FluentValidation;
using TodoApp.Api.Models.Dtos;

namespace TodoApp.Api.Validators;

public class CreateTodoRequestValidator : AbstractValidator<CreateTodoRequest>
{
    public CreateTodoRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must be 200 characters or fewer.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must be 1000 characters or fewer.");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Priority must be Low, Medium or High.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Choose a category.");
    }
}
