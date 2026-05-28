param(
  [string]$Container = "omotal-postgres",
  [string]$Database = "omotal",
  [string]$User = "omotal",
  [string]$OutputDir = "backups"
)

$ErrorActionPreference = "Stop"
$resolvedOutput = Resolve-Path -Path "." | Select-Object -ExpandProperty Path
$backupDir = Join-Path $resolvedOutput $OutputDir
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $backupDir "omotal-$timestamp.sql"

docker exec $Container pg_dump -U $User -d $Database | Out-File -FilePath $target -Encoding utf8
Write-Host "Backup written to $target"
