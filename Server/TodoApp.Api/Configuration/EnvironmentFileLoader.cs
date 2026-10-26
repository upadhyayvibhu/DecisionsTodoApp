namespace TodoApp.Api.Configuration;

/// <summary>
/// Loads simple KEY=value entries from a local .env file without committing secrets.
/// Real environment variables always win, so production hosts can manage secrets safely.
/// </summary>
public static class EnvironmentFileLoader
{
    public static void Load(string contentRootPath)
    {
        var filePath = Path.Combine(contentRootPath, ".env");
        if (!File.Exists(filePath)) return;

        foreach (var line in File.ReadLines(filePath))
        {
            var trimmedLine = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith('#')) continue;

            var equalsIndex = trimmedLine.IndexOf('=');
            if (equalsIndex <= 0) continue;

            var key = trimmedLine[..equalsIndex].Trim();
            var value = trimmedLine[(equalsIndex + 1)..].Trim().Trim('"');

            // Do not overwrite a value explicitly supplied by the machine or host.
            if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key)))
            {
                Environment.SetEnvironmentVariable(key, value);
            }
        }
    }
}
