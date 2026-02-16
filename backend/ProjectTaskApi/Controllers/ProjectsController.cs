using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectTaskApi.Data;
using ProjectTaskApi.Models;

namespace ProjectTaskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        var projects = await _context.Projects
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedOn)
            .ToListAsync();

        return Ok(projects);
    }

    // GET: /api/projects/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Project>> GetProject(int id)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null)
        {
            return NotFound();
        }

        return Ok(project);
    }

    // POST: /api/projects
    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject(Project project)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        project.ProjectId = 0;
        project.CreatedOn = DateTime.UtcNow;

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
    }

    // PUT: /api/projects/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProject(int id, Project updatedProject)
    {
        if (id != updatedProject.ProjectId)
        {
            return BadRequest("Project ID mismatch.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existing = await _context.Projects.FindAsync(id);

        if (existing == null)
        {
            return NotFound();
        }

        existing.ProjectName = updatedProject.ProjectName;
        existing.ClientName = updatedProject.ClientName;
        existing.StartDate = updatedProject.StartDate;
        existing.EndDate = updatedProject.EndDate;
        existing.IsActive = updatedProject.IsActive;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/projects/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

