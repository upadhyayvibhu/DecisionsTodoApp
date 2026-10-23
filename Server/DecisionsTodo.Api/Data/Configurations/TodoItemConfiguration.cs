using DecisionsTodo.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecisionsTodo.Api.Data.Configurations;

public sealed class TodoItemConfiguration : IEntityTypeConfiguration<TodoItem>
{
    public void Configure(EntityTypeBuilder<TodoItem> builder)
    {
        builder.ToTable("Todos", tableBuilder =>
        {
            tableBuilder.HasCheckConstraint(
                "CK_Todos_Priority",
                "[Priority] IN ('Low', 'Medium', 'High')");

            tableBuilder.HasCheckConstraint(
                "CK_Todos_Category",
                "[Category] IN ('Work', 'Personal')");
        });

        builder.HasKey(todo => todo.Id);

        builder.Property(todo => todo.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(todo => todo.Description)
            .HasMaxLength(2_000);

        builder.Property(todo => todo.Priority)
            .HasConversion<string>()
            .HasMaxLength(6)
            .IsRequired();

        builder.Property(todo => todo.Category)
            .HasConversion<string>()
            .HasMaxLength(8)
            .IsRequired();

        builder.Property(todo => todo.IsCompleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(todo => todo.CreatedAtUtc)
            .HasDefaultValueSql("SYSUTCDATETIME()")
            .IsRequired();

        builder.Property(todo => todo.UpdatedAtUtc);

        builder.HasIndex(todo => todo.CreatedAtUtc);
    }
}