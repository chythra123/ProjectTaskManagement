

IF DB_ID('ProjectTaskDb') IS NULL
BEGIN
    CREATE DATABASE ProjectTaskDb;
END
GO

USE ProjectTaskDb;
GO

IF OBJECT_ID('dbo.Tasks', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Tasks;
END
GO

IF OBJECT_ID('dbo.Projects', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Projects;
END
GO

CREATE TABLE dbo.Projects
(
    ProjectId    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProjectName  NVARCHAR(150)     NOT NULL,
    ClientName   NVARCHAR(150)     NOT NULL,
    StartDate    DATE              NOT NULL,
    EndDate      DATE              NULL,
    IsActive     BIT               NOT NULL CONSTRAINT DF_Projects_IsActive DEFAULT (1),
    CreatedOn    DATETIME          NOT NULL CONSTRAINT DF_Projects_CreatedOn DEFAULT (GETDATE())
);
GO

CREATE TABLE dbo.Tasks
(
    TaskId      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProjectId   INT               NOT NULL,
    Title       NVARCHAR(200)     NOT NULL,
    Description NVARCHAR(MAX)     NULL,
    AssignedTo  NVARCHAR(100)     NULL,
    Status      NVARCHAR(30)      NOT NULL CONSTRAINT DF_Tasks_Status DEFAULT ('New'),
    DueDate     DATE              NULL,
    CreatedOn   DATETIME          NOT NULL CONSTRAINT DF_Tasks_CreatedOn DEFAULT (GETDATE()),
    CONSTRAINT FK_Tasks_Projects
        FOREIGN KEY (ProjectId) REFERENCES dbo.Projects(ProjectId)
        ON DELETE CASCADE
);
GO

-- Sample data (optional – comment out if not needed)
INSERT INTO dbo.Projects (ProjectName, ClientName, StartDate, EndDate, IsActive)
VALUES
('Website Redesign', 'Acme Corp', GETDATE(), NULL, 1),
('Mobile App Development', 'Beta Ltd', GETDATE(), NULL, 1);

INSERT INTO dbo.Tasks (ProjectId, Title, Description, AssignedTo, Status, DueDate)
VALUES
(1, 'Create wireframes', 'Initial UX wireframes for homepage', 'Alice', 'InProgress', DATEADD(DAY, 7, GETDATE())),
(1, 'Setup CI/CD', 'Configure build and deployment pipeline', 'Bob', 'New', DATEADD(DAY, 14, GETDATE())),
(2, 'Design login screen', 'UI for login and registration', 'Charlie', 'New', DATEADD(DAY, 10, GETDATE()));
GO

