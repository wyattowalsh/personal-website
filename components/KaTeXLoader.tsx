"use client";

import { useEffect } from "react";
import Script from "next/script";

const KATEX_VERSION = "0.16.11"; // Centralize version

export default function KaTeXLoader() {
  useEffect(() => {
    // @ts-ignore
    if (typeof renderMathInElement !== "undefined") {
      // @ts-ignore
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false
      });
    }
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`}
        integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
        crossOrigin="anonymous"
      />
      <Script
        src={`https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`}
        integrity="sha384-XjKyOOlGwcjNTWpIvqKcBMh42uMqoGcJzk/mtXSSNrEvFB5whump7oA7n5UXyCiU"
        strategy="lazyOnload"
      />
      <Script
        src={`https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/contrib/copy-tex.min.js`}
        integrity="sha384-HORx6nWi8j9/mYA+y57/9/CZc5z8HnEw4WUZWy5yOn9ToKBv1l58vJaufFAn9Zzi"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <Script
        src={`https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/contrib/auto-render.min.js`}
        integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
    </>
  );
}
