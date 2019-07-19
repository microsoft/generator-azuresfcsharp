#!/bin/bash
cd `dirname $0`
sfctl application upload --path <%= appPackage %> --show-progress
sfctl application provision --application-type-build-path <%= appPackage %>
sfctl application upgrade --app-id fabric:/<%= appName %> --app-version $1 --parameters "{}" --mode Monitored
cd -