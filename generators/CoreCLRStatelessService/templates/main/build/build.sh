#!/bin/bash
DIR=`dirname $0`
./dotnet-include.sh

dotnet restore $DIR/../<%= serviceProject %> -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= serviceProject %> -v normal

CURDIR=`pwd`
cd `dirname $DIR/../<%= serviceProject %>`
dotnet publish -o $CURDIR/../<%= codePath %>
cd -
