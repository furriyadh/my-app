-- ربط user_id بالحساب التجريبي
-- Link user_id to test account

-- الخطوة 1: احصل على user_id من جدول auth.users
-- Step 1: Get user_id from auth.users table

-- شغل هذا أولاً لعرض الـ user_id:
SELECT id, email FROM auth.users WHERE email = 'cejihe6663@icousd.com';

-- الخطوة 2: حدث السجل بالـ user_id
-- Step 2: Update record with user_id
-- استبدل YOUR_USER_ID بالقيمة من الخطوة 1

UPDATE furriyadh_customer_accounts
SET user_id = (SELECT id FROM auth.users WHERE email = 'cejihe6663@icousd.com')
WHERE user_email = 'cejihe6663@icousd.com';

-- تحقق من التحديث
SELECT id, user_id, user_email, current_balance FROM furriyadh_customer_accounts WHERE user_email = 'cejihe6663@icousd.com';
