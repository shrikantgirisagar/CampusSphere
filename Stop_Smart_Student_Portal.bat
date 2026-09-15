@echo off
powershell -NoProfile -Command "$p=Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if($p){$p | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {Stop-Process -Id $_ -Force}; Write-Host 'CampusSphere backend stopped.'} else {Write-Host 'Backend is not running.'}"
pause
