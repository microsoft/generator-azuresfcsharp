Param(
  [Parameter(Mandatory=$true)]
  [string]$version
)

$AppPath = "$PSScriptRoot\<%= appPackage %>"
Copy-ServiceFabricApplicationPackage -ApplicationPackagePath $AppPath -ApplicationPackagePathInImageStore "<%= appPackage %>\$version" -ShowProgress
Register-ServiceFabricApplicationType -ApplicationPathInImageStore "<%= appPackage %>\$version"
Start-ServiceFabricApplicationUpgrade -ApplicationName fabric:/<%= appPackage %> -ApplicationTypeVersion $version -FailureAction Rollback -Monitored