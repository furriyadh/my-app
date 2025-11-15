image.png-- إصلاح مشكلة OAuth users - جعل password اختياري للمستخدمين الذين يسجلون عبر OAuth

-- جعل عمود password اختياري (nullable)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- إضافة قيمة افتراضية للمستخدمين الموجودين
UPDATE users SET password = 'oauth_user' WHERE password IS NULL AND auth_provider = 'google';

-- إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- التحقق من النتائج
SELECT 
    id, 
    email, 
    auth_provider, 
    CASE 
        WHEN password IS NULL THEN 'NULL'
        ELSE 'SET'
    END as password_status
FROM users 
WHERE auth_provider = 'google' 
LIMIT 5;
