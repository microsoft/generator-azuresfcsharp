#!/bin/bash

azure servicefabric application package copy <%= appName %> fabric:ImageStore
azure servicefabric application type register <%= appName %>
azure servicefabric application create fabric:/<%= appName %>  <%= appTypeName %> 1.0.0


