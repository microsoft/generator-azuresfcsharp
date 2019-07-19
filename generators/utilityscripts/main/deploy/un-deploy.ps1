
Remove-ServiceFabricApplication fabric:/<%= appName %> 
Unregister-ServiceFabricApplicationType <%= appTypeName %> 1.0.0
Remove-ServiceFabricApplicationPackage <%= appPackage %>