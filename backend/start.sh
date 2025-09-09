#!/bin/bash

# تحديد المنفذ - استخدام PORT من متغير البيئة أو 5000 كقيمة افتراضية
PORT=${PORT:-5000}

echo "🚀 Starting Gunicorn on port $PORT"
echo "📊 Environment: $NODE_ENV"
echo "🔧 Workers: 4"
echo "⏱️  Timeout: 120s"

# بدء Gunicorn
exec gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile - app:app
