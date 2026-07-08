import Script from "next/script";

export default function SmartsuppWidget() {
  const smartsuppKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;

  if (!smartsuppKey) {
    return null;
  }

  const orientation = process.env.NEXT_PUBLIC_SMARTSUPP_ORIENTATION || "right";

  return (
    <>
      <Script id="smartsupp-init" strategy="afterInteractive">
        {`
          var _smartsupp = window._smartsupp || {};
          _smartsupp.key = ${JSON.stringify(smartsuppKey)};
          _smartsupp.orientation = ${JSON.stringify(orientation)};
          _smartsupp.hideWidget = true;
          window._smartsupp = _smartsupp;
          window.smartsupp = window.smartsupp || function() {
            (window.smartsupp._ = window.smartsupp._ || []).push(arguments);
          };
        `}
      </Script>
      <Script
        id="smartsupp-loader"
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
