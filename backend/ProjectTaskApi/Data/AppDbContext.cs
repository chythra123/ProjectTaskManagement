using Microsoft.EntityFrameworkCore;
using ProjectTaskApi.Models;

namespace ProjectTaskApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");

            entity.HasKey(p => p.ProjectId);

            entity.Property(p => p.ProjectName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(p => p.ClientName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(p => p.IsActive)
                .HasDefaultValue(true);

            entity.Property(p => p.CreatedOn)
                .HasDefaultValueSql("GETDATE()");

            entity.HasMany(p => p.Tasks)
                .WithOne(t => t.Project!)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");

            entity.HasKey(t => t.TaskId);

            entity.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(t => t.AssignedTo)
                .HasMaxLength(100);

            entity.Property(t => t.Status)
                .IsRequired()
                .HasMaxLength(30)
                .HasDefaultValue("New");

            entity.Property(t => t.CreatedOn)
                .HasDefaultValueSql("GETDATE()");
        });
    }
}

