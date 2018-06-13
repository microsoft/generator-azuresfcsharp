dotnet restore %~dp0\..\<%= interfaceProject %> -s https://api.nuget.org/v3/index.json
dotnet build %~dp0\..\<%= interfaceProject %> -v normal

dotnet restore %~dp0\..\<%= serviceProject %> -s https://api.nuget.org/v3/index.json
dotnet build %~dp0\..\<%= serviceProject %> -v normal
for %%F in ("%~dp0\..\<%= serviceProject %>") do cd %%~dpF
dotnet publish -o %~dp0\..\<%= codePath %>
cd %~dp0\..

dotnet restore %~dp0\..\<%= testProject %> -s https://api.nuget.org/v3/index.json
dotnet build %~dp0\..\<%= testProject %> -v normal
for %%F in ("%~dp0\..\<%= testProject %>") do cd %%~dpF
dotnet publish -o %~dp0\..\<%= testCodePath %>
cd %~dp0\..