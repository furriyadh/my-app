-- إصلاح constraint للحالات في جدول client_requests
-- السماح بجميع حالات Google Ads API

-- إزالة constraint القديم إذا كان موجوداً
ALTER TABLE client_requests DROP CONSTRAINT IF EXISTS client_requests_status_check;

-- إضافة constraint جديد يسمح بجميع الحالات المطلوبة
ALTER TABLE client_requests ADD CONSTRAINT client_requests_status_check 
CHECK (status IN (
    'PENDING',      -- في انتظار القبول
    'ACTIVE',       -- مربوط ومفعل
    'REJECTED',     -- مرفوض
    'REFUSED',      -- مرفوض (مرادف)
    'CANCELLED',    -- ملغي
    'CANCELED',     -- ملغي (مرادف)
    'INACTIVE',     -- غير نشط
    'NOT_LINKED',   -- غير مربوط
    'EXPIRED',      -- منتهي الصلاحية
    'SUSPENDED'     -- معلق
));

-- تحديث القيم الموجودة لتتوافق مع constraint الجديد
UPDATE client_requests 
SET status = 'CANCELLED' 
WHERE status = 'CANCELED';

-- إضافة تعليق للتوضيح
COMMENT ON CONSTRAINT client_requests_status_check ON client_requests 
IS 'يسمح بجميع حالات Google Ads API للربط';
