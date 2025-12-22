$ErrorActionPreference = "Continue"
Write-Output "Starting deployment..."
git status
Write-Output "Adding files..."
git add .
Write-Output "Committing..."
git commit -m "Upload project to GitHub"
Write-Output "Renaming branch..."
git branch -M main
Write-Output "Configuring remote..."
if (git remote | Select-String "origin") {
    Write-Output "Setting existing remote URL..."
    git remote set-url origin https://github.com/furriyadh/my-app
} else {
    Write-Output "Adding new remote..."
    git remote add origin https://github.com/furriyadh/my-app
}
Write-Output "Pushing to origin main..."
git push -u origin main
Write-Output "Done."
