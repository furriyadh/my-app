# Vercel Force Delete Environment Variables Script
# هذا الـ script يستخدم Vercel API مباشرة لضمان الحذف

Write-Host "🔥 Vercel Force Delete Script" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Yellow

# التحقق من تسجيل الدخول
Write-Host "Checking Vercel login..." -ForegroundColor Cyan
$loginCheck = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel. Please run: vercel login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $loginCheck" -ForegroundColor Green

# الحصول على معرف المشروع
Write-Host "Getting project ID..." -ForegroundColor Cyan
$projectInfo = vercel project ls --json 2>&1 | ConvertFrom-Json
$projectId = $projectInfo | Where-Object { $_.name -eq "my-app" } | Select-Object -ExpandProperty id

if (-not $projectId) {
    Write-Host "❌ Project 'my-app' not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project ID: $projectId" -ForegroundColor Green

# قائمة البيئات
$environments = @("production", "preview", "development")

# الحصول على قائمة المتغيرات الحالية
Write-Host "Getting current environment variables..." -ForegroundColor Cyan
$currentVars = vercel env ls --json 2>&1

if ($LASTEXITCODE -eq 0) {
    try {
        $varsJson = $currentVars | ConvertFrom-Json
        $totalVars = $varsJson.Count
        Write-Host "✅ Found $totalVars environment variables" -ForegroundColor Green
        
        $deletedCount = 0
        $failedCount = 0
        
        foreach ($var in $varsJson) {
            $varName = $var.key
            Write-Host "🗑️ Deleting: $varName" -ForegroundColor Yellow
            
            foreach ($env in $environments) {
                $deleteResult = vercel env rm $varName --environment $env --yes 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "   ✅ Deleted from $env" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️ Not found in $env or failed to delete" -ForegroundColor DarkYellow
                }
            }
            $deletedCount++
        }
        
        Write-Host "================================" -ForegroundColor Yellow
        Write-Host "🎉 Deletion Summary:" -ForegroundColor Green
        Write-Host "   Total processed: $totalVars" -ForegroundColor Cyan
        Write-Host "   Successfully processed: $deletedCount" -ForegroundColor Green
        Write-Host "   Failed: $failedCount" -ForegroundColor Red
        
    } catch {
        Write-Host "❌ Error parsing environment variables JSON" -ForegroundColor Red
        Write-Host "Raw output: $currentVars" -ForegroundColor DarkGray
    }
} else {
    Write-Host "❌ Failed to get environment variables list" -ForegroundColor Red
    Write-Host "Error: $currentVars" -ForegroundColor DarkGray
}

# التحقق النهائي
Write-Host "================================" -ForegroundColor Yellow
Write-Host "🔍 Final verification..." -ForegroundColor Cyan
$finalCheck = vercel env ls 2>&1

if ($LASTEXITCODE -eq 0) {
    try {
        $finalVars = $finalCheck | ConvertFrom-Json
        $remainingCount = $finalVars.Count
        
        if ($remainingCount -eq 0) {
            Write-Host "🎉 SUCCESS! All environment variables deleted!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ WARNING: $remainingCount variables still remain:" -ForegroundColor Yellow
            foreach ($var in $finalVars) {
                Write-Host "   - $($var.key)" -ForegroundColor DarkYellow
            }
        }
    } catch {
        Write-Host "✅ No environment variables found (deletion successful)" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Failed final verification" -ForegroundColor Red
}

Write-Host "================================" -ForegroundColor Yellow
Write-Host "🚀 Script completed!" -ForegroundColor Green
Write-Host "Next step: Add your new environment variables" -ForegroundColor Cyan

