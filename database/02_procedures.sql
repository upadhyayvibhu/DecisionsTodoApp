USE TodoAppDb;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Users_Create
    @FullName NVARCHAR(100), @Email NVARCHAR(256), @PasswordHash NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Users (FullName, Email, PasswordHash)
    VALUES (@FullName, @Email, @PasswordHash);
    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Users_GetByEmail
    @Email NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, FullName, Email, PasswordHash, CreatedAt
    FROM dbo.Users WHERE Email = @Email;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Categories_GetForUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, UserId, Name, CreatedAt
    FROM dbo.Categories
    WHERE UserId IS NULL OR UserId = @UserId
    ORDER BY CASE WHEN UserId IS NULL THEN 0 ELSE 1 END, Name;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Categories_GetById
    @Id INT, @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, UserId, Name, CreatedAt
    FROM dbo.Categories
    WHERE Id = @Id AND (UserId IS NULL OR UserId = @UserId);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Categories_Upsert
    @Id     INT = NULL,
    @UserId INT,
    @Name   NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL
    BEGIN
        INSERT INTO dbo.Categories (UserId, Name) VALUES (@UserId, @Name);
        SELECT CAST(SCOPE_IDENTITY() AS INT);
        RETURN;
    END

    -- UserId = @UserId means system categories (UserId NULL) can never be renamed
    UPDATE dbo.Categories SET Name = @Name
    WHERE Id = @Id AND UserId = @UserId;

    SELECT CASE WHEN @@ROWCOUNT > 0 THEN @Id ELSE NULL END;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Todos_GetById
    @Id INT, @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT t.Id, t.UserId, t.CategoryId, c.Name AS CategoryName, t.Priority,
           t.Title, t.Description, t.DueDate, t.IsCompleted, t.CreatedAt, t.UpdatedAt
    FROM dbo.Todos t
    JOIN dbo.Categories c ON c.Id = t.CategoryId
    WHERE t.Id = @Id AND t.UserId = @UserId;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Todos_Search
    @UserId INT,
    @Search NVARCHAR(100) = NULL,
    @Priority TINYINT = NULL,
    @CategoryId INT = NULL,
    @IsCompleted BIT = NULL,
    @SortBy NVARCHAR(20) = 'created',
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT t.Id, t.UserId, t.CategoryId, c.Name AS CategoryName, t.Priority,
           t.Title, t.Description, t.DueDate, t.IsCompleted, t.CreatedAt, t.UpdatedAt,
           COUNT(*) OVER() AS TotalCount
    FROM dbo.Todos t
    JOIN dbo.Categories c ON c.Id = t.CategoryId
    WHERE t.UserId = @UserId
      AND (@Search IS NULL OR t.Title LIKE '%' + @Search + '%' OR t.Description LIKE '%' + @Search + '%')
      AND (@Priority IS NULL OR t.Priority = @Priority)
      AND (@CategoryId IS NULL OR t.CategoryId = @CategoryId)
      AND (@IsCompleted IS NULL OR t.IsCompleted = @IsCompleted)
    ORDER BY
        CASE WHEN @SortBy = 'dueDate' THEN CASE WHEN t.DueDate IS NULL THEN 1 ELSE 0 END END ASC,
        CASE WHEN @SortBy = 'dueDate' THEN t.DueDate END ASC,
        CASE WHEN @SortBy = 'priority' THEN t.Priority END DESC,
        t.CreatedAt DESC
    OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY
    OPTION (RECOMPILE);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Todos_Upsert
    @Id          INT = NULL,          -- NULL = insert, value = update
    @UserId      INT,
    @CategoryId  INT,
    @Title       NVARCHAR(200),
    @Description NVARCHAR(1000) = NULL,
    @Priority    TINYINT,
    @DueDate     DATETIME2 = NULL,
    @IsCompleted BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL
    BEGIN
        INSERT INTO dbo.Todos (UserId, CategoryId, Title, Description, Priority, DueDate, IsCompleted)
        VALUES (@UserId, @CategoryId, @Title, @Description, @Priority, @DueDate, @IsCompleted);

        SELECT CAST(SCOPE_IDENTITY() AS INT);
        RETURN;
    END

    UPDATE dbo.Todos
    SET CategoryId  = @CategoryId,
        Title       = @Title,
        Description = @Description,
        Priority    = @Priority,
        DueDate     = @DueDate,
        IsCompleted = @IsCompleted,
        UpdatedAt   = SYSUTCDATETIME()
    WHERE Id = @Id AND UserId = @UserId;

    -- Returns the Id on success, NULL when no row matched (missing or not the user's)
    SELECT CASE WHEN @@ROWCOUNT > 0 THEN @Id ELSE NULL END;
END
GO

-- No SET NOCOUNT ON here: Dapper's ExecuteAsync returns the affected row count,
-- which the repository uses to report "not found".
CREATE OR ALTER PROCEDURE dbo.usp_Todos_Delete
    @Id INT, @UserId INT
AS
BEGIN
    DELETE FROM dbo.Todos WHERE Id = @Id AND UserId = @UserId;
END
GO
