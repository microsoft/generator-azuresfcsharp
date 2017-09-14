#!/bin/bash
DIR=`dirname $0`

dotnet restore $DIR/../<%= serviceProject %> -r ubuntu.16.04-x64 -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= serviceProject %> -v normal

CURDIR=`pwd`
cd `dirname $DIR/../<%= serviceProject %>`
dotnet publish --self-contained -r ubuntu.16.04-x64 -o $CURDIR/../<%= codePath %>
cd -
