using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.Extensions;
using TodoApp.Api.Models.Dtos;
using TodoApp.Api.Services;

namespace TodoApp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/todos")]
[Produces("application/json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
public class TodosController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodosController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    // Search, filter (priority, category, completed), sort and paginate in one endpoint
    [HttpGet]
    public async Task<ActionResult<PagedResult<TodoResponse>>> Search([FromQuery] TodoQuery query, CancellationToken ct)
        => Ok(await _todoService.SearchAsync(User.GetUserId(), query, ct));

    [HttpGet("{id:int}")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoResponse>> GetById(int id, CancellationToken ct)
        => Ok(await _todoService.GetByIdAsync(User.GetUserId(), id, ct));

    [HttpPost]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<TodoResponse>> Create(CreateTodoRequest request, CancellationToken ct)
    {
        var created = await _todoService.CreateAsync(User.GetUserId(), request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoResponse>> Update(int id, UpdateTodoRequest request, CancellationToken ct)
        => Ok(await _todoService.UpdateAsync(User.GetUserId(), id, request, ct));

    // Lightweight toggle for the completion checkbox
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoResponse>> SetStatus(int id, UpdateTodoStatusRequest request, CancellationToken ct)
        => Ok(await _todoService.SetCompletedAsync(User.GetUserId(), id, request.IsCompleted, ct));

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _todoService.DeleteAsync(User.GetUserId(), id, ct);
        return NoContent();
    }
}
