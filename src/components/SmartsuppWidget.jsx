"use client";

import Script from "next/script";

export default function SmartsuppWidget() {
  const smartsuppKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;

  if (!smartsuppKey) {
    return null;
  }

  return (
    <>
      <Script id="smartsupp-init" strategy="afterInteractive">
        {`
          var _smartsupp = window._smartsupp || {};
          _smartsupp.key = ${JSON.stringify(smartsuppKey)};
          _smartsupp.orientation = "left";
          _smartsupp.hideWidget = true;
          _smartsupp.hideMobileWidget = true;
          window._smartsupp = _smartsupp;
          window.smartsupp = window.smartsupp || function() {
            (window.smartsupp._ = window.smartsupp._ || []).push(arguments);
          };
        `}
      </Script>
      <Script
        id="smartsupp-loader"
        onLoad={() => window.smartsupp?.("widget:hide")}
        onReady={() => window.smartsupp?.("widget:hide")}
        src="https://www.smartsuppchat.com/loader.js"
        strategy="afterInteractive"
      />
      <Script id="smartsupp-hide-widget" strategy="afterInteractive">
        {`
          window.smartsupp && window.smartsupp("widget:hide");
        `}
      </Script>
    </>
  );
}
