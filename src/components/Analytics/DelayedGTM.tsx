"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function DelayedGTM({ gtmId }: { gtmId: string }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Delay GTM loading by 4 seconds to allow critical content to load first
        // This significantly improves PageSpeed Insights score
        const timer = setTimeout(() => {
            setLoaded(true);
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    if (!loaded) return null;

    return (
        <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `,
            }}
        />
    );
}
