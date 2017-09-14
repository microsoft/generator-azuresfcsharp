#!/bin/bash
DIR=`dirname $0`
dotnet restore $DIR/../<%= interfaceProject %> -r ubuntu.16.04-x64 -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= interfaceProject %> -v normal

CURDIR=`pwd`
dotnet restore $DIR/../<%= serviceProject %> -r ubuntu.16.04-x64 -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= serviceProject %> -v normal
cd `dirname $DIR/../<%= serviceProject %>`
dotnet publish --self-contained -r ubuntu.16.04-x64 -o $CURDIR/../<%= codePath %>
cd -


dotnet restore $DIR/../<%= testProject %> -r ubuntu.16.04-x64 -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= testProject %> -v normal
cd `dirname $DIR/../<%= testProject %>`
dotnet publish --self-contained -r ubuntu.16.04-x64 -o $CURDIR/../<%= testCodePath %>
cd -
