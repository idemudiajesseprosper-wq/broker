import Script from "next/script";

export default function SmartsuppWidget() {
  const smartsuppKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;

  if (!smartsuppKey) {
    return null;
  }

  const orientation = process.env.NEXT_PUBLIC_SMARTSUPP_ORIENTATION || "left";

  return (
    <>
      <Script id="smartsupp-init" strategy="lazyOnload">
        {`
          var _smartsupp = window._smartsupp || {};
          _smartsupp.key = ${JSON.stringify(smartsuppKey)};
          _smartsupp.orientation = ${JSON.stringify(orientation)};
          window._smartsupp = _smartsupp;
        `}
      </Script>
      <Script
        id="smartsupp-loader"
        src="https://www.smartsuppchat.com/loader.js"
        strategy="lazyOnload"
      />
    </>
  );
}
