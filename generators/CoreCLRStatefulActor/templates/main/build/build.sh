#!/bin/bash
DIR=`dirname $0`
dotnet restore $DIR/../<%= interfaceProject %> -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= interfaceProject %> -v normal

CURDIR=`pwd`
dotnet restore $DIR/../<%= serviceProject %> -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= serviceProject %> -v normal
cd `dirname $DIR/../<%= serviceProject %>`
dotnet publish -o $CURDIR/../<%= codePath %>
cd -


dotnet restore $DIR/../<%= testProject %> -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= testProject %> -v normal
cd `dirname $DIR/../<%= testProject %>`
dotnet publish -o $CURDIR/../<%= testCodePath %>
cd -
