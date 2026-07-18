"use client";

import Script from "next/script";

export default function SmartsuppWidget() {
  const smartsuppKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;
  const chatStorageMigration = "2026-07-18-widget-left-1";

  if (!smartsuppKey) {
    return null;
  }

  return (
    <Script id="smartsupp-init" strategy="afterInteractive">
      {`
          // Smartsupp persists the visitor and conversation per browser. Clear the
          // pre-fix conversation once on every device, before its loader reads it.
          try {
            var migrationKey = "bsx.smartsupp.migration";
            if (window.localStorage.getItem(migrationKey) !== ${JSON.stringify(chatStorageMigration)}) {
              Object.keys(window.localStorage).forEach(function(key) {
                if (key.indexOf("ssupp_") === 0) {
                  window.localStorage.removeItem(key);
                }
              });

              document.cookie.split(";").forEach(function(cookie) {
                var name = cookie.split("=")[0].trim();
                if (name.indexOf("ssupp.") === 0 || name.indexOf("ssupp_") === 0) {
                  document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
                }
              });

              window.localStorage.setItem(migrationKey, ${JSON.stringify(chatStorageMigration)});
            }
          } catch (error) {
            // Storage can be unavailable in strict privacy modes; chat still loads.
          }

          var _smartsupp = window._smartsupp || {};
          _smartsupp.key = ${JSON.stringify(smartsuppKey)};
          _smartsupp.orientation = "left";
          _smartsupp.offsetX = 24;
          window._smartsupp = _smartsupp;
          window.smartsupp = window.smartsupp || function() {
            (window.smartsupp._ = window.smartsupp._ || []).push(arguments);
          };
          if (!document.getElementById("smartsupp-loader")) {
            var loader = document.createElement("script");
            loader.id = "smartsupp-loader";
            loader.type = "text/javascript";
            loader.charset = "utf-8";
            loader.async = true;
            loader.src = "https://www.smartsuppchat.com/loader.js?";
            document.head.appendChild(loader);
          }
      `}
    </Script>
  );
}
