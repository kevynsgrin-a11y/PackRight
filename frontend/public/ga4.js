// GA4 bootstrap. Loaded as a same-origin file because the CSP in
// public/_headers allows no inline script, which is what blocked the old
// inline gtag('config') call. The loader itself is in index.html.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-HDR71MFSXM");
