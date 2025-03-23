"use client"; // Required for client-side execution

import Script from "next/script";

export default function GoogleAnalytics() {
  return (
    <>
      {/* Load Google Analytics */}
      <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EPETNFWVQT"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-EPETNFWVQT');
</script>
      />
    </>
  );
}
