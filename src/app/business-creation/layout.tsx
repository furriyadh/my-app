import React from 'react';

export default function BusinessCreationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
