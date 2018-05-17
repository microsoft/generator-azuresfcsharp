$AppPath = "$PSScriptRoot\<%= appPackage %>"
Copy-ServiceFabricApplicationPackage -ApplicationPackagePath $AppPath -ApplicationPackagePathInImageStore <%= appPackage %>
Register-ServiceFabricApplicationType <%= appPackage %>
New-ServiceFabricApplication fabric:/<%= appName %> <%= appTypeName %> 1.0.0