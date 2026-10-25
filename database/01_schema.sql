IF DB_ID('TodoAppDb') IS NULL CREATE DATABASE TodoAppDb;
GO
USE TodoAppDb;
GO

CREATE TABLE dbo.Users (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    FullName     NVARCHAR(100) NOT NULL,
    Email        NVARCHAR(256) NOT NULL,
    PasswordHash NVARCHAR(200) NOT NULL,
    CreatedAt    DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Users_Email UNIQUE (Email)
);

CREATE TABLE dbo.Priorities (
    Id   TINYINT NOT NULL PRIMARY KEY,
    Name NVARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO dbo.Priorities (Id, Name) VALUES (1, 'Low'), (2, 'Medium'), (3, 'High');

-- UserId NULL = system category visible to everyone
CREATE TABLE dbo.Categories (
    Id        INT IDENTITY(1,1) PRIMARY KEY,
    UserId    INT NULL,
    Name      NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Categories_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Categories_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Categories_User_Name UNIQUE (UserId, Name)
);

INSERT INTO dbo.Categories (UserId, Name) VALUES (NULL, 'Work'), (NULL, 'Personal'), (NULL, 'Other');

CREATE TABLE dbo.Todos (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    UserId      INT NOT NULL,
    CategoryId  INT NOT NULL,
    Priority    TINYINT NOT NULL,
    Title       NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    DueDate     DATETIME2 NULL,
    IsCompleted BIT NOT NULL CONSTRAINT DF_Todos_IsCompleted DEFAULT 0,
    CreatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Todos_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt   DATETIME2 NULL,
    CONSTRAINT FK_Todos_Users      FOREIGN KEY (UserId)     REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Todos_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
    CONSTRAINT FK_Todos_Priorities FOREIGN KEY (Priority)   REFERENCES dbo.Priorities(Id)
);

-- Default listing: one user's todos, newest first
CREATE INDEX IX_Todos_User_Created
    ON dbo.Todos (UserId, CreatedAt DESC);

-- "View Work / View Personal" and status filters
CREATE INDEX IX_Todos_User_Category_Completed
    ON dbo.Todos (UserId, CategoryId, IsCompleted);
GO
