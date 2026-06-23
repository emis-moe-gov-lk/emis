# add-hosts.ps1
#
# [  __ HOW_TO_RUN__ 
# [   + navigate to script file directory
# [   + enter following commands in a windows powershell terminal
# [
# [   > Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# [   > .\add-hosts.ps1

$hosts = @(
    "124.43.177.235 idp-uat.emis.moe.gov.lk",
    "124.43.177.235 idp-dev.emis.moe.gov.lk",
    "124.43.177.235 app-dev.emis.moe.gov.lk",
    "124.43.177.235 api-dev.emis.moe.gov.lk"
)

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"

# Must run as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Run this script as Administrator." -ForegroundColor Red
    exit 1
}

Write-Host "Adding EMIS UAT hosts to $hostsFile..."

$existingContent = Get-Content $hostsFile -Raw

foreach ($entry in $hosts) {
    $hostname = ($entry -split "\s+")[1]

    if ($existingContent -match [regex]::Escape($hostname)) {
        Write-Host "  [SKIP] $hostname already exists" -ForegroundColor Yellow
    } else {
        Add-Content -Path $hostsFile -Value $entry
        Write-Host "  [ADDED] $entry" -ForegroundColor Green
    }
}

# Flush DNS cache
ipconfig /flushdns | Out-Null
Write-Host "DNS cache flushed."
Write-Host "Done." -ForegroundColor Green
