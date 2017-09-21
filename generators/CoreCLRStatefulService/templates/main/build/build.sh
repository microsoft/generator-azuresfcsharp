#!/bin/bash
DIR=`dirname $0`

dotnet restore $DIR/../<%= serviceProject %> -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= serviceProject %> -v normal

CURDIR=`pwd`
cd `dirname $DIR/../<%= serviceProject %>`
dotnet publish -o $CURDIR/../<%= codePath %>
cd -