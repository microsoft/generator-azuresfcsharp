dotnet restore %~dp0\..\<%= serviceProject %> -s https://api.nuget.org/v3/index.json
dotnet build %~dp0\..\<%= serviceProject %> -v normal

for %%F in ("<%= serviceProject %>") do cd %%~dpF
dotnet publish -o %~dp0\..\<%= codePath %>
cd %~dp0\..
