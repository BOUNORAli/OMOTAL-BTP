param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$Container = "omotal-postgres",
  [string]$Database = "omotal",
  [string]$User = "omotal"
)

$ErrorActionPreference = "Stop"
$resolved = Resolve-Path -Path $BackupFile | Select-Object -ExpandProperty Path
Get-Content -Raw -Path $resolved | docker exec -i $Container psql -U $User -d $Database
Write-Host "Restore completed from $resolved"
