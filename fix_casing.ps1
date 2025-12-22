
Write-Output "Renaming UI to ui_temp..."
git mv src/components/UI src/components/ui_temp
if (-not $?) { exit 1 }

Write-Output "Renaming ui_temp to ui..."
git mv src/components/ui_temp src/components/ui
if (-not $?) { exit 1 }

Write-Output "Committing changes..."
git commit -m "Fix casing of src/components/ui directory"
if (-not $?) { exit 1 }

Write-Output "Pushing changes..."
git push
