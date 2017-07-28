#!/bin/bash
DIR=`dirname $0`

dotnet restore $DIR/../<%= serviceProject %> -s /opt/microsoft/sdk/servicefabric/csharp/packages -s https://dotnet.myget.org/F/dotnet-core/api/v3/index.json
dotnet build $DIR/../<%= serviceProject %> -v normal

CURDIR=`pwd`
cd `dirname $DIR/../<%= serviceProject %>`
dotnet publish -o $CURDIR/../<%= codePath %>
cd -
