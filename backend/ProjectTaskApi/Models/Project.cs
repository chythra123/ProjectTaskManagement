using System;
using System.Collections.Generic;

namespace ProjectTaskApi.Models;

public class Project
{
    public int ProjectId { get; set; }

    public string ProjectName { get; set; } = string.Empty;

    public string ClientName { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}

