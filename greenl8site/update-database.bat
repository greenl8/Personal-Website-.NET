@echo off
echo Running Entity Framework migration...
dotnet ef migrations add AddVideoEmbedCodeAndExcerptToPosts
echo.
echo Updating database...
dotnet ef database update
echo.
echo Migration completed!
pause 