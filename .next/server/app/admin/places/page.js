(()=>{var e={};e.id=8767,e.ids=[8767],e.modules={38013:e=>{"use strict";e.exports=require("mongodb")},47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},71017:e=>{"use strict";e.exports=require("path")},57310:e=>{"use strict";e.exports=require("url")},81289:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>c.a,__next_app__:()=>p,originalPathname:()=>l,pages:()=>u,routeModule:()=>h,tree:()=>o});var n=r(50482),a=r(69108),s=r(62563),c=r.n(s),i=r(68300),d={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>i[e]);r.d(t,d);let o=["",{children:["admin",{children:["places",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,6004)),"/Users/anvarinho/Desktop/next-app/frontend/src/app/admin/places/page.jsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,4545)),"/Users/anvarinho/Desktop/next-app/frontend/src/app/admin/layout.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,73881))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{"not-found":[()=>Promise.resolve().then(r.t.bind(r,69361,23)),"next/dist/client/components/not-found-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,73881))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],u=["/Users/anvarinho/Desktop/next-app/frontend/src/app/admin/places/page.jsx"],l="/admin/places/page",p={require:r,loadChunk:()=>Promise.resolve()},h=new n.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/admin/places/page",pathname:"/admin/places",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:o}})},14842:(e,t,r)=>{let n={"159ee0174499961c11b887d7d73343bf30702474":()=>Promise.resolve().then(r.bind(r,46999)).then(e=>e.$$ACTION_1),"7887c420b90f12870057560ac89522fdc805deca":()=>Promise.resolve().then(r.bind(r,46999)).then(e=>e.$$ACTION_0),f3af1cd87851b26ac8d741718bbc71fea90c0f90:()=>Promise.resolve().then(r.bind(r,46999)).then(e=>e.$$ACTION_2),"4c87ede2923bd54ea22c312a3ce4dfea78f026d6":()=>Promise.resolve().then(r.bind(r,20937)).then(e=>e.$$ACTION_0)};async function a(e,...t){return(await n[e]()).apply(null,t)}e.exports={"159ee0174499961c11b887d7d73343bf30702474":a.bind(null,"159ee0174499961c11b887d7d73343bf30702474"),"7887c420b90f12870057560ac89522fdc805deca":a.bind(null,"7887c420b90f12870057560ac89522fdc805deca"),f3af1cd87851b26ac8d741718bbc71fea90c0f90:a.bind(null,"f3af1cd87851b26ac8d741718bbc71fea90c0f90"),"4c87ede2923bd54ea22c312a3ce4dfea78f026d6":a.bind(null,"4c87ede2923bd54ea22c312a3ce4dfea78f026d6")}},72205:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,31900,23)),Promise.resolve().then(r.t.bind(r,61476,23)),Promise.resolve().then(r.bind(r,92070)),Promise.resolve().then(r.bind(r,34308))},92070:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>i});var n=r(95344),a=r(37430),s=r.n(a),c=r(8428);let i=({count:e})=>{let t=(0,c.useSearchParams)(),{replace:r}=(0,c.useRouter)(),a=(0,c.usePathname)(),i=t.get("page")||1,d=new URLSearchParams(t),o=2*(parseInt(i)-1)>0,u=2*(parseInt(i)-1)+2<e,l=e=>{"prev"===e?d.set("page",parseInt(i)-1):d.set("page",parseInt(i)+1),r(`${a}?${d}`)};return(0,n.jsxs)("div",{className:s().container,children:[n.jsx("button",{className:s().button,disabled:!o,onClick:()=>l("prev"),children:"Previous"}),n.jsx("button",{className:s().button,disabled:!u,onClick:()=>l("next"),children:"Next"})]})}},34308:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u});var n=r(95344),a=r(62225),s=r(10372),c=r(10957),i=r.n(c),d=r(8428),o=r(3729);let u=({placeholder:e})=>{let t=(0,d.useSearchParams)(),{replace:r}=(0,d.useRouter)(),c=(0,d.usePathname)(),u=function(e,t,r){var n=this,a=(0,o.useRef)(null),s=(0,o.useRef)(0),c=(0,o.useRef)(null),i=(0,o.useRef)([]),d=(0,o.useRef)(),u=(0,o.useRef)(),l=(0,o.useRef)(e),p=(0,o.useRef)(!0);l.current=e;var h="undefined"!=typeof window,x=!t&&0!==t&&h;if("function"!=typeof e)throw TypeError("Expected a function");t=+t||0;var f=!!(r=r||{}).leading,m=!("trailing"in r)||!!r.trailing,b="maxWait"in r,_="debounceOnServer"in r&&!!r.debounceOnServer,v=b?Math.max(+r.maxWait||0,t):null;return(0,o.useEffect)(function(){return p.current=!0,function(){p.current=!1}},[]),(0,o.useMemo)(function(){var e=function(e){var t=i.current,r=d.current;return i.current=d.current=null,s.current=e,u.current=l.current.apply(r,t)},r=function(e,t){x&&cancelAnimationFrame(c.current),c.current=x?requestAnimationFrame(e):setTimeout(e,t)},o=function(e){if(!p.current)return!1;var r=e-a.current;return!a.current||r>=t||r<0||b&&e-s.current>=v},g=function(t){return c.current=null,m&&i.current?e(t):(i.current=d.current=null,u.current)},j=function e(){var n=Date.now();if(o(n))return g(n);if(p.current){var c=t-(n-a.current);r(e,b?Math.min(c,v-(n-s.current)):c)}},P=function(){if(h||_){var l=Date.now(),x=o(l);if(i.current=[].slice.call(arguments),d.current=n,a.current=l,x){if(!c.current&&p.current)return s.current=a.current,r(j,t),f?e(a.current):u.current;if(b)return r(j,t),e(a.current)}return c.current||r(j,t),u.current}};return P.cancel=function(){c.current&&(x?cancelAnimationFrame(c.current):clearTimeout(c.current)),s.current=0,i.current=a.current=d.current=c.current=null},P.isPending=function(){return!!c.current},P.flush=function(){return c.current?g(Date.now()):u.current},P},[f,b,t,v,m,x,h,_])}(e=>{let n=new URLSearchParams(t);n.set("page",1),e.target.value?e.target.value.length>2&&n.set("q",e.target.value):n.delete("q"),r(`${c}?${n}`)},300);return(0,n.jsxs)("div",{className:i().container,children:[n.jsx(a.G,{icon:s.wn1,style:{width:"19px",height:"19px"}}),n.jsx("input",{type:"text",placeholder:e,className:i().input,onChange:u})]})}},98546:e=>{e.exports={container:"places_container__xLrEl",top:"places_top__WoMRD",addButton:"places_addButton__Xc39T",table:"places_table___uaSL",product:"places_product__go8H0",productImage:"places_productImage__dpLXN",buttons:"places_buttons__CJJPo",button:"places_button__MKqMZ",view:"places_view__IoZIY",delete:"places_delete__ZhU0I"}},37430:e=>{e.exports={container:"pagination_container__aMN6o",button:"pagination_button__t6SdM"}},10957:e=>{e.exports={container:"search_container__NRdyQ",input:"search_input__9QqaP"}},16274:(e,t,r)=>{"use strict";r.d(t,{default:()=>a.a});var n=r(48026),a=r.n(n)},48026:(e,t,r)=>{"use strict";let{createProxy:n}=r(86843);e.exports=n("/Users/anvarinho/Desktop/next-app/frontend/node_modules/next/dist/client/link.js")},6004:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>l});var n=r(25036),a=r(46999),s=r(2813),c=r(16274),i=r(98546),d=r.n(i),o=r(76131),u=r(20393);let l=async({searchParams:e})=>{let t=e?.q||"",r=e?.page||1,{count:i,places:l}=await (0,a.readPlaces)(t,r);return(0,n.jsxs)("div",{className:d().container,children:[(0,n.jsxs)("div",{className:d().top,children:[n.jsx(o.ZP,{placeholder:"Search for a product..."}),n.jsx(c.default,{href:"/dashboard/products/add",children:n.jsx("button",{className:d().addButton,children:"Add New"})})]}),(0,n.jsxs)("table",{className:d().table,children:[n.jsx("thead",{children:(0,n.jsxs)("tr",{children:[n.jsx("td",{children:"Num:"}),n.jsx("td",{children:"Image:"}),n.jsx("td",{children:"Name:"}),n.jsx("td",{children:"Views:"}),n.jsx("td",{children:"ID:"}),n.jsx("td",{children:"Created At:"}),n.jsx("td",{children:"Region:"})]})}),n.jsx("tbody",{className:d().tbody,children:l.map((e,t)=>(0,n.jsxs)("tr",{className:d().trow,children:[n.jsx("td",{children:t+1}),n.jsx("td",{children:n.jsx("div",{className:d().product,children:n.jsx(s.default,{src:"http://127.0.0.1:4000/"+e.images[0],alt:"",width:40,height:40,className:d().productImage})})}),n.jsx("td",{children:e.name.en}),n.jsx("td",{children:Math.round(e.viewCount)}),n.jsx("td",{children:e._id}),n.jsx("td",{children:e.created?.toString().slice(4,16)}),n.jsx("td",{children:e.region.en}),n.jsx("td",{children:n.jsx("div",{className:d().buttons,children:n.jsx(c.default,{href:`/admin/places/${e.url}`,children:n.jsx("button",{className:`${d().button} ${d().view}`,children:"View"})})})})]},e._id))})]}),n.jsx(u.ZP,{count:i})]})}},20393:(e,t,r)=>{"use strict";r.d(t,{ZP:()=>c});let n=(0,r(86843).createProxy)(String.raw`/Users/anvarinho/Desktop/next-app/frontend/src/app/admin/ui/dashboard/pagination/pagination.jsx`),{__esModule:a,$$typeof:s}=n,c=n.default},76131:(e,t,r)=>{"use strict";r.d(t,{ZP:()=>c});let n=(0,r(86843).createProxy)(String.raw`/Users/anvarinho/Desktop/next-app/frontend/src/app/admin/ui/dashboard/search/search.jsx`),{__esModule:a,$$typeof:s}=n,c=n.default}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[1638,8356,337,9993,867,6747,2745],()=>r(81289));module.exports=n})();