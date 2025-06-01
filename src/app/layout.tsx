import React from 'react';

// هذا هو ملف التخطيط الرئيسي المطلوب بواسطة Next.js App Router
// يجب أن يحتوي على وسوم <html> و <body> الأساسية.
export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  // لا تحتاج لإضافة أي وسوم خاصة باللغة هنا،
  // لأن التخطيط المتداخل في [locale]/layout.tsx سيهتم بذلك.
  return (
    // الوسوم الأساسية المطلوبة
    <html>
      <body>
        {/* سيتم عرض محتوى التخطيط المتداخل أو الصفحة هنا */}
        {children}
      </body>
    </html>
  );
}

