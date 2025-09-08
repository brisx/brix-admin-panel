import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="application-name" content="BRiX Admin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BRiX Admin" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f172a" />
        
        {/* Disable Fast Refresh */}
        <meta name="next-head-count" content="2" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Disable Fast Refresh
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            
            // Disable React DevTools hook
            if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
              window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {};
            }
          `
        }} />
      </Head>
      <body className="bg-slate-900 text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
