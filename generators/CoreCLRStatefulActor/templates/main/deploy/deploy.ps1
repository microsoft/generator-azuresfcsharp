function Uninstall() {
    Write-Host "Uninstalling App as installation failed... Please try installation again."
    Invoke-Expression "& $PSScriptRoot\uninstall.ps1"
    Exit
}

$AppPath = "$PSScriptRoot\<%= appPackage %>"
Copy-ServiceFabricApplicationPackage -ApplicationPackagePath $AppPath -ApplicationPackagePathInImageStore <%= appPackage %> -ShowProgress
if (!$?) {
    Uninstall
}

Register-ServiceFabricApplicationType <%= appPackage %>
if (!$?) {
    Uninstall
}

New-ServiceFabricApplication fabric:/<%= appName %> <%= appTypeName %> 1.0.0
if (!$?) {
    Uninstall
}