using System;

namespace ProjectTaskApi.Models;

public class TaskItem
{
    public int TaskId { get; set; }

    public int ProjectId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? AssignedTo { get; set; }

    public string Status { get; set; } = "New";

    public DateTime? DueDate { get; set; }

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public Project? Project { get; set; }
}

