@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$here = (Get-Location).Path; $p = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($p) { $pids = $p | Select-Object -ExpandProperty OwningProcess -Unique; $stopped = 0; foreach ($id in $pids) { $proc = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $id) -ErrorAction SilentlyContinue; if ($proc -and $proc.CommandLine -like ('*' + $here + '*')) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue; $stopped++ } }; if ($stopped -gt 0) { Write-Host 'CampusSphere backend stopped.' } else { Write-Host 'No CampusSphere process was running on port 3000.' } } else { Write-Host 'Backend is not running.' }"
pause

