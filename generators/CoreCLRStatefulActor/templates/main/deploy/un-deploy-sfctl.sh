#!/bin/bash

sfctl application delete --application-id <%= appName %>
sfctl application unprovision --application-type-name <%= appTypeName %> --application-type-version 1.0.0
sfctl store delete --content-path <%= appPackage %>
