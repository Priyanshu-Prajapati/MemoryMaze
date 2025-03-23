"use client"; // ✅ Ensures this runs on the client side

import Script from "next/script";

export default function GoogleAnalytics() {
  if (typeof window === "undefined") return null;
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${G-EPETNFWVQT}`}
      />
      
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${G-EPETNFWVQT}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
