#!/bin/bash

# تحديد المنفذ - استخدام PORT من متغير البيئة أو 5000 كقيمة افتراضية
PORT=${PORT:-5000}

echo "🚀 Starting backend on port $PORT"
echo "📊 Environment: $NODE_ENV"
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

# تشغيل Flask مباشرةً باستخدام app.py (مجرّب ويعمل محلياً)
echo "🔧 Starting Flask app with python app.py..."
exec python app.py
