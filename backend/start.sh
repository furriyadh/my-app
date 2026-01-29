#!/bin/bash

# تحديد المنفذ - استخدام PORT من متغير البيئة أو 5000 كقيمة افتراضية
PORT=${PORT:-5000}

echo "🚀 Starting Gunicorn on port $PORT"
echo "📊 Environment: $NODE_ENV"
echo "🔧 Workers: 1 (gthread) - Required for Socket.IO without Redis"
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

# اختبار Python و app.py قبل بدء Gunicorn
echo "🐍 Testing Python..."
python --version

echo "📦 Testing app.py import..."
python -c "import app; print('✅ app.py imported successfully')"

# 🔧 بدء Gunicorn مع gthread worker للتوافق مع Socket.IO threading mode
# gthread = threaded worker (required for Flask-SocketIO with async_mode='threading')
echo "🔧 Starting Gunicorn with gthread workers..."
exec gunicorn --bind 0.0.0.0:$PORT \
    --worker-class gthread \
    --workers 1 \
    --threads 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output \
    --enable-stdio-inheritance \
    app:app
