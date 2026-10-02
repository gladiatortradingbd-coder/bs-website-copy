param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$paths = @(
  $ProjectRoot,
  (Join-Path $ProjectRoot ".next"),
  (Join-Path $ProjectRoot "node_modules")
)

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script from an elevated PowerShell window so Windows Defender exclusions can be applied."
}

if (-not (Get-Command Add-MpPreference -ErrorAction SilentlyContinue)) {
  throw "Windows Defender cmdlets are not available on this machine."
}

Add-MpPreference -ExclusionPath $paths
Write-Host "Added Windows Defender exclusions for:"
$paths | ForEach-Object { Write-Host "- $_" }