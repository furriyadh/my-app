import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/authentication/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            مرحباً بك في لوحة التحكم
          </h1>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                معلومات المستخدم
              </h2>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>البريد الإلكتروني:</strong> {data.user.email}
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>معرف المستخدم:</strong> {data.user.id}
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>تاريخ التسجيل:</strong> {new Date(data.user.created_at).toLocaleDateString('ar-SA')}
              </p>
              {data.user.user_metadata?.full_name && (
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>الاسم الكامل:</strong> {data.user.user_metadata.full_name}
                </p>
              )}
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                حالة الجلسة
              </h2>
              <p className="text-green-800 dark:text-green-200">
                ✅ تم تسجيل الدخول بنجاح
              </p>
              <p className="text-green-800 dark:text-green-200">
                🔐 الجلسة نشطة ومحمية
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ملاحظة مهمة
              </h2>
              <p className="text-yellow-800 dark:text-yellow-200">
                هذه الصفحة محمية ولا يمكن الوصول إليها إلا بعد تسجيل الدخول. 
                البيانات المعروضة هنا خاصة بالمستخدم المسجل دخوله حالياً فقط.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}