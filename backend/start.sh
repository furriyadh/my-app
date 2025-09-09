#!/bin/bash

# تحديد المنفذ - استخدام PORT من متغير البيئة أو 5000 كقيمة افتراضية
PORT=${PORT:-5000}

echo "🚀 Starting Gunicorn on port $PORT"
echo "📊 Environment: $NODE_ENV"
echo "🔧 Workers: 4"
echo "⏱️  Timeout: 120s"
echo "📁 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la

# التحقق من وجود app.py
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found!"
    exit 1
fi

echo "✅ app.py found"

# بدء Gunicorn
echo "🔧 Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile - --log-level info app:app
