(()=>{var t={3150:function(t,e){var n,r,o;"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self&&self,r=[t],n=function(t){"use strict";if(!globalThis.chrome?.runtime?.id)throw new Error("This script should only be loaded in a browser extension.");if(void 0===globalThis.browser||Object.getPrototypeOf(globalThis.browser)!==Object.prototype){const e="The message port closed before a response was received.",n=t=>{const n={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2,singleCallbackArg:!1}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0},elements:{createSidebarPane:{minArgs:1,maxArgs:1}}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},goBack:{minArgs:0,maxArgs:1},goForward:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(0===Object.keys(n).length)throw new Error("api-metadata.json has not been included in browser-polyfill");class r extends WeakMap{constructor(t,e=void 0){super(e),this.createItem=t}get(t){return this.has(t)||this.set(t,this.createItem(t)),super.get(t)}}const o=t=>t&&"object"==typeof t&&"function"==typeof t.then,a=(e,n)=>(...r)=>{t.runtime.lastError?e.reject(new Error(t.runtime.lastError.message)):n.singleCallbackArg||r.length<=1&&!1!==n.singleCallbackArg?e.resolve(r[0]):e.resolve(r)},i=t=>1==t?"argument":"arguments",s=(t,e)=>function(n,...r){if(r.length<e.minArgs)throw new Error(`Expected at least ${e.minArgs} ${i(e.minArgs)} for ${t}(), got ${r.length}`);if(r.length>e.maxArgs)throw new Error(`Expected at most ${e.maxArgs} ${i(e.maxArgs)} for ${t}(), got ${r.length}`);return new Promise(((o,i)=>{if(e.fallbackToNoCallback)try{n[t](...r,a({resolve:o,reject:i},e))}catch(a){console.warn(`${t} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,a),n[t](...r),e.fallbackToNoCallback=!1,e.noCallback=!0,o()}else e.noCallback?(n[t](...r),o()):n[t](...r,a({resolve:o,reject:i},e))}))},m=(t,e,n)=>new Proxy(e,{apply:(e,r,o)=>n.call(r,t,...o)});let g=Function.call.bind(Object.prototype.hasOwnProperty);const c=(t,e={},n={})=>{let r=Object.create(null),o={has:(e,n)=>n in t||n in r,get(o,a,i){if(a in r)return r[a];if(!(a in t))return;let l=t[a];if("function"==typeof l)if("function"==typeof e[a])l=m(t,t[a],e[a]);else if(g(n,a)){let e=s(a,n[a]);l=m(t,t[a],e)}else l=l.bind(t);else if("object"==typeof l&&null!==l&&(g(e,a)||g(n,a)))l=c(l,e[a],n[a]);else{if(!g(n,"*"))return Object.defineProperty(r,a,{configurable:!0,enumerable:!0,get:()=>t[a],set(e){t[a]=e}}),l;l=c(l,e[a],n["*"])}return r[a]=l,l},set:(e,n,o,a)=>(n in r?r[n]=o:t[n]=o,!0),defineProperty:(t,e,n)=>Reflect.defineProperty(r,e,n),deleteProperty:(t,e)=>Reflect.deleteProperty(r,e)},a=Object.create(t);return new Proxy(a,o)},l=t=>({addListener(e,n,...r){e.addListener(t.get(n),...r)},hasListener:(e,n)=>e.hasListener(t.get(n)),removeListener(e,n){e.removeListener(t.get(n))}}),A=new r((t=>"function"!=typeof t?t:function(e){const n=c(e,{},{getContent:{minArgs:0,maxArgs:0}});t(n)})),p=new r((t=>"function"!=typeof t?t:function(e,n,r){let a,i,s=!1,m=new Promise((t=>{a=function(e){s=!0,t(e)}}));try{i=t(e,n,a)}catch(t){i=Promise.reject(t)}const g=!0!==i&&o(i);if(!0!==i&&!g&&!s)return!1;const c=t=>{t.then((t=>{r(t)}),(t=>{let e;e=t&&(t instanceof Error||"string"==typeof t.message)?t.message:"An unexpected error occurred",r({__mozWebExtensionPolyfillReject__:!0,message:e})})).catch((t=>{console.error("Failed to send onMessage rejected reply",t)}))};return c(g?i:m),!0})),u=({reject:n,resolve:r},o)=>{t.runtime.lastError?t.runtime.lastError.message===e?r():n(new Error(t.runtime.lastError.message)):o&&o.__mozWebExtensionPolyfillReject__?n(new Error(o.message)):r(o)},b=(t,e,n,...r)=>{if(r.length<e.minArgs)throw new Error(`Expected at least ${e.minArgs} ${i(e.minArgs)} for ${t}(), got ${r.length}`);if(r.length>e.maxArgs)throw new Error(`Expected at most ${e.maxArgs} ${i(e.maxArgs)} for ${t}(), got ${r.length}`);return new Promise(((t,e)=>{const o=u.bind(null,{resolve:t,reject:e});r.push(o),n.sendMessage(...r)}))},d={devtools:{network:{onRequestFinished:l(A)}},runtime:{onMessage:l(p),onMessageExternal:l(p),sendMessage:b.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:b.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},x={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return n.privacy={network:{"*":x},services:{"*":x},websites:{"*":x}},c(t,d,n)};t.exports=n(chrome)}else t.exports=globalThis.browser},void 0===(o="function"==typeof n?n.apply(e,r):n)||(t.exports=o)}},e={};function n(r){var o=e[r];if(void 0!==o)return o.exports;var a=e[r]={exports:{}};return t[r].call(a.exports,a,a.exports,n),a.exports}n.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return n.d(e,{a:e}),e},n.d=(t,e)=>{for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{"use strict";var t=n(3150),e=n.n(t);const r={title:{rules:[['meta[property="og:title"][content]',t=>t.getAttribute("content")],['meta[name="og:title"][content]',t=>t.getAttribute("content")],['meta[property="twitter:title"][content]',t=>t.getAttribute("content")],['meta[name="twitter:title"][content]',t=>t.getAttribute("content")],['meta[property="reddit:title"][content]',t=>t.getAttribute("content")],['meta[name="reddit:title"][content]',t=>t.getAttribute("content")],['meta[property="parsely-title"][content]',t=>t.getAttribute("content")],['meta[name="parsely-title"][content]',t=>t.getAttribute("content")],['meta[property="sailthru.title"][content]',t=>t.getAttribute("content")],['meta[name="sailthru.title"][content]',t=>t.getAttribute("content")],["title",t=>t.textContent]]},description:{rules:[['meta[property="alby:description"][content]',t=>t.getAttribute("content")],['meta[name="alby:description"][content]',t=>t.getAttribute("content")],['meta[property="og:description"][content]',t=>t.getAttribute("content")],['meta[name="og:description"][content]',t=>t.getAttribute("content")],['meta[property="description" i][content]',t=>t.getAttribute("content")],['meta[name="description" i][content]',t=>t.getAttribute("content")],['meta[property="sailthru.description"][content]',t=>t.getAttribute("content")],['meta[name="sailthru.description"][content]',t=>t.getAttribute("content")],['meta[property="twitter:description"][content]',t=>t.getAttribute("content")],['meta[name="twitter:description"][content]',t=>t.getAttribute("content")],['meta[property="reddit:description"][content]',t=>t.getAttribute("content")],['meta[name="reddit:description"][content]',t=>t.getAttribute("content")],['meta[property="summary" i][content]',t=>t.getAttribute("content")],['meta[name="summary" i][content]',t=>t.getAttribute("content")]]},type:{rules:[['meta[property="og:type"][content]',t=>t.getAttribute("content")],['meta[name="og:type"][content]',t=>t.getAttribute("content")],['meta[property="parsely-type"][content]',t=>t.getAttribute("content")],['meta[name="parsely-type"][content]',t=>t.getAttribute("content")],['meta[property="medium"][content]',t=>t.getAttribute("content")],['meta[name="medium"][content]',t=>t.getAttribute("content")]]},url:{rules:[['meta[property="og:url"][content]',t=>t.getAttribute("content")],['meta[name="og:url"][content]',t=>t.getAttribute("content")],['meta[property="al:web:url"][content]',t=>t.getAttribute("content")],['meta[name="al:web:url"][content]',t=>t.getAttribute("content")],['meta[property="parsely-link"][content]',t=>t.getAttribute("content")],['meta[name="parsely-link"][content]',t=>t.getAttribute("content")],["a.amp-canurl",t=>t.getAttribute("href")],['link[rel="canonical"][href]',t=>t.getAttribute("href")]],defaultValue:t=>t.url,processor:(t,e)=>o(e.url,t)},provider:{rules:[['meta[property="alby:name"][content]',t=>t.getAttribute("content")],['meta[name="alby:name"][content]',t=>t.getAttribute("content")],['meta[property="og:site_name"][content]',t=>t.getAttribute("content")],['meta[name="og:site_name"][content]',t=>t.getAttribute("content")],['meta[property="publisher" i][content]',t=>t.getAttribute("content")],['meta[name="publisher" i][content]',t=>t.getAttribute("content")],['meta[property="application-name" i][content]',t=>t.getAttribute("content")],['meta[name="application-name" i][content]',t=>t.getAttribute("content")],['meta[property="al:android:app_name"][content]',t=>t.getAttribute("content")],['meta[name="al:android:app_name"][content]',t=>t.getAttribute("content")],['meta[property="al:iphone:app_name"][content]',t=>t.getAttribute("content")],['meta[name="al:iphone:app_name"][content]',t=>t.getAttribute("content")],['meta[property="al:ipad:app_name"][content]',t=>t.getAttribute("content")],['meta[name="al:ipad:app_name"][content]',t=>t.getAttribute("content")],['meta[property="al:ios:app_name"][content]',t=>t.getAttribute("content")],['meta[name="al:ios:app_name"][content]',t=>t.getAttribute("content")],['meta[property="twitter:app:name:iphone"][content]',t=>t.getAttribute("content")],['meta[name="twitter:app:name:iphone"][content]',t=>t.getAttribute("content")],['meta[property="twitter:app:name:ipad"][content]',t=>t.getAttribute("content")],['meta[name="twitter:app:name:ipad"][content]',t=>t.getAttribute("content")],['meta[property="twitter:app:name:googleplay"][content]',t=>t.getAttribute("content")],['meta[name="twitter:app:name:googleplay"][content]',t=>t.getAttribute("content")],['meta[property="reddit:app:name:iphone"][content]',t=>t.getAttribute("content")],['meta[name="reddit:app:name:iphone"][content]',t=>t.getAttribute("content")],['meta[property="reddit:app:name:ipad"][content]',t=>t.getAttribute("content")],['meta[name="reddit:app:name:ipad"][content]',t=>t.getAttribute("content")],['meta[property="reddit:app:name:googleplay"][content]',t=>t.getAttribute("content")],['meta[name="reddit:app:name:googleplay"][content]',t=>t.getAttribute("content")]],defaultValue:t=>new URL(t.url).hostname.replace(/www[a-zA-Z0-9]*\./,"").replace(".co.",".").split(".").slice(0,-1).join(" ")},keywords:{rules:[['meta[property="keywords" i][content]',t=>t.getAttribute("content")],['meta[name="keywords" i][content]',t=>t.getAttribute("content")],['meta[property="parsely-tags"][content]',t=>t.getAttribute("content")],['meta[name="parsely-tags"][content]',t=>t.getAttribute("content")],['meta[property="sailthru.tags"][content]',t=>t.getAttribute("content")],['meta[name="sailthru.tags"][content]',t=>t.getAttribute("content")],['meta[property="article:tag" i][content]',t=>t.getAttribute("content")],['meta[name="article:tag" i][content]',t=>t.getAttribute("content")],['meta[property="book:tag" i][content]',t=>t.getAttribute("content")],['meta[name="book:tag" i][content]',t=>t.getAttribute("content")],['meta[property="topic" i][content]',t=>t.getAttribute("content")],['meta[name="topic" i][content]',t=>t.getAttribute("content")]],processor:t=>t.split(",").map((t=>t.trim()))},author:{rules:[['meta[property="author" i][content]',t=>t.getAttribute("content")],['meta[name="author" i][content]',t=>t.getAttribute("content")],['meta[property="article:author"][content]',t=>t.getAttribute("content")],['meta[name="article:author"][content]',t=>t.getAttribute("content")],['meta[property="book:author"][content]',t=>t.getAttribute("content")],['meta[name="book:author"][content]',t=>t.getAttribute("content")],['meta[property="parsely-author"][content]',t=>t.getAttribute("content")],['meta[name="parsely-author"][content]',t=>t.getAttribute("content")],['meta[property="sailthru.author"][content]',t=>t.getAttribute("content")],['meta[name="sailthru.author"][content]',t=>t.getAttribute("content")],['a[class*="author" i]',t=>t.textContent],['[rel="author"]',t=>t.textContent],['meta[property="twitter:creator"][content]',t=>t.getAttribute("content")],['meta[name="twitter:creator"][content]',t=>t.getAttribute("content")],['meta[property="reddit:creator"][content]',t=>t.getAttribute("content")],['meta[name="reddit:creator"][content]',t=>t.getAttribute("content")],['meta[property="profile:username"][content]',t=>t.getAttribute("content")],['meta[name="profile:username"][content]',t=>t.getAttribute("content")]]},copyright:{rules:[['meta[property="copyright" i][content]',t=>t.getAttribute("content")],['meta[name="copyright" i][content]',t=>t.getAttribute("content")]]},email:{rules:[['meta[property="email" i][content]',t=>t.getAttribute("content")],['meta[name="email" i][content]',t=>t.getAttribute("content")],['meta[property="reply-to" i][content]',t=>t.getAttribute("content")],['meta[name="reply-to" i][content]',t=>t.getAttribute("content")]]},twitter:{rules:[['meta[property="twitter:site"][content]',t=>t.getAttribute("content")],['meta[name="twitter:site"][content]',t=>t.getAttribute("content")]]},reddit:{rules:[['meta[property="reddit:site"][content]',t=>t.getAttribute("content")],['meta[name="reddit:site"][content]',t=>t.getAttribute("content")]]},facebook:{rules:[['meta[property="fb:pages"][content]',t=>t.getAttribute("content")],['meta[name="fb:pages"][content]',t=>t.getAttribute("content")]]},image:{rules:[['meta[property="alby:image"][content]',t=>t.getAttribute("content")],['meta[name="alby:image"][content]',t=>t.getAttribute("content")],['meta[property="og:image:secure_url"][content]',t=>t.getAttribute("content")],['meta[name="og:image:secure_url"][content]',t=>t.getAttribute("content")],['meta[property="og:image:url"][content]',t=>t.getAttribute("content")],['meta[name="og:image:url"][content]',t=>t.getAttribute("content")],['meta[property="og:image"][content]',t=>t.getAttribute("content")],['meta[name="og:image"][content]',t=>t.getAttribute("content")],['meta[property="twitter:image"][content]',t=>t.getAttribute("content")],['meta[name="twitter:image"][content]',t=>t.getAttribute("content")],['meta[property="twitter:image:src"][content]',t=>t.getAttribute("content")],['meta[name="twitter:image:src"][content]',t=>t.getAttribute("content")],['meta[property="reddit:image"][content]',t=>t.getAttribute("content")],['meta[name="reddit:image"][content]',t=>t.getAttribute("content")],['meta[property="reddit:image:src"][content]',t=>t.getAttribute("content")],['meta[name="reddit:image:src"][content]',t=>t.getAttribute("content")],['meta[property="thumbnail"][content]',t=>t.getAttribute("content")],['meta[name="thumbnail"][content]',t=>t.getAttribute("content")],['meta[property="parsely-image-url"][content]',t=>t.getAttribute("content")],['meta[name="parsely-image-url"][content]',t=>t.getAttribute("content")],['meta[property="sailthru.image.full"][content]',t=>t.getAttribute("content")],['meta[name="sailthru.image.full"][content]',t=>t.getAttribute("content")]],processor:(t,e)=>!0===e.options.forceImageHttps?a(o(e.url,t)):o(e.url,t)},icon:{rules:[['meta[property="alby:image"][content]',t=>t.getAttribute("content")],['meta[name="alby:image"][content]',t=>t.getAttribute("content")],['link[rel="apple-touch-icon"][href]',t=>t.getAttribute("href")],['link[rel="apple-touch-icon-precomposed"][href]',t=>t.getAttribute("href")],['link[rel="fluid-icon"][href]',t=>t.getAttribute("href")],['link[rel="shortcut icon"][href]',t=>t.getAttribute("href")],['link[rel="Shortcut Icon"][href]',t=>t.getAttribute("href")],['link[rel="mask-icon"][href]',t=>t.getAttribute("href")],['link[rel="icon" i][href]',t=>t.getAttribute("href")]],processor:(t,e)=>!0===e.options.forceImageHttps?a(o(e.url,t)):o(e.url,t)},monetization:{rules:[['meta[name="lightning"]',t=>t.getAttribute("content")],['meta[property="lightning"]',t=>t.getAttribute("content")]],processor:t=>t.toLowerCase()}};function o(t,e){return new URL(e,t).href}function a(t){return t.replace(/^http:/,"https:")}const i=function(){const t={};return Object.keys(r).forEach((e=>{const n=r[e];t[e]=function(t,e,n){let r,o=0;for(let n=0;n<t.rules.length;n++){const[a,i]=t.rules[n],s=Array.from(e.querySelectorAll(a));if(s.length)for(const e of s){let a=t.rules.length-n;if(t.scorer){const n=t.scorer(e,a);n&&(a=n)}a>o&&(o=a,r=i(e))}}return r?(t.processor&&(r=t.processor(r,n)),r):(!r||r.length<1)&&t.defaultValue?t.defaultValue(n):void 0}(n,document,{options:{},url:document.location.toString()})||void 0})),t};function s(){if(!window||!document)throw new Error("Must be called in browser context");const t=i();return{location:window.location.toString(),domain:window.location.origin,host:window.location.host,pathname:window.location.pathname,name:t.provider||t.title||"",description:t.description||"",icon:t.icon||t.image||"",metaData:t,external:!0}}const m={request:(t,n,r)=>e().runtime.sendMessage({application:"LBE",prompt:!0,action:t,args:n,origin:{internal:!0},...r}).then((t=>{if(t.error)throw new Error(t.error);return t.data})),reply:t=>e().runtime.sendMessage({application:"LBE",response:!0,data:t,origin:{internal:!0}}),error:t=>e().runtime.sendMessage({application:"LBE",response:!0,error:t,origin:{internal:!0}})};async function g(){const t=await async function(){try{const t=window.location.host;return!(await m.request("getBlocklist",{host:t})).blocked}catch(t){return t instanceof Error&&console.error(t),!1}}(),e=function(){const t=window.document.doctype;return!t||"html"===t.name}(),n=function(){const t=[/\.xml$/,/\.pdf$/],e=window.location.pathname;for(const n of t)if(n.test(e))return!1;return!0}(),r=function(){if(!document||!document.documentElement)return!1;const t=document.documentElement.nodeName;if(t)return"html"===t.toLowerCase();return!0}();return t&&e&&n&&r}const c=["webbtc/enable","webbtc/getInfo","webbtc/getAddressWithPrompt"],l=["webbtc/enable"];let A=!1,p=!1,u=!1;const b="webbtc";!async function(){await g()&&window.addEventListener("message",(t=>{if(t.source===window&&"LBE"===t.data.application&&t.data.scope===b&&t.data&&!t.data.response){if(p)return void console.error("Enable had failed. Rejecting further WebBTC calls until the next reload");if(u)return void console.error("WebBTC call already executing");if(!(A?c:l).includes(t.data.action))return void console.error("Function not available.");const n={action:`public/${t.data.action}`,args:t.data.args,application:"LBE",public:!0,prompt:!0,origin:s()},r=e=>{u=!1,t.data.action===`${b}/enable`&&(A=e.data?.enabled,e.error&&(console.error(e.error),console.info("Enable was rejected ignoring further webbtc calls"),p=!0)),function(t,e){window.postMessage({id:t.data.id,application:"LBE",response:!0,data:e,scope:b},"*")}(t,e)};return u=!0,e().runtime.sendMessage(n).then(r).catch(r)}}))}()})()})();