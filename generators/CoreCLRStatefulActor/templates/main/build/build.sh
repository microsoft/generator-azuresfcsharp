#!/bin/bash
DIR=`dirname $0`

. /etc/os-release
linuxDistrib=$ID
if [ $linuxDistrib = "rhel" ]; then
  source scl_source enable rh-dotnet20
  exitCode=$?
  if [ $exitCode != 0 ]; then
    echo "Failed: source scl_source enable rh-dotnet20 : ExitCode: $exitCode"
    exit $exitCode
  fi
fi

dotnet restore $DIR/../<%= interfaceProject %> -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= interfaceProject %> -v normal

CURDIR=`pwd`
dotnet restore $DIR/../<%= serviceProject %> -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= serviceProject %> -v normal
cd `dirname $DIR/../<%= serviceProject %>`
dotnet publish -o $CURDIR/../<%= codePath %>
cd -


dotnet restore $DIR/../<%= testProject %> -s https://api.nuget.org/v3/index.json
dotnet build $DIR/../<%= testProject %> -v normal
cd `dirname $DIR/../<%= testProject %>`
dotnet publish -o $CURDIR/../<%= testCodePath %>
cd -
