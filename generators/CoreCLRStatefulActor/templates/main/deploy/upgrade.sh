#!/bin/bash
cd `dirname $0`
sfctl application upload --path <%= appPackage %> --show-progress
sfctl application provision --application-type-build-path <%= appPackage %>
sfctl application upgrade --app-name fabric:/<%= appName %> --app-type <%= appTypeName %> --app-version $1 --mode Monitored
cd -