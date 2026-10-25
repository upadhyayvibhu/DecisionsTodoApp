using FluentValidation;
using TodoApp.Api.Models.Dtos;

namespace TodoApp.Api.Validators;

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(50).WithMessage("Category name must be 50 characters or fewer.");
    }
}
