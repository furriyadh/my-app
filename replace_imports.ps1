$files = Get-ChildItem -Path "c:\Users\DELL\my-site\src" -Recurse -Filter *.tsx
foreach ($file in $files) {
    if ($file.Name -eq "components_contents.txt" -or $file.Name -eq "ui_git_contents.txt") { continue }
    $content = Get-Content $file.FullName
    $newContent = $content -replace '@\/components\/UI\/', '@/components/ui/'
    if ($content -ne $newContent) {
        $newContent | Set-Content $file.FullName -Encoding UTF8
        Write-Output "Updated: $($file.FullName)"
    }
}
$files2 = Get-ChildItem -Path "c:\Users\DELL\my-site\src" -Recurse -Filter *.ts
foreach ($file in $files2) {
    $content = Get-Content $file.FullName
    $newContent = $content -replace '@\/components\/UI\/', '@/components/ui/'
    if ($content -ne $newContent) {
        $newContent | Set-Content $file.FullName -Encoding UTF8
        Write-Output "Updated: $($file.FullName)"
    }
}
Write-Output "Done replacing UI imports."
