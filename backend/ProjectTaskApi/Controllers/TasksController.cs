using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectTaskApi.Data;
using ProjectTaskApi.Models;

namespace ProjectTaskApi.Controllers;

[ApiController]
[Route("api")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/projects/{projectId}/tasks
    [HttpGet("projects/{projectId:int}/tasks")]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasksForProject(int projectId)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.ProjectId == projectId);
        if (!projectExists)
        {
            return NotFound($"Project with id {projectId} not found.");
        }

        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedOn)
            .ToListAsync();

        return Ok(tasks);
    }

    // GET: /api/tasks/{id}
    [HttpGet("tasks/{id:int}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var task = await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null)
        {
            return NotFound();
        }

        task.Project = null; // Prevent circular reference
        return Ok(task);
    }

    // POST: /api/projects/{projectId}/tasks
    [HttpPost("projects/{projectId:int}/tasks")]
    public async Task<ActionResult<TaskItem>> CreateTask(int projectId, TaskItem task)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.ProjectId == projectId);
        if (!projectExists)
        {
            return NotFound($"Project with id {projectId} not found.");
        }

        task.TaskId = 0;
        task.ProjectId = projectId;
        task.CreatedOn = DateTime.UtcNow;
        task.Project = null; // Prevent circular reference

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // Reload without navigation property to avoid circular reference
        var savedTask = await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.TaskId == task.TaskId);

        return CreatedAtAction(nameof(GetTask), new { id = savedTask!.TaskId }, savedTask);
    }

    // PUT: /api/tasks/{id}
    [HttpPut("tasks/{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItem updatedTask)
    {
        if (id != updatedTask.TaskId)
        {
            return BadRequest("Task ID mismatch.");
        }

        var existing = await _context.Tasks.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Title = updatedTask.Title;
        existing.Description = updatedTask.Description;
        existing.AssignedTo = updatedTask.AssignedTo;
        existing.Status = updatedTask.Status;
        existing.DueDate = updatedTask.DueDate;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/tasks/{id}
    [HttpDelete("tasks/{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

