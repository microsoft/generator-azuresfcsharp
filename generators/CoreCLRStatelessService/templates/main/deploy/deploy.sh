#!/bin/bash

cp dotnet-include.sh ./<%= appName %>/<%= serviceName %>Pkg/Code
sfctl application upload --path <%= appPackage %> --show-progress
sfctl application provision --application-type-build-path <%= appPackage %>
sfctl application create --app-name fabric:/<%= appName %> --app-type <%= appTypeName %> --app-version 1.0.0
