$AppPath = "$PSScriptRoot\<%= appPackage %>"
#$sdkInstallPath = (Get-ItemProperty 'HKLM:\Software\Microsoft\Service Fabric SDK').FabricSDKInstallPath
#$sfSdkPsModulePath = $sdkInstallPath + "Tools\PSModule\ServiceFabricSDK"
#Import-Module $sfSdkPsModulePath\ServiceFabricSDK.psm1

#Connect-ServiceFabricCluster -ConnectionEndpoint localhost:19000
Copy-ServiceFabricApplicationPackage -ApplicationPackagePath $AppPath -ApplicationPackagePathInImageStore <%= appPackage %>
Register-ServiceFabricApplicationType <%= appPackage %>
New-ServiceFabricApplication fabric:/<%= appName %> <%= appTypeName %> 1.0.0