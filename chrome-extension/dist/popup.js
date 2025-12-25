var Lt={NODE_CLIENT:!1,NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};var f=function(n,e){if(!n)throw se(e)},se=function(n){return new Error("Firebase Database ("+Lt.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};var bi=function(n){let e=[],t=0;for(let i=0;i<n.length;i++){let s=n.charCodeAt(i);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&i+1<n.length&&(n.charCodeAt(i+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++i)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},no=function(n){let e=[],t=0,i=0;for(;t<n.length;){let s=n[t++];if(s<128)e[i++]=String.fromCharCode(s);else if(s>191&&s<224){let r=n[t++];e[i++]=String.fromCharCode((s&31)<<6|r&63)}else if(s>239&&s<365){let r=n[t++],o=n[t++],a=n[t++],l=((s&7)<<18|(r&63)<<12|(o&63)<<6|a&63)-65536;e[i++]=String.fromCharCode(55296+(l>>10)),e[i++]=String.fromCharCode(56320+(l&1023))}else{let r=n[t++],o=n[t++];e[i++]=String.fromCharCode((s&15)<<12|(r&63)<<6|o&63)}}return e.join("")},ot={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();let t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let s=0;s<n.length;s+=3){let r=n[s],o=s+1<n.length,a=o?n[s+1]:0,l=s+2<n.length,c=l?n[s+2]:0,u=r>>2,h=(r&3)<<4|a>>4,d=(a&15)<<2|c>>6,_=c&63;l||(_=64,o||(d=64)),i.push(t[u],t[h],t[d],t[_])}return i.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(bi(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):no(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();let t=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let s=0;s<n.length;){let r=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;let c=s<n.length?t[n.charAt(s)]:64;++s;let h=s<n.length?t[n.charAt(s)]:64;if(++s,r==null||a==null||c==null||h==null)throw new Ft;let d=r<<2|a>>4;if(i.push(d),c!==64){let _=a<<4&240|c>>2;if(i.push(_),h!==64){let p=c<<6&192|h;i.push(p)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}},Ft=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},Wt=function(n){let e=bi(n);return ot.encodeByteArray(e,!0)},Le=function(n){return Wt(n).replace(/\./g,"")},Bt=function(n){try{return ot.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function Ii(n){return Si(void 0,n)}function Si(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:let t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(let t in e)!e.hasOwnProperty(t)||!io(t)||(n[t]=Si(n[t],e[t]));return n}function io(n){return n!=="__proto__"}function so(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var ro=()=>so().__FIREBASE_DEFAULTS__,oo=()=>{if(typeof process>"u"||typeof process.env>"u")return;let n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},ao=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=n&&Bt(n[1]);return e&&JSON.parse(e)},Ti=()=>{try{return ro()||oo()||ao()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},lo=n=>{var e,t;return(t=(e=Ti())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Ni=n=>{let e=lo(n);if(!e)return;let t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let i=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),i]:[e.substring(0,t),i]},Ut=()=>{var n;return(n=Ti())===null||n===void 0?void 0:n.config};var Q=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,i)=>{t?this.reject(t):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,i))}}};function Ri(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let t={alg:"none",type:"JWT"},i=e||"demo-project",s=n.iat||0,r=n.sub||n.user_id;if(!r)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let o=Object.assign({iss:`https://securetoken.google.com/${i}`,aud:i,iat:s,exp:s+3600,auth_time:s,sub:r,user_id:r,firebase:{sign_in_provider:"custom",identities:{}}},n);return[Le(JSON.stringify(t)),Le(JSON.stringify(o)),""].join(".")}function co(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ht(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(co())}function xi(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function U(){return Lt.NODE_CLIENT===!0||Lt.NODE_ADMIN===!0}function Ai(){try{return typeof indexedDB=="object"}catch{return!1}}function ki(){return new Promise((n,e)=>{try{let t=!0,i="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(i);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(i),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var r;e(((r=s.error)===null||r===void 0?void 0:r.message)||"")}}catch(t){e(t)}})}var ho="FirebaseError",ie=class n extends Error{constructor(e,t,i){super(t),this.code=e,this.customData=i,this.name=ho,Object.setPrototypeOf(this,n.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Fe.prototype.create)}},Fe=class{constructor(e,t,i){this.service=e,this.serviceName=t,this.errors=i}create(e,...t){let i=t[0]||{},s=`${this.service}/${e}`,r=this.errors[e],o=r?uo(r,i):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new ie(s,a,i)}};function uo(n,e){return n.replace(fo,(t,i)=>{let s=e[i];return s!=null?String(s):`<${i}?>`})}var fo=/\{\$([^}]+)}/g;function ve(n){return JSON.parse(n)}function T(n){return JSON.stringify(n)}var Di=function(n){let e={},t={},i={},s="";try{let r=n.split(".");e=ve(Bt(r[0])||""),t=ve(Bt(r[1])||""),s=r[2],i=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:i,signature:s}};var Pi=function(n){let e=Di(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},Oi=function(n){let e=Di(n).claims;return typeof e=="object"&&e.admin===!0};function H(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function re(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function Vt(n){for(let e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Be(n,e,t){let i={};for(let s in n)Object.prototype.hasOwnProperty.call(n,s)&&(i[s]=e.call(t,n[s],s,n));return i}function at(n,e){if(n===e)return!0;let t=Object.keys(n),i=Object.keys(e);for(let s of t){if(!i.includes(s))return!1;let r=n[s],o=e[s];if(Ci(r)&&Ci(o)){if(!at(r,o))return!1}else if(r!==o)return!1}for(let s of i)if(!t.includes(s))return!1;return!0}function Ci(n){return n!==null&&typeof n=="object"}function Mi(n){let e=[];for(let[t,i]of Object.entries(n))Array.isArray(i)?i.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}var rt=class{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);let i=this.W_;if(typeof e=="string")for(let h=0;h<16;h++)i[h]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let h=0;h<16;h++)i[h]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let h=16;h<80;h++){let d=i[h-3]^i[h-8]^i[h-14]^i[h-16];i[h]=(d<<1|d>>>31)&4294967295}let s=this.chain_[0],r=this.chain_[1],o=this.chain_[2],a=this.chain_[3],l=this.chain_[4],c,u;for(let h=0;h<80;h++){h<40?h<20?(c=a^r&(o^a),u=1518500249):(c=r^o^a,u=1859775393):h<60?(c=r&o|a&(r|o),u=2400959708):(c=r^o^a,u=3395469782);let d=(s<<5|s>>>27)+c+l+u+i[h]&4294967295;l=a,a=o,o=(r<<30|r>>>2)&4294967295,r=s,s=d}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+r&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+a&4294967295,this.chain_[4]=this.chain_[4]+l&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);let i=t-this.blockSize,s=0,r=this.buf_,o=this.inbuf_;for(;s<t;){if(o===0)for(;s<=i;)this.compress_(e,s),s+=this.blockSize;if(typeof e=="string"){for(;s<t;)if(r[o]=e.charCodeAt(s),++o,++s,o===this.blockSize){this.compress_(r),o=0;break}}else for(;s<t;)if(r[o]=e[s],++o,++s,o===this.blockSize){this.compress_(r),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){let e=[],t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=t&255,t/=256;this.compress_(this.buf_);let i=0;for(let s=0;s<5;s++)for(let r=24;r>=0;r-=8)e[i]=this.chain_[s]>>r&255,++i;return e}};function lt(n,e){return`${n} failed: ${e} argument `}var Li=function(n){let e=[],t=0;for(let i=0;i<n.length;i++){let s=n.charCodeAt(i);if(s>=55296&&s<=56319){let r=s-55296;i++,f(i<n.length,"Surrogate pair missing trail surrogate.");let o=n.charCodeAt(i)-56320;s=65536+(r<<10)+o}s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):s<65536?(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},We=function(n){let e=0;for(let t=0;t<n.length;t++){let i=n.charCodeAt(t);i<128?e++:i<2048?e+=2:i>=55296&&i<=56319?(e+=4,t++):e+=3}return e};var Hc=4*60*60*1e3;function oe(n){return n&&n._delegate?n._delegate:n}var j=class{constructor(e,t,i){this.name=e,this.instanceFactory=t,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var ae="[DEFAULT]";var ct=class{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){let i=new Q;if(this.instancesDeferred.set(t,i),this.isInitialized(t)||this.shouldAutoInitialize())try{let s=this.getOrInitializeService({instanceIdentifier:t});s&&i.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;let i=this.normalizeInstanceIdentifier(e?.identifier),s=(t=e?.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(i)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:i})}catch(r){if(s)return null;throw r}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(po(e))try{this.getOrInitializeService({instanceIdentifier:ae})}catch{}for(let[t,i]of this.instancesDeferred.entries()){let s=this.normalizeInstanceIdentifier(t);try{let r=this.getOrInitializeService({instanceIdentifier:s});i.resolve(r)}catch{}}}}clearInstance(e=ae){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ae){return this.instances.has(e)}getOptions(e=ae){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:t={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let s=this.getOrInitializeService({instanceIdentifier:i,options:t});for(let[r,o]of this.instancesDeferred.entries()){let a=this.normalizeInstanceIdentifier(r);i===a&&o.resolve(s)}return s}onInit(e,t){var i;let s=this.normalizeInstanceIdentifier(t),r=(i=this.onInitCallbacks.get(s))!==null&&i!==void 0?i:new Set;r.add(e),this.onInitCallbacks.set(s,r);let o=this.instances.get(s);return o&&e(o,s),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){let i=this.onInitCallbacks.get(t);if(i)for(let s of i)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:_o(e),options:t}),this.instances.set(e,i),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=ae){return this.component?this.component.multipleInstances?e:ae:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function _o(n){return n===ae?void 0:n}function po(n){return n.instantiationMode==="EAGER"}var Ue=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let t=new ct(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}};var mo=[],E;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(E||(E={}));var go={debug:E.DEBUG,verbose:E.VERBOSE,info:E.INFO,warn:E.WARN,error:E.ERROR,silent:E.SILENT},yo=E.INFO,vo={[E.DEBUG]:"log",[E.VERBOSE]:"log",[E.INFO]:"info",[E.WARN]:"warn",[E.ERROR]:"error"},Eo=(n,e,...t)=>{if(e<n.logLevel)return;let i=new Date().toISOString(),s=vo[e];if(s)console[s](`[${i}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},Ee=class{constructor(e){this.name=e,this._logLevel=yo,this._logHandler=Eo,this._userLogHandler=null,mo.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in E))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?go[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,E.DEBUG,...e),this._logHandler(this,E.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,E.VERBOSE,...e),this._logHandler(this,E.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,E.INFO,...e),this._logHandler(this,E.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,E.WARN,...e),this._logHandler(this,E.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,E.ERROR,...e),this._logHandler(this,E.ERROR,...e)}};var wo=(n,e)=>e.some(t=>n instanceof t),Fi,Bi;function Co(){return Fi||(Fi=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function bo(){return Bi||(Bi=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Wi=new WeakMap,jt=new WeakMap,Ui=new WeakMap,$t=new WeakMap,Gt=new WeakMap;function Io(n){let e=new Promise((t,i)=>{let s=()=>{n.removeEventListener("success",r),n.removeEventListener("error",o)},r=()=>{t(V(n.result)),s()},o=()=>{i(n.error),s()};n.addEventListener("success",r),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Wi.set(t,n)}).catch(()=>{}),Gt.set(e,n),e}function So(n){if(jt.has(n))return;let e=new Promise((t,i)=>{let s=()=>{n.removeEventListener("complete",r),n.removeEventListener("error",o),n.removeEventListener("abort",o)},r=()=>{t(),s()},o=()=>{i(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",r),n.addEventListener("error",o),n.addEventListener("abort",o)});jt.set(n,e)}var zt={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return jt.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Ui.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return V(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Hi(n){zt=n(zt)}function To(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){let i=n.call(ht(this),e,...t);return Ui.set(i,e.sort?e.sort():[e]),V(i)}:bo().includes(n)?function(...e){return n.apply(ht(this),e),V(Wi.get(this))}:function(...e){return V(n.apply(ht(this),e))}}function No(n){return typeof n=="function"?To(n):(n instanceof IDBTransaction&&So(n),wo(n,Co())?new Proxy(n,zt):n)}function V(n){if(n instanceof IDBRequest)return Io(n);if($t.has(n))return $t.get(n);let e=No(n);return e!==n&&($t.set(n,e),Gt.set(e,n)),e}var ht=n=>Gt.get(n);function $i(n,e,{blocked:t,upgrade:i,blocking:s,terminated:r}={}){let o=indexedDB.open(n,e),a=V(o);return i&&o.addEventListener("upgradeneeded",l=>{i(V(o.result),l.oldVersion,l.newVersion,V(o.transaction),l)}),t&&o.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),a.then(l=>{r&&l.addEventListener("close",()=>r()),s&&l.addEventListener("versionchange",c=>s(c.oldVersion,c.newVersion,c))}).catch(()=>{}),a}var Ro=["get","getKey","getAll","getAllKeys","count"],xo=["put","add","delete","clear"],Yt=new Map;function Vi(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Yt.get(e))return Yt.get(e);let t=e.replace(/FromIndex$/,""),i=e!==t,s=xo.includes(t);if(!(t in(i?IDBIndex:IDBObjectStore).prototype)||!(s||Ro.includes(t)))return;let r=async function(o,...a){let l=this.transaction(o,s?"readwrite":"readonly"),c=l.store;return i&&(c=c.index(a.shift())),(await Promise.all([c[t](...a),s&&l.done]))[0]};return Yt.set(e,r),r}Hi(n=>({...n,get:(e,t,i)=>Vi(e,t)||n.get(e,t,i),has:(e,t)=>!!Vi(e,t)||n.has(e,t)}));var Kt=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Ao(t)){let i=t.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(t=>t).join(" ")}};function Ao(n){let e=n.getComponent();return e?.type==="VERSION"}var Qt="@firebase/app",ji="0.10.13";var z=new Ee("@firebase/app"),ko="@firebase/app-compat",Do="@firebase/analytics-compat",Po="@firebase/analytics",Oo="@firebase/app-check-compat",Mo="@firebase/app-check",Lo="@firebase/auth",Fo="@firebase/auth-compat",Bo="@firebase/database",Wo="@firebase/data-connect",Uo="@firebase/database-compat",Ho="@firebase/functions",Vo="@firebase/functions-compat",$o="@firebase/installations",jo="@firebase/installations-compat",zo="@firebase/messaging",Go="@firebase/messaging-compat",Yo="@firebase/performance",qo="@firebase/performance-compat",Ko="@firebase/remote-config",Qo="@firebase/remote-config-compat",Xo="@firebase/storage",Jo="@firebase/storage-compat",Zo="@firebase/firestore",ea="@firebase/vertexai-preview",ta="@firebase/firestore-compat",na="firebase",ia="10.14.1";var Xt="[DEFAULT]",sa={[Qt]:"fire-core",[ko]:"fire-core-compat",[Po]:"fire-analytics",[Do]:"fire-analytics-compat",[Mo]:"fire-app-check",[Oo]:"fire-app-check-compat",[Lo]:"fire-auth",[Fo]:"fire-auth-compat",[Bo]:"fire-rtdb",[Wo]:"fire-data-connect",[Uo]:"fire-rtdb-compat",[Ho]:"fire-fn",[Vo]:"fire-fn-compat",[$o]:"fire-iid",[jo]:"fire-iid-compat",[zo]:"fire-fcm",[Go]:"fire-fcm-compat",[Yo]:"fire-perf",[qo]:"fire-perf-compat",[Ko]:"fire-rc",[Qo]:"fire-rc-compat",[Xo]:"fire-gcs",[Jo]:"fire-gcs-compat",[Zo]:"fire-fst",[ta]:"fire-fst-compat",[ea]:"fire-vertex","fire-js":"fire-js",[na]:"fire-js-all"};var ut=new Map,ra=new Map,Jt=new Map;function zi(n,e){try{n.container.addComponent(e)}catch(t){z.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function He(n){let e=n.name;if(Jt.has(e))return z.debug(`There were multiple attempts to register component ${e}.`),!1;Jt.set(e,n);for(let t of ut.values())zi(t,n);for(let t of ra.values())zi(t,n);return!0}function Ki(n,e){let t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}var oa={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},X=new Fe("app","Firebase",oa);var Zt=class{constructor(e,t,i){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new j("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw X.create("app-deleted",{appName:this._name})}};var Qi=ia;function nn(n,e={}){let t=n;typeof e!="object"&&(e={name:e});let i=Object.assign({name:Xt,automaticDataCollectionEnabled:!1},e),s=i.name;if(typeof s!="string"||!s)throw X.create("bad-app-name",{appName:String(s)});if(t||(t=Ut()),!t)throw X.create("no-options");let r=ut.get(s);if(r){if(at(t,r.options)&&at(i,r.config))return r;throw X.create("duplicate-app",{appName:s})}let o=new Ue(s);for(let l of Jt.values())o.addComponent(l);let a=new Zt(t,i,o);return ut.set(s,a),a}function Xi(n=Xt){let e=ut.get(n);if(!e&&n===Xt&&Ut())return nn();if(!e)throw X.create("no-app",{appName:n});return e}function J(n,e,t){var i;let s=(i=sa[n])!==null&&i!==void 0?i:n;t&&(s+=`-${t}`);let r=s.match(/\s|\//),o=e.match(/\s|\//);if(r||o){let a=[`Unable to register library "${s}" with version "${e}":`];r&&a.push(`library name "${s}" contains illegal characters (whitespace or "/")`),r&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),z.warn(a.join(" "));return}He(new j(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}var aa="firebase-heartbeat-database",la=1,Ve="firebase-heartbeat-store",qt=null;function Ji(){return qt||(qt=$i(aa,la,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Ve)}catch(t){console.warn(t)}}}}).catch(n=>{throw X.create("idb-open",{originalErrorMessage:n.message})})),qt}async function ca(n){try{let t=(await Ji()).transaction(Ve),i=await t.objectStore(Ve).get(Zi(n));return await t.done,i}catch(e){if(e instanceof ie)z.warn(e.message);else{let t=X.create("idb-get",{originalErrorMessage:e?.message});z.warn(t.message)}}}async function Gi(n,e){try{let i=(await Ji()).transaction(Ve,"readwrite");await i.objectStore(Ve).put(e,Zi(n)),await i.done}catch(t){if(t instanceof ie)z.warn(t.message);else{let i=X.create("idb-set",{originalErrorMessage:t?.message});z.warn(i.message)}}}function Zi(n){return`${n.name}!${n.options.appId}`}var ha=1024,ua=30*24*60*60*1e3,en=class{constructor(e){this.container=e,this._heartbeatsCache=null;let t=this.container.getProvider("app").getImmediate();this._storage=new tn(t),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var e,t;try{let s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=Yi();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(o=>o.date===r)?void 0:(this._heartbeatsCache.heartbeats.push({date:r,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{let a=new Date(o.date).valueOf();return Date.now()-a<=ua}),this._storage.overwrite(this._heartbeatsCache))}catch(i){z.warn(i)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";let t=Yi(),{heartbeatsToSend:i,unsentEntries:s}=da(this._heartbeatsCache.heartbeats),r=Le(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(t){return z.warn(t),""}}};function Yi(){return new Date().toISOString().substring(0,10)}function da(n,e=ha){let t=[],i=n.slice();for(let s of n){let r=t.find(o=>o.agent===s.agent);if(r){if(r.dates.push(s.date),qi(t)>e){r.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),qi(t)>e){t.pop();break}i=i.slice(1)}return{heartbeatsToSend:t,unsentEntries:i}}var tn=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ai()?ki().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let t=await ca(this.app);return t?.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){let s=await this.read();return Gi(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){let s=await this.read();return Gi(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}};function qi(n){return Le(JSON.stringify({version:2,heartbeats:n})).length}function fa(n){He(new j("platform-logger",e=>new Kt(e),"PRIVATE")),He(new j("heartbeat",e=>new en(e),"PRIVATE")),J(Qt,ji,n),J(Qt,ji,"esm2017"),J("fire-js","")}fa("");var _a="firebase",pa="10.14.1";J(_a,pa,"app");var es="@firebase/database",ts="1.0.8";var ni="";function ma(n){ni=n}var un=class{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),T(t))}get(e){let t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:ve(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}};var dn=class{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return H(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}};var Os=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){let e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new un(e)}}catch{}return new dn},ce=Os("localStorage"),fn=Os("sessionStorage");var be=new Ee("@firebase/database"),ga=function(){let n=1;return function(){return n++}}(),Ms=function(n){let e=Li(n),t=new rt;t.update(e);let i=t.digest();return ot.encodeByteArray(i)},Ze=function(...n){let e="";for(let t=0;t<n.length;t++){let i=n[t];Array.isArray(i)||i&&typeof i=="object"&&typeof i.length=="number"?e+=Ze.apply(null,i):typeof i=="object"?e+=T(i):e+=i,e+=" "}return e},ue=null,ns=!0,ya=function(n,e){f(!e||n===!0||n===!1,"Can't turn on custom loggers persistently."),n===!0?(be.logLevel=E.VERBOSE,ue=be.log.bind(be),e&&fn.set("logging_enabled",!0)):typeof n=="function"?ue=n:(ue=null,fn.remove("logging_enabled"))},R=function(...n){if(ns===!0&&(ns=!1,ue===null&&fn.get("logging_enabled")===!0&&ya(!0)),ue){let e=Ze.apply(null,n);ue(e)}},et=function(n){return function(...e){R(n,...e)}},_n=function(...n){let e="FIREBASE INTERNAL ERROR: "+Ze(...n);be.error(e)},Y=function(...n){let e=`FIREBASE FATAL ERROR: ${Ze(...n)}`;throw be.error(e),new Error(e)},k=function(...n){let e="FIREBASE WARNING: "+Ze(...n);be.warn(e)},va=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&k("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Ls=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},Ea=function(n){if(U()||document.readyState==="complete")n();else{let e=!1,t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},Se="[MIN_NAME]",de="[MAX_NAME]",Ae=function(n,e){if(n===e)return 0;if(n===Se||e===de)return-1;if(e===Se||n===de)return 1;{let t=is(n),i=is(e);return t!==null?i!==null?t-i===0?n.length-e.length:t-i:-1:i!==null?1:n<e?-1:1}},wa=function(n,e){return n===e?0:n<e?-1:1},$e=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+T(e))},ii=function(n){if(typeof n!="object"||n===null)return T(n);let e=[];for(let i in n)e.push(i);e.sort();let t="{";for(let i=0;i<e.length;i++)i!==0&&(t+=","),t+=T(e[i]),t+=":",t+=ii(n[e[i]]);return t+="}",t},Fs=function(n,e){let t=n.length;if(t<=e)return[n];let i=[];for(let s=0;s<t;s+=e)s+e>t?i.push(n.substring(s,t)):i.push(n.substring(s,s+e));return i};function L(n,e){for(let t in n)n.hasOwnProperty(t)&&e(t,n[t])}var Bs=function(n){f(!Ls(n),"Invalid JSON number");let e=11,t=52,i=(1<<e-1)-1,s,r,o,a,l;n===0?(r=0,o=0,s=1/n===-1/0?1:0):(s=n<0,n=Math.abs(n),n>=Math.pow(2,1-i)?(a=Math.min(Math.floor(Math.log(n)/Math.LN2),i),r=a+i,o=Math.round(n*Math.pow(2,t-a)-Math.pow(2,t))):(r=0,o=Math.round(n/Math.pow(2,1-i-t))));let c=[];for(l=t;l;l-=1)c.push(o%2?1:0),o=Math.floor(o/2);for(l=e;l;l-=1)c.push(r%2?1:0),r=Math.floor(r/2);c.push(s?1:0),c.reverse();let u=c.join(""),h="";for(l=0;l<64;l+=8){let d=parseInt(u.substr(l,8),2).toString(16);d.length===1&&(d="0"+d),h=h+d}return h.toLowerCase()},Ca=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},ba=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};var Ia=new RegExp("^-?(0*)\\d{1,10}$"),Sa=-2147483648,Ta=2147483647,is=function(n){if(Ia.test(n)){let e=Number(n);if(e>=Sa&&e<=Ta)return e}return null},ke=function(n){try{n()}catch(e){setTimeout(()=>{let t=e.stack||"";throw k("Exception was thrown by user callback.",t),e},Math.floor(0))}},Na=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},Ye=function(n,e){let t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};var pn=class{constructor(e,t){this.appName_=e,this.appCheckProvider=t,this.appCheck=t?.getImmediate({optional:!0}),this.appCheck||t?.get().then(i=>this.appCheck=i)}getToken(e){return this.appCheck?this.appCheck.getToken(e):new Promise((t,i)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)===null||t===void 0||t.get().then(i=>i.addTokenListener(e))}notifyForInvalidToken(){k(`Provided AppCheck credentials for the app named "${this.appName_}" are invalid. This usually indicates your app was not initialized correctly.`)}};var mn=class{constructor(e,t,i){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=i,this.auth_=null,this.auth_=i.getImmediate({optional:!0}),this.auth_||i.onInit(s=>this.auth_=s)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(R("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,i)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',k(e)}},Z=class{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}};Z.OWNER="owner";var ft="5",Ws="v",Us="s",Hs="r",Vs="f",$s=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,js="ls",zs="p",gn="ac",Gs="websocket",Ys="long_polling";var _t=class{constructor(e,t,i,s,r=!1,o="",a=!1,l=!1){this.secure=t,this.namespace=i,this.webSocketOnly=s,this.nodeAdmin=r,this.persistenceKey=o,this.includeNamespaceInQueryParams=a,this.isUsingEmulator=l,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=ce.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&ce.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){let e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}};function Ra(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function qs(n,e,t){f(typeof e=="string","typeof type must == string"),f(typeof t=="object","typeof params must == object");let i;if(e===Gs)i=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Ys)i=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);Ra(n)&&(t.ns=n.namespace);let s=[];return L(t,(r,o)=>{s.push(r+"="+o)}),i+s.join("&")}var yn=class{constructor(){this.counters_={}}incrementCounter(e,t=1){H(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return Ii(this.counters_)}};var sn={},rn={};function si(n){let e=n.toString();return sn[e]||(sn[e]=new yn),sn[e]}function xa(n,e){let t=n.toString();return rn[t]||(rn[t]=e()),rn[t]}var vn=class{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){let i=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let s=0;s<i.length;++s)i[s]&&ke(()=>{this.onMessage_(i[s])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}};var ss="start",Aa="close",ka="pLPCommand",Da="pRTLPCB",Ks="id",Qs="pw",Xs="ser",Pa="cb",Oa="seg",Ma="ts",La="d",Fa="dframe",Js=1870,Zs=30,Ba=Js-Zs,Wa=25e3,Ua=3e4,En=class n{constructor(e,t,i,s,r,o,a){this.connId=e,this.repoInfo=t,this.applicationId=i,this.appCheckToken=s,this.authToken=r,this.transportSessionId=o,this.lastSessionId=a,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=et(e),this.stats_=si(t),this.urlFn=l=>(this.appCheckToken&&(l[gn]=this.appCheckToken),qs(t,Ys,l))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new vn(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(Ua)),Ea(()=>{if(this.isClosed_)return;this.scriptTagHolder=new wn((...r)=>{let[o,a,l,c,u]=r;if(this.incrementIncomingBytes_(r),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===ss)this.id=a,this.password=l;else if(o===Aa)a?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(a,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...r)=>{let[o,a]=r;this.incrementIncomingBytes_(r),this.myPacketOrderer.handleResponse(o,a)},()=>{this.onClosed_()},this.urlFn);let i={};i[ss]="t",i[Xs]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(i[Pa]=this.scriptTagHolder.uniqueCallbackIdentifier),i[Ws]=ft,this.transportSessionId&&(i[Us]=this.transportSessionId),this.lastSessionId&&(i[js]=this.lastSessionId),this.applicationId&&(i[zs]=this.applicationId),this.appCheckToken&&(i[gn]=this.appCheckToken),typeof location<"u"&&location.hostname&&$s.test(location.hostname)&&(i[Hs]=Vs);let s=this.urlFn(i);this.log_("Connecting via long-poll to "+s),this.scriptTagHolder.addTag(s,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){n.forceAllow_=!0}static forceDisallow(){n.forceDisallow_=!0}static isAvailable(){return U()?!1:n.forceAllow_?!0:!n.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!Ca()&&!ba()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){let t=T(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);let i=Wt(t),s=Fs(i,Ba);for(let r=0;r<s.length;r++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,s.length,s[r]),this.curSegmentNum++}addDisconnectPingFrame(e,t){if(U())return;this.myDisconnFrame=document.createElement("iframe");let i={};i[Fa]="t",i[Ks]=e,i[Qs]=t,this.myDisconnFrame.src=this.urlFn(i),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){let t=T(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}},wn=class n{constructor(e,t,i,s){if(this.onDisconnect=i,this.urlFn=s,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0,U())this.commandCB=e,this.onMessageCB=t;else{this.uniqueCallbackIdentifier=ga(),window[ka+this.uniqueCallbackIdentifier]=e,window[Da+this.uniqueCallbackIdentifier]=t,this.myIFrame=n.createIFrame_();let r="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(r='<script>document.domain="'+document.domain+'";<\/script>');let o="<html><body>"+r+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(a){R("frame writing exception"),a.stack&&R(a.stack),R(a)}}}static createIFrame_(){let e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||R("No IE domain setting required")}catch{let i=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+i+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));let e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;let e={};e[Ks]=this.myID,e[Qs]=this.myPW,e[Xs]=this.currentSerial;let t=this.urlFn(e),i="",s=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+Zs+i.length<=Js;){let o=this.pendingSegs.shift();i=i+"&"+Oa+s+"="+o.seg+"&"+Ma+s+"="+o.ts+"&"+La+s+"="+o.d,s++}return t=t+i,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,i){this.pendingSegs.push({seg:e,ts:t,d:i}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);let i=()=>{this.outstandingRequests.delete(t),this.newRequest_()},s=setTimeout(i,Math.floor(Wa)),r=()=>{clearTimeout(s),i()};this.addTag(e,r)}addTag(e,t){U()?this.doNodeLongPoll(e,t):setTimeout(()=>{try{if(!this.sendNewPolls)return;let i=this.myIFrame.doc.createElement("script");i.type="text/javascript",i.async=!0,i.src=e,i.onload=i.onreadystatechange=function(){let s=i.readyState;(!s||s==="loaded"||s==="complete")&&(i.onload=i.onreadystatechange=null,i.parentNode&&i.parentNode.removeChild(i),t())},i.onerror=()=>{R("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(i)}catch{}},Math.floor(1))}};var Ha=16384,Va=45e3,pt=null;typeof MozWebSocket<"u"?pt=MozWebSocket:typeof WebSocket<"u"&&(pt=WebSocket);var G=class n{constructor(e,t,i,s,r,o,a){this.connId=e,this.applicationId=i,this.appCheckToken=s,this.authToken=r,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=et(this.connId),this.stats_=si(t),this.connURL=n.connectionURL_(t,o,a,s,i),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,i,s,r){let o={};return o[Ws]=ft,!U()&&typeof location<"u"&&location.hostname&&$s.test(location.hostname)&&(o[Hs]=Vs),t&&(o[Us]=t),i&&(o[js]=i),s&&(o[gn]=s),r&&(o[zs]=r),qs(e,Gs,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,ce.set("previous_websocket_failure",!0);try{let i;if(U()){let s=this.nodeAdmin?"AdminNode":"Node";i={headers:{"User-Agent":`Firebase/${ft}/${ni}/${process.platform}/${s}`,"X-Firebase-GMPID":this.applicationId||""}},this.authToken&&(i.headers.Authorization=`Bearer ${this.authToken}`),this.appCheckToken&&(i.headers["X-Firebase-AppCheck"]=this.appCheckToken);let r=process.env,o=this.connURL.indexOf("wss://")===0?r.HTTPS_PROXY||r.https_proxy:r.HTTP_PROXY||r.http_proxy;o&&(i.proxy={origin:o})}this.mySock=new pt(this.connURL,[],i)}catch(i){this.log_("Error instantiating WebSocket.");let s=i.message||i.data;s&&this.log_(s),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=i=>{this.handleIncomingFrame(i)},this.mySock.onerror=i=>{this.log_("WebSocket error.  Closing connection.");let s=i.message||i.data;s&&this.log_(s),this.onClosed_()}}start(){}static forceDisallow(){n.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){let t=/Android ([0-9]{0,}\.[0-9]{0,})/,i=navigator.userAgent.match(t);i&&i.length>1&&parseFloat(i[1])<4.4&&(e=!0)}return!e&&pt!==null&&!n.forceDisallow_}static previouslyFailed(){return ce.isInMemoryStorage||ce.get("previous_websocket_failure")===!0}markConnectionHealthy(){ce.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){let t=this.frames.join("");this.frames=null;let i=ve(t);this.onMessage(i)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(f(this.frames===null,"We already have a frame buffer"),e.length<=6){let t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;let t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{let i=this.extractFrameCount_(t);i!==null&&this.appendFrame_(i)}}send(e){this.resetKeepAlive();let t=T(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);let i=Fs(t,Ha);i.length>1&&this.sendString_(String(i.length));for(let s=0;s<i.length;s++)this.sendString_(i[s])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(Va))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}};G.responsesRequiredToBeHealthy=2;G.healthyTimeout=3e4;var mt=class n{constructor(e){this.initTransports_(e)}static get ALL_TRANSPORTS(){return[En,G]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}initTransports_(e){let t=G&&G.isAvailable(),i=t&&!G.previouslyFailed();if(e.webSocketOnly&&(t||k("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),i=!0),i)this.transports_=[G];else{let s=this.transports_=[];for(let r of n.ALL_TRANSPORTS)r&&r.isAvailable()&&s.push(r);n.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}};mt.globalTransportInitialized_=!1;var $a=6e4,ja=5e3,za=10*1024,Ga=100*1024,on="t",rs="d",Ya="s",os="r",qa="e",as="o",ls="a",cs="n",hs="p",Ka="h",Cn=class{constructor(e,t,i,s,r,o,a,l,c,u){this.id=e,this.repoInfo_=t,this.applicationId_=i,this.appCheckToken_=s,this.authToken_=r,this.onMessage_=o,this.onReady_=a,this.onDisconnect_=l,this.onKill_=c,this.lastSessionId=u,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=et("c:"+this.id+":"),this.transportManager_=new mt(t),this.log_("Connection created"),this.start_()}start_(){let e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;let t=this.connReceiver_(this.conn_),i=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,i)},Math.floor(0));let s=e.healthyTimeout||0;s>0&&(this.healthyTimeout_=Ye(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>Ga?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>za?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(s)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){let t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(on in e){let t=e[on];t===ls?this.upgradeIfSecondaryHealthy_():t===os?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===as&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){let t=$e("t",e),i=$e("d",e);if(t==="c")this.onSecondaryControl_(i);else if(t==="d")this.pendingDataMessages.push(i);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:hs,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:ls,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:cs,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){let t=$e("t",e),i=$e("d",e);t==="c"?this.onControl_(i):t==="d"&&this.onDataMessage_(i)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){let t=$e(on,e);if(rs in e){let i=e[rs];if(t===Ka){let s=Object.assign({},i);this.repoInfo_.isUsingEmulator&&(s.h=this.repoInfo_.host),this.onHandshake_(s)}else if(t===cs){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let s=0;s<this.pendingDataMessages.length;++s)this.onDataMessage_(this.pendingDataMessages[s]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===Ya?this.onConnectionShutdown_(i):t===os?this.onReset_(i):t===qa?_n("Server Error: "+i):t===as?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):_n("Unknown control packet command: "+t)}}onHandshake_(e){let t=e.ts,i=e.v,s=e.h;this.sessionId=e.s,this.repoInfo_.host=s,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),ft!==i&&k("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){let e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;let t=this.connReceiver_(this.secondaryConn_),i=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,i),Ye(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor($a))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Ye(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(ja))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:hs,d:{}}}))}onSecondaryConnectionLost_(){let e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(ce.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}};var gt=class{put(e,t,i,s){}merge(e,t,i,s){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,i){}onDisconnectMerge(e,t,i){}onDisconnectCancel(e,t){}reportStats(e){}};var yt=class{constructor(e){this.allowedEvents_=e,this.listeners_={},f(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){let i=[...this.listeners_[e]];for(let s=0;s<i.length;s++)i[s].callback.apply(i[s].context,t)}}on(e,t,i){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:i});let s=this.getInitialEvent(e);s&&t.apply(i,s)}off(e,t,i){this.validateEventType_(e);let s=this.listeners_[e]||[];for(let r=0;r<s.length;r++)if(s[r].callback===t&&(!i||i===s[r].context)){s.splice(r,1);return}}validateEventType_(e){f(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}};var vt=class n extends yt{constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!Ht()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}static getInstance(){return new n}getInitialEvent(e){return f(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}};var us=32,ds=768,w=class{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let i=0;for(let s=0;s<this.pieces_.length;s++)this.pieces_[s].length>0&&(this.pieces_[i]=this.pieces_[s],i++);this.pieces_.length=i,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}};function v(){return new w("")}function m(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function te(n){return n.pieces_.length-n.pieceNum_}function b(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new w(n.pieces_,e)}function er(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function Qa(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function tr(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function nr(n){if(n.pieceNum_>=n.pieces_.length)return null;let e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new w(e,0)}function I(n,e){let t=[];for(let i=n.pieceNum_;i<n.pieces_.length;i++)t.push(n.pieces_[i]);if(e instanceof w)for(let i=e.pieceNum_;i<e.pieces_.length;i++)t.push(e.pieces_[i]);else{let i=e.split("/");for(let s=0;s<i.length;s++)i[s].length>0&&t.push(i[s])}return new w(t,0)}function g(n){return n.pieceNum_>=n.pieces_.length}function O(n,e){let t=m(n),i=m(e);if(t===null)return e;if(t===i)return O(b(n),b(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function ir(n,e){if(te(n)!==te(e))return!1;for(let t=n.pieceNum_,i=e.pieceNum_;t<=n.pieces_.length;t++,i++)if(n.pieces_[t]!==e.pieces_[i])return!1;return!0}function B(n,e){let t=n.pieceNum_,i=e.pieceNum_;if(te(n)>te(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[i])return!1;++t,++i}return!0}var bn=class{constructor(e,t){this.errorPrefix_=t,this.parts_=tr(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let i=0;i<this.parts_.length;i++)this.byteLength_+=We(this.parts_[i]);sr(this)}};function Xa(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=We(e),sr(n)}function Ja(n){let e=n.parts_.pop();n.byteLength_-=We(e),n.parts_.length>0&&(n.byteLength_-=1)}function sr(n){if(n.byteLength_>ds)throw new Error(n.errorPrefix_+"has a key path longer than "+ds+" bytes ("+n.byteLength_+").");if(n.parts_.length>us)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+us+") or object contains a cycle "+le(n))}function le(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}var In=class n extends yt{constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{let i=!document[e];i!==this.visible_&&(this.visible_=i,this.trigger("visible",i))},!1)}static getInstance(){return new n}getInitialEvent(e){return f(e==="visible","Unknown event type: "+e),[this.visible_]}};var je=1e3,Za=60*5*1e3,fs=30*1e3,el=1.3,tl=3e4,nl="server_kill",_s=3,fe=class n extends gt{constructor(e,t,i,s,r,o,a,l){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=i,this.onConnectStatus_=s,this.onServerInfoUpdate_=r,this.authTokenProvider_=o,this.appCheckTokenProvider_=a,this.authOverride_=l,this.id=n.nextPersistentConnectionId_++,this.log_=et("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=je,this.maxReconnectDelay_=Za,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,l&&!U())throw new Error("Auth override specified in options, but not supported on non Node.js platforms");In.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&vt.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,i){let s=++this.requestNumber_,r={r:s,a:e,b:t};this.log_(T(r)),f(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(r),i&&(this.requestCBHash_[s]=i)}get(e){this.initConnection_();let t=new Q,s={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{let a=o.d;o.s==="ok"?t.resolve(a):t.reject(a)}};this.outstandingGets_.push(s),this.outstandingGetCount_++;let r=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(r),t.promise}listen(e,t,i,s){this.initConnection_();let r=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+r),this.listens.has(o)||this.listens.set(o,new Map),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),f(!this.listens.get(o).has(r),"listen() called twice for same path/queryId.");let a={onComplete:s,hashFn:t,query:e,tag:i};this.listens.get(o).set(r,a),this.connected_&&this.sendListen_(a)}sendGet_(e){let t=this.outstandingGets_[e];this.sendRequest("g",t.request,i=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(i)})}sendListen_(e){let t=e.query,i=t._path.toString(),s=t._queryIdentifier;this.log_("Listen on "+i+" for "+s);let r={p:i},o="q";e.tag&&(r.q=t._queryObject,r.t=e.tag),r.h=e.hashFn(),this.sendRequest(o,r,a=>{let l=a.d,c=a.s;n.warnOnListenWarnings_(l,t),(this.listens.get(i)&&this.listens.get(i).get(s))===e&&(this.log_("listen response",a),c!=="ok"&&this.removeListen_(i,s),e.onComplete&&e.onComplete(c,l))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&H(e,"w")){let i=re(e,"w");if(Array.isArray(i)&&~i.indexOf("no_index")){let s='".indexOn": "'+t._queryParams.getIndex().toString()+'"',r=t._path.toString();k(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${s} at ${r} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||Oi(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=fs)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){let e=this.authToken_,t=Pi(e)?"auth":"gauth",i={cred:e};this.authOverride_===null?i.noauth=!0:typeof this.authOverride_=="object"&&(i.authvar=this.authOverride_),this.sendRequest(t,i,s=>{let r=s.s,o=s.d||"error";this.authToken_===e&&(r==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(r,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{let t=e.s,i=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,i)})}unlisten(e,t){let i=e._path.toString(),s=e._queryIdentifier;this.log_("Unlisten called for "+i+" "+s),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(i,s)&&this.connected_&&this.sendUnlisten_(i,s,e._queryObject,t)}sendUnlisten_(e,t,i,s){this.log_("Unlisten on "+e+" for "+t);let r={p:e},o="n";s&&(r.q=i,r.t=s),this.sendRequest(o,r)}onDisconnectPut(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:i})}onDisconnectMerge(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:i})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,i,s){let r={p:t,d:i};this.log_("onDisconnect "+e,r),this.sendRequest(e,r,o=>{s&&setTimeout(()=>{s(o.s,o.d)},Math.floor(0))})}put(e,t,i,s){this.putInternal("p",e,t,i,s)}merge(e,t,i,s){this.putInternal("m",e,t,i,s)}putInternal(e,t,i,s,r){this.initConnection_();let o={p:t,d:i};r!==void 0&&(o.h=r),this.outstandingPuts_.push({action:e,request:o,onComplete:s}),this.outstandingPutCount_++;let a=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(a):this.log_("Buffering put: "+t)}sendPut_(e){let t=this.outstandingPuts_[e].action,i=this.outstandingPuts_[e].request,s=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,i,r=>{this.log_(t+" response",r),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),s&&s(r.s,r.d)})}reportStats(e){if(this.connected_){let t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,i=>{if(i.s!=="ok"){let r=i.d;this.log_("reportStats","Error sending stats: "+r)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+T(e));let t=e.r,i=this.requestCBHash_[t];i&&(delete this.requestCBHash_[t],i(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):_n("Unrecognized action received from server: "+T(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){f(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=je,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=je,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>tl&&(this.reconnectDelay_=je),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());let e=new Date().getTime()-this.lastConnectionAttemptTime_,t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*el)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;let e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),i=this.onRealtimeDisconnect_.bind(this),s=this.id+":"+n.nextConnectionId_++,r=this.lastSessionId,o=!1,a=null,l=function(){a?a.close():(o=!0,i())},c=function(h){f(a,"sendRequest call when we're not connected not allowed."),a.sendRequest(h)};this.realtime_={close:l,sendRequest:c};let u=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{let[h,d]=await Promise.all([this.authTokenProvider_.getToken(u),this.appCheckTokenProvider_.getToken(u)]);o?R("getToken() completed but was canceled"):(R("getToken() completed. Creating connection."),this.authToken_=h&&h.accessToken,this.appCheckToken_=d&&d.token,a=new Cn(s,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,i,_=>{k(_+" ("+this.repoInfo_.toString()+")"),this.interrupt(nl)},r))}catch(h){this.log_("Failed to get token: "+h),o||(this.repoInfo_.nodeAdmin&&k(h),l())}}}interrupt(e){R("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){R("Resuming connection for reason: "+e),delete this.interruptReasons_[e],Vt(this.interruptReasons_)&&(this.reconnectDelay_=je,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){let t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){let t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let i;t?i=t.map(r=>ii(r)).join("$"):i="default";let s=this.removeListen_(e,i);s&&s.onComplete&&s.onComplete("permission_denied")}removeListen_(e,t){let i=new w(e).toString(),s;if(this.listens.has(i)){let r=this.listens.get(i);s=r.get(t),r.delete(t),r.size===0&&this.listens.delete(i)}else s=void 0;return s}onAuthRevoked_(e,t){R("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=_s&&(this.reconnectDelay_=fs,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){R("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=_s&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(let e of this.listens.values())for(let t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){let e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){let e={},t="js";U()&&(this.repoInfo_.nodeAdmin?t="admin_node":t="node"),e["sdk."+t+"."+ni.replace(/\./g,"-")]=1,Ht()?e["framework.cordova"]=1:xi()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){let e=vt.getInstance().currentlyOnline();return Vt(this.interruptReasons_)&&e}};fe.nextPersistentConnectionId_=0;fe.nextConnectionId_=0;var y=class n{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new n(e,t)}};var Te=class{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){let i=new y(Se,e),s=new y(Se,t);return this.compare(i,s)!==0}minPost(){return y.MIN}};var dt,Et=class extends Te{static get __EMPTY_NODE(){return dt}static set __EMPTY_NODE(e){dt=e}compare(e,t){return Ae(e.name,t.name)}isDefinedOn(e){throw se("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return y.MIN}maxPost(){return new y(de,dt)}makePost(e,t){return f(typeof e=="string","KeyIndex indexValue must always be a string."),new y(e,dt)}toString(){return".key"}},Ie=new Et;var Ce=class{constructor(e,t,i,s,r=null){this.isReverse_=s,this.resultGenerator_=r,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?i(e.key,t):1,s&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}},A=class n{constructor(e,t,i,s,r){this.key=e,this.value=t,this.color=i??n.RED,this.left=s??M.EMPTY_NODE,this.right=r??M.EMPTY_NODE}copy(e,t,i,s,r){return new n(e??this.key,t??this.value,i??this.color,s??this.left,r??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,i){let s=this,r=i(e,s.key);return r<0?s=s.copy(null,null,null,s.left.insert(e,t,i),null):r===0?s=s.copy(null,t,null,null,null):s=s.copy(null,null,null,null,s.right.insert(e,t,i)),s.fixUp_()}removeMin_(){if(this.left.isEmpty())return M.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let i,s;if(i=this,t(e,i.key)<0)!i.left.isEmpty()&&!i.left.isRed_()&&!i.left.left.isRed_()&&(i=i.moveRedLeft_()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed_()&&(i=i.rotateRight_()),!i.right.isEmpty()&&!i.right.isRed_()&&!i.right.left.isRed_()&&(i=i.moveRedRight_()),t(e,i.key)===0){if(i.right.isEmpty())return M.EMPTY_NODE;s=i.right.min_(),i=i.copy(s.key,s.value,null,null,i.right.removeMin_())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){let e=this.copy(null,null,n.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){let e=this.copy(null,null,n.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){let e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){let e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");let e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}};A.RED=!0;A.BLACK=!1;var Sn=class{copy(e,t,i,s,r){return this}insert(e,t,i){return new A(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}},M=class n{constructor(e,t=n.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new n(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,A.BLACK,null,null))}remove(e){return new n(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,A.BLACK,null,null))}get(e){let t,i=this.root_;for(;!i.isEmpty();){if(t=this.comparator_(e,i.key),t===0)return i.value;t<0?i=i.left:t>0&&(i=i.right)}return null}getPredecessorKey(e){let t,i=this.root_,s=null;for(;!i.isEmpty();)if(t=this.comparator_(e,i.key),t===0){if(i.left.isEmpty())return s?s.key:null;for(i=i.left;!i.right.isEmpty();)i=i.right;return i.key}else t<0?i=i.left:t>0&&(s=i,i=i.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new Ce(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new Ce(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new Ce(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new Ce(this.root_,null,this.comparator_,!0,e)}};M.EMPTY_NODE=new Sn;function il(n,e){return Ae(n.name,e.name)}function ri(n,e){return Ae(n,e)}var Tn;function sl(n){Tn=n}var rr=function(n){return typeof n=="number"?"number:"+Bs(n):"string:"+n},or=function(n){if(n.isLeafNode()){let e=n.val();f(typeof e=="string"||typeof e=="number"||typeof e=="object"&&H(e,".sv"),"Priority must be a string or number.")}else f(n===Tn||n.isEmpty(),"priority of unexpected type.");f(n===Tn||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};var ps,q=class n{constructor(e,t=n.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,f(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),or(this.priorityNode_)}static set __childrenNodeConstructor(e){ps=e}static get __childrenNodeConstructor(){return ps}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new n(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:n.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return g(e)?this:m(e)===".priority"?this.priorityNode_:n.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:n.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){let i=m(e);return i===null?t:t.isEmpty()&&i!==".priority"?this:(f(i!==".priority"||te(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(i,n.__childrenNodeConstructor.EMPTY_NODE.updateChild(b(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+rr(this.priorityNode_.val())+":");let t=typeof this.value_;e+=t+":",t==="number"?e+=Bs(this.value_):e+=this.value_,this.lazyHash_=Ms(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===n.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof n.__childrenNodeConstructor?-1:(f(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){let t=typeof e.value_,i=typeof this.value_,s=n.VALUE_TYPE_ORDER.indexOf(t),r=n.VALUE_TYPE_ORDER.indexOf(i);return f(s>=0,"Unknown leaf type: "+t),f(r>=0,"Unknown leaf type: "+i),s===r?i==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:r-s}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){let t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}};q.VALUE_TYPE_ORDER=["object","boolean","number","string"];var ar,lr;function rl(n){ar=n}function ol(n){lr=n}var Nn=class extends Te{compare(e,t){let i=e.node.getPriority(),s=t.node.getPriority(),r=i.compareTo(s);return r===0?Ae(e.name,t.name):r}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return y.MIN}maxPost(){return new y(de,new q("[PRIORITY-POST]",lr))}makePost(e,t){let i=ar(e);return new y(t,new q("[PRIORITY-POST]",i))}toString(){return".priority"}},x=new Nn;var al=Math.log(2),Rn=class{constructor(e){let t=r=>parseInt(Math.log(r)/al,10),i=r=>parseInt(Array(r+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;let s=i(this.count);this.bits_=e+1&s}nextBitIsOne(){let e=!(this.bits_&1<<this.current_);return this.current_--,e}},wt=function(n,e,t,i){n.sort(e);let s=function(l,c){let u=c-l,h,d;if(u===0)return null;if(u===1)return h=n[l],d=t?t(h):h,new A(d,h.node,A.BLACK,null,null);{let _=parseInt(u/2,10)+l,p=s(l,_),S=s(_+1,c);return h=n[_],d=t?t(h):h,new A(d,h.node,A.BLACK,p,S)}},r=function(l){let c=null,u=null,h=n.length,d=function(p,S){let P=h-p,Ot=h;h-=p;let st=s(P+1,Ot),Mt=n[P],to=t?t(Mt):Mt;_(new A(to,Mt.node,S,null,st))},_=function(p){c?(c.left=p,c=p):(u=p,c=p)};for(let p=0;p<l.count;++p){let S=l.nextBitIsOne(),P=Math.pow(2,l.count-(p+1));S?d(P,A.BLACK):(d(P,A.BLACK),d(P,A.RED))}return u},o=new Rn(n.length),a=r(o);return new M(i||e,a)};var an,we={},Ne=class n{constructor(e,t){this.indexes_=e,this.indexSet_=t}static get Default(){return f(we&&x,"ChildrenNode.ts has not been loaded"),an=an||new n({".priority":we},{".priority":x}),an}get(e){let t=re(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof M?t:null}hasIndex(e){return H(this.indexSet_,e.toString())}addIndex(e,t){f(e!==Ie,"KeyIndex always exists and isn't meant to be added to the IndexMap.");let i=[],s=!1,r=t.getIterator(y.Wrap),o=r.getNext();for(;o;)s=s||e.isDefinedOn(o.node),i.push(o),o=r.getNext();let a;s?a=wt(i,e.getCompare()):a=we;let l=e.toString(),c=Object.assign({},this.indexSet_);c[l]=e;let u=Object.assign({},this.indexes_);return u[l]=a,new n(u,c)}addToIndexes(e,t){let i=Be(this.indexes_,(s,r)=>{let o=re(this.indexSet_,r);if(f(o,"Missing index implementation for "+r),s===we)if(o.isDefinedOn(e.node)){let a=[],l=t.getIterator(y.Wrap),c=l.getNext();for(;c;)c.name!==e.name&&a.push(c),c=l.getNext();return a.push(e),wt(a,o.getCompare())}else return we;else{let a=t.get(e.name),l=s;return a&&(l=l.remove(new y(e.name,a))),l.insert(e,e.node)}});return new n(i,this.indexSet_)}removeFromIndexes(e,t){let i=Be(this.indexes_,s=>{if(s===we)return s;{let r=t.get(e.name);return r?s.remove(new y(e.name,r)):s}});return new n(i,this.indexSet_)}};var ze,C=class n{constructor(e,t,i){this.children_=e,this.priorityNode_=t,this.indexMap_=i,this.lazyHash_=null,this.priorityNode_&&or(this.priorityNode_),this.children_.isEmpty()&&f(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}static get EMPTY_NODE(){return ze||(ze=new n(new M(ri),null,Ne.Default))}isLeafNode(){return!1}getPriority(){return this.priorityNode_||ze}updatePriority(e){return this.children_.isEmpty()?this:new n(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{let t=this.children_.get(e);return t===null?ze:t}}getChild(e){let t=m(e);return t===null?this:this.getImmediateChild(t).getChild(b(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(f(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{let i=new y(e,t),s,r;t.isEmpty()?(s=this.children_.remove(e),r=this.indexMap_.removeFromIndexes(i,this.children_)):(s=this.children_.insert(e,t),r=this.indexMap_.addToIndexes(i,this.children_));let o=s.isEmpty()?ze:this.priorityNode_;return new n(s,o,r)}}updateChild(e,t){let i=m(e);if(i===null)return t;{f(m(e)!==".priority"||te(e)===1,".priority must be the last token in a path");let s=this.getImmediateChild(i).updateChild(b(e),t);return this.updateImmediateChild(i,s)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;let t={},i=0,s=0,r=!0;if(this.forEachChild(x,(o,a)=>{t[o]=a.val(e),i++,r&&n.INTEGER_REGEXP_.test(o)?s=Math.max(s,Number(o)):r=!1}),!e&&r&&s<2*i){let o=[];for(let a in t)o[a]=t[a];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+rr(this.getPriority().val())+":"),this.forEachChild(x,(t,i)=>{let s=i.hash();s!==""&&(e+=":"+t+":"+s)}),this.lazyHash_=e===""?"":Ms(e)}return this.lazyHash_}getPredecessorChildName(e,t,i){let s=this.resolveIndex_(i);if(s){let r=s.getPredecessorKey(new y(e,t));return r?r.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){let t=this.resolveIndex_(e);if(t){let i=t.minKey();return i&&i.name}else return this.children_.minKey()}getFirstChild(e){let t=this.getFirstChildName(e);return t?new y(t,this.children_.get(t)):null}getLastChildName(e){let t=this.resolveIndex_(e);if(t){let i=t.maxKey();return i&&i.name}else return this.children_.maxKey()}getLastChild(e){let t=this.getLastChildName(e);return t?new y(t,this.children_.get(t)):null}forEachChild(e,t){let i=this.resolveIndex_(e);return i?i.inorderTraversal(s=>t(s.name,s.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){let i=this.resolveIndex_(t);if(i)return i.getIteratorFrom(e,s=>s);{let s=this.children_.getIteratorFrom(e.name,y.Wrap),r=s.peek();for(;r!=null&&t.compare(r,e)<0;)s.getNext(),r=s.peek();return s}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){let i=this.resolveIndex_(t);if(i)return i.getReverseIteratorFrom(e,s=>s);{let s=this.children_.getReverseIteratorFrom(e.name,y.Wrap),r=s.peek();for(;r!=null&&t.compare(r,e)>0;)s.getNext(),r=s.peek();return s}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===tt?-1:0}withIndex(e){if(e===Ie||this.indexMap_.hasIndex(e))return this;{let t=this.indexMap_.addIndex(e,this.children_);return new n(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Ie||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{let t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){let i=this.getIterator(x),s=t.getIterator(x),r=i.getNext(),o=s.getNext();for(;r&&o;){if(r.name!==o.name||!r.node.equals(o.node))return!1;r=i.getNext(),o=s.getNext()}return r===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===Ie?null:this.indexMap_.get(e.toString())}};C.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;var xn=class extends C{constructor(){super(new M(ri),C.EMPTY_NODE,Ne.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return C.EMPTY_NODE}isEmpty(){return!1}},tt=new xn;Object.defineProperties(y,{MIN:{value:new y(Se,C.EMPTY_NODE)},MAX:{value:new y(de,tt)}});Et.__EMPTY_NODE=C.EMPTY_NODE;q.__childrenNodeConstructor=C;sl(tt);ol(tt);var ll=!0;function N(n,e=null){if(n===null)return C.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),f(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){let t=n;return new q(t,N(e))}if(!(n instanceof Array)&&ll){let t=[],i=!1;if(L(n,(o,a)=>{if(o.substring(0,1)!=="."){let l=N(a);l.isEmpty()||(i=i||!l.getPriority().isEmpty(),t.push(new y(o,l)))}}),t.length===0)return C.EMPTY_NODE;let r=wt(t,il,o=>o.name,ri);if(i){let o=wt(t,x.getCompare());return new C(r,N(e),new Ne({".priority":o},{".priority":x}))}else return new C(r,N(e),Ne.Default)}else{let t=C.EMPTY_NODE;return L(n,(i,s)=>{if(H(n,i)&&i.substring(0,1)!=="."){let r=N(s);(r.isLeafNode()||!r.isEmpty())&&(t=t.updateImmediateChild(i,r))}}),t.updatePriority(N(e))}}rl(N);var An=class extends Te{constructor(e){super(),this.indexPath_=e,f(!g(e)&&m(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){let i=this.extractChild(e.node),s=this.extractChild(t.node),r=i.compareTo(s);return r===0?Ae(e.name,t.name):r}makePost(e,t){let i=N(e),s=C.EMPTY_NODE.updateChild(this.indexPath_,i);return new y(t,s)}maxPost(){let e=C.EMPTY_NODE.updateChild(this.indexPath_,tt);return new y(de,e)}toString(){return tr(this.indexPath_,0).join("/")}};var kn=class extends Te{compare(e,t){let i=e.node.compareTo(t.node);return i===0?Ae(e.name,t.name):i}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return y.MIN}maxPost(){return y.MAX}makePost(e,t){let i=N(e);return new y(t,i)}toString(){return".value"}},cl=new kn;function hl(n){return{type:"value",snapshotNode:n}}function ul(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function dl(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function ms(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function fl(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}var Dn=class n{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=x}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return f(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return f(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:Se}hasEnd(){return this.endSet_}getIndexEndValue(){return f(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return f(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:de}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return f(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===x}copy(){let e=new n;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}};function gs(n){let e={};if(n.isDefault())return e;let t;if(n.index_===x?t="$priority":n.index_===cl?t="$value":n.index_===Ie?t="$key":(f(n.index_ instanceof An,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=T(t),n.startSet_){let i=n.startAfterSet_?"startAfter":"startAt";e[i]=T(n.indexStartValue_),n.startNameSet_&&(e[i]+=","+T(n.indexStartName_))}if(n.endSet_){let i=n.endBeforeSet_?"endBefore":"endAt";e[i]=T(n.indexEndValue_),n.endNameSet_&&(e[i]+=","+T(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function ys(n){let e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==x&&(e.i=n.index_.toString()),e}var Pn=class n extends gt{constructor(e,t,i,s){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=i,this.appCheckTokenProvider_=s,this.log_=et("p:rest:"),this.listens_={}}reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(f(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}listen(e,t,i,s){let r=e._path.toString();this.log_("Listen called for "+r+" "+e._queryIdentifier);let o=n.getListenId_(e,i),a={};this.listens_[o]=a;let l=gs(e._queryParams);this.restRequest_(r+".json",l,(c,u)=>{let h=u;if(c===404&&(h=null,c=null),c===null&&this.onDataUpdate_(r,h,!1,i),re(this.listens_,o)===a){let d;c?c===401?d="permission_denied":d="rest_error:"+c:d="ok",s(d,null)}})}unlisten(e,t){let i=n.getListenId_(e,t);delete this.listens_[i]}get(e){let t=gs(e._queryParams),i=e._path.toString(),s=new Q;return this.restRequest_(i+".json",t,(r,o)=>{let a=o;r===404&&(a=null,r=null),r===null?(this.onDataUpdate_(i,a,!1,null),s.resolve(a)):s.reject(new Error(a))}),s.promise}refreshAuthToken(e){}restRequest_(e,t={},i){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([s,r])=>{s&&s.accessToken&&(t.auth=s.accessToken),r&&r.token&&(t.ac=r.token);let o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+Mi(t);this.log_("Sending REST request for "+o);let a=new XMLHttpRequest;a.onreadystatechange=()=>{if(i&&a.readyState===4){this.log_("REST Response for "+o+" received. status:",a.status,"response:",a.responseText);let l=null;if(a.status>=200&&a.status<300){try{l=ve(a.responseText)}catch{k("Failed to parse JSON response for "+o+": "+a.responseText)}i(null,l)}else a.status!==401&&a.status!==404&&k("Got unsuccessful REST response for "+o+" Status: "+a.status),i(a.status);i=null}},a.open("GET",o,!0),a.send()})}};var On=class{constructor(){this.rootNode_=C.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}};function Ct(){return{value:null,children:new Map}}function cr(n,e,t){if(g(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{let i=m(e);n.children.has(i)||n.children.set(i,Ct());let s=n.children.get(i);e=b(e),cr(s,e,t)}}function Mn(n,e,t){n.value!==null?t(e,n.value):_l(n,(i,s)=>{let r=new w(e.toString()+"/"+i);Mn(s,r,t)})}function _l(n,e){n.children.forEach((t,i)=>{e(i,t)})}var Ln=class{constructor(e){this.collection_=e,this.last_=null}get(){let e=this.collection_.get(),t=Object.assign({},e);return this.last_&&L(this.last_,(i,s)=>{t[i]=t[i]-s}),this.last_=e,t}};var vs=10*1e3,pl=30*1e3,ml=5*60*1e3,Fn=class{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new Ln(e);let i=vs+(pl-vs)*Math.random();Ye(this.reportStats_.bind(this),Math.floor(i))}reportStats_(){let e=this.statsListener_.get(),t={},i=!1;L(e,(s,r)=>{r>0&&H(this.statsToReport_,s)&&(t[s]=r,i=!0)}),i&&this.server_.reportStats(t),Ye(this.reportStats_.bind(this),Math.floor(Math.random()*2*ml))}};var $;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})($||($={}));function hr(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function ur(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function dr(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}var Bn=class n{constructor(e,t,i){this.path=e,this.affectedTree=t,this.revert=i,this.type=$.ACK_USER_WRITE,this.source=hr()}operationForChild(e){if(g(this.path)){if(this.affectedTree.value!=null)return f(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{let t=this.affectedTree.subtree(new w(e));return new n(v(),t,this.revert)}}else return f(m(this.path)===e,"operationForChild called for unrelated child."),new n(b(this.path),this.affectedTree,this.revert)}};var Re=class n{constructor(e,t,i){this.source=e,this.path=t,this.snap=i,this.type=$.OVERWRITE}operationForChild(e){return g(this.path)?new n(this.source,v(),this.snap.getImmediateChild(e)):new n(this.source,b(this.path),this.snap)}};var bt=class n{constructor(e,t,i){this.source=e,this.path=t,this.children=i,this.type=$.MERGE}operationForChild(e){if(g(this.path)){let t=this.children.subtree(new w(e));return t.isEmpty()?null:t.value?new Re(this.source,v(),t.value):new n(this.source,v(),t)}else return f(m(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new n(this.source,b(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}};var Qe=class{constructor(e,t,i){this.node_=e,this.fullyInitialized_=t,this.filtered_=i}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(g(e))return this.isFullyInitialized()&&!this.filtered_;let t=m(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}};function gl(n,e,t,i){let s=[],r=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&r.push(fl(o.childName,o.snapshotNode))}),Ge(n,s,"child_removed",e,i,t),Ge(n,s,"child_added",e,i,t),Ge(n,s,"child_moved",r,i,t),Ge(n,s,"child_changed",e,i,t),Ge(n,s,"value",e,i,t),s}function Ge(n,e,t,i,s,r){let o=i.filter(a=>a.type===t);o.sort((a,l)=>vl(n,a,l)),o.forEach(a=>{let l=yl(n,a,r);s.forEach(c=>{c.respondsTo(a.type)&&e.push(c.createEvent(l,n.query_))})})}function yl(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function vl(n,e,t){if(e.childName==null||t.childName==null)throw se("Should only compare child_ events.");let i=new y(e.childName,e.snapshotNode),s=new y(t.childName,t.snapshotNode);return n.index_.compare(i,s)}function fr(n,e){return{eventCache:n,serverCache:e}}function qe(n,e,t,i){return fr(new Qe(e,t,i),n.serverCache)}function _r(n,e,t,i){return fr(n.eventCache,new Qe(e,t,i))}function Wn(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function _e(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}var ln,El=()=>(ln||(ln=new M(wa)),ln),D=class n{constructor(e,t=El()){this.value=e,this.children=t}static fromObject(e){let t=new n(null);return L(e,(i,s)=>{t=t.set(new w(i),s)}),t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:v(),value:this.value};if(g(e))return null;{let i=m(e),s=this.children.get(i);if(s!==null){let r=s.findRootMostMatchingPathAndValue(b(e),t);return r!=null?{path:I(new w(i),r.path),value:r.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(g(e))return this;{let t=m(e),i=this.children.get(t);return i!==null?i.subtree(b(e)):new n(null)}}set(e,t){if(g(e))return new n(t,this.children);{let i=m(e),r=(this.children.get(i)||new n(null)).set(b(e),t),o=this.children.insert(i,r);return new n(this.value,o)}}remove(e){if(g(e))return this.children.isEmpty()?new n(null):new n(null,this.children);{let t=m(e),i=this.children.get(t);if(i){let s=i.remove(b(e)),r;return s.isEmpty()?r=this.children.remove(t):r=this.children.insert(t,s),this.value===null&&r.isEmpty()?new n(null):new n(this.value,r)}else return this}}get(e){if(g(e))return this.value;{let t=m(e),i=this.children.get(t);return i?i.get(b(e)):null}}setTree(e,t){if(g(e))return t;{let i=m(e),r=(this.children.get(i)||new n(null)).setTree(b(e),t),o;return r.isEmpty()?o=this.children.remove(i):o=this.children.insert(i,r),new n(this.value,o)}}fold(e){return this.fold_(v(),e)}fold_(e,t){let i={};return this.children.inorderTraversal((s,r)=>{i[s]=r.fold_(I(e,s),t)}),t(e,this.value,i)}findOnPath(e,t){return this.findOnPath_(e,v(),t)}findOnPath_(e,t,i){let s=this.value?i(t,this.value):!1;if(s)return s;if(g(e))return null;{let r=m(e),o=this.children.get(r);return o?o.findOnPath_(b(e),I(t,r),i):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,v(),t)}foreachOnPath_(e,t,i){if(g(e))return this;{this.value&&i(t,this.value);let s=m(e),r=this.children.get(s);return r?r.foreachOnPath_(b(e),I(t,s),i):new n(null)}}foreach(e){this.foreach_(v(),e)}foreach_(e,t){this.children.inorderTraversal((i,s)=>{s.foreach_(I(e,i),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,i)=>{i.value&&e(t,i.value)})}};var W=class n{constructor(e){this.writeTree_=e}static empty(){return new n(new D(null))}};function Ke(n,e,t){if(g(e))return new W(new D(t));{let i=n.writeTree_.findRootMostValueAndPath(e);if(i!=null){let s=i.path,r=i.value,o=O(s,e);return r=r.updateChild(o,t),new W(n.writeTree_.set(s,r))}else{let s=new D(t),r=n.writeTree_.setTree(e,s);return new W(r)}}}function Es(n,e,t){let i=n;return L(t,(s,r)=>{i=Ke(i,I(e,s),r)}),i}function ws(n,e){if(g(e))return W.empty();{let t=n.writeTree_.setTree(e,new D(null));return new W(t)}}function Un(n,e){return me(n,e)!=null}function me(n,e){let t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(O(t.path,e)):null}function Cs(n){let e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(x,(i,s)=>{e.push(new y(i,s))}):n.writeTree_.children.inorderTraversal((i,s)=>{s.value!=null&&e.push(new y(i,s.value))}),e}function ee(n,e){if(g(e))return n;{let t=me(n,e);return t!=null?new W(new D(t)):new W(n.writeTree_.subtree(e))}}function Hn(n){return n.writeTree_.isEmpty()}function xe(n,e){return pr(v(),n.writeTree_,e)}function pr(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let i=null;return e.children.inorderTraversal((s,r)=>{s===".priority"?(f(r.value!==null,"Priority writes must always be leaf nodes"),i=r.value):t=pr(I(n,s),r,t)}),!t.getChild(n).isEmpty()&&i!==null&&(t=t.updateChild(I(n,".priority"),i)),t}}function mr(n,e){return wr(e,n)}function wl(n,e,t,i,s){f(i>n.lastWriteId,"Stacking an older write on top of newer ones"),s===void 0&&(s=!0),n.allWrites.push({path:e,snap:t,writeId:i,visible:s}),s&&(n.visibleWrites=Ke(n.visibleWrites,e,t)),n.lastWriteId=i}function Cl(n,e){for(let t=0;t<n.allWrites.length;t++){let i=n.allWrites[t];if(i.writeId===e)return i}return null}function bl(n,e){let t=n.allWrites.findIndex(a=>a.writeId===e);f(t>=0,"removeWrite called with nonexistent writeId.");let i=n.allWrites[t];n.allWrites.splice(t,1);let s=i.visible,r=!1,o=n.allWrites.length-1;for(;s&&o>=0;){let a=n.allWrites[o];a.visible&&(o>=t&&Il(a,i.path)?s=!1:B(i.path,a.path)&&(r=!0)),o--}if(s){if(r)return Sl(n),!0;if(i.snap)n.visibleWrites=ws(n.visibleWrites,i.path);else{let a=i.children;L(a,l=>{n.visibleWrites=ws(n.visibleWrites,I(i.path,l))})}return!0}else return!1}function Il(n,e){if(n.snap)return B(n.path,e);for(let t in n.children)if(n.children.hasOwnProperty(t)&&B(I(n.path,t),e))return!0;return!1}function Sl(n){n.visibleWrites=gr(n.allWrites,Tl,v()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function Tl(n){return n.visible}function gr(n,e,t){let i=W.empty();for(let s=0;s<n.length;++s){let r=n[s];if(e(r)){let o=r.path,a;if(r.snap)B(t,o)?(a=O(t,o),i=Ke(i,a,r.snap)):B(o,t)&&(a=O(o,t),i=Ke(i,v(),r.snap.getChild(a)));else if(r.children){if(B(t,o))a=O(t,o),i=Es(i,a,r.children);else if(B(o,t))if(a=O(o,t),g(a))i=Es(i,v(),r.children);else{let l=re(r.children,m(a));if(l){let c=l.getChild(b(a));i=Ke(i,v(),c)}}}else throw se("WriteRecord should have .snap or .children")}}return i}function yr(n,e,t,i,s){if(!i&&!s){let r=me(n.visibleWrites,e);if(r!=null)return r;{let o=ee(n.visibleWrites,e);if(Hn(o))return t;if(t==null&&!Un(o,v()))return null;{let a=t||C.EMPTY_NODE;return xe(o,a)}}}else{let r=ee(n.visibleWrites,e);if(!s&&Hn(r))return t;if(!s&&t==null&&!Un(r,v()))return null;{let o=function(c){return(c.visible||s)&&(!i||!~i.indexOf(c.writeId))&&(B(c.path,e)||B(e,c.path))},a=gr(n.allWrites,o,e),l=t||C.EMPTY_NODE;return xe(a,l)}}}function Nl(n,e,t){let i=C.EMPTY_NODE,s=me(n.visibleWrites,e);if(s)return s.isLeafNode()||s.forEachChild(x,(r,o)=>{i=i.updateImmediateChild(r,o)}),i;if(t){let r=ee(n.visibleWrites,e);return t.forEachChild(x,(o,a)=>{let l=xe(ee(r,new w(o)),a);i=i.updateImmediateChild(o,l)}),Cs(r).forEach(o=>{i=i.updateImmediateChild(o.name,o.node)}),i}else{let r=ee(n.visibleWrites,e);return Cs(r).forEach(o=>{i=i.updateImmediateChild(o.name,o.node)}),i}}function Rl(n,e,t,i,s){f(i||s,"Either existingEventSnap or existingServerSnap must exist");let r=I(e,t);if(Un(n.visibleWrites,r))return null;{let o=ee(n.visibleWrites,r);return Hn(o)?s.getChild(t):xe(o,s.getChild(t))}}function xl(n,e,t,i){let s=I(e,t),r=me(n.visibleWrites,s);if(r!=null)return r;if(i.isCompleteForChild(t)){let o=ee(n.visibleWrites,s);return xe(o,i.getNode().getImmediateChild(t))}else return null}function Al(n,e){return me(n.visibleWrites,e)}function kl(n,e,t,i,s,r,o){let a,l=ee(n.visibleWrites,e),c=me(l,v());if(c!=null)a=c;else if(t!=null)a=xe(l,t);else return[];if(a=a.withIndex(o),!a.isEmpty()&&!a.isLeafNode()){let u=[],h=o.getCompare(),d=r?a.getReverseIteratorFrom(i,o):a.getIteratorFrom(i,o),_=d.getNext();for(;_&&u.length<s;)h(_,i)!==0&&u.push(_),_=d.getNext();return u}else return[]}function Dl(){return{visibleWrites:W.empty(),allWrites:[],lastWriteId:-1}}function Vn(n,e,t,i){return yr(n.writeTree,n.treePath,e,t,i)}function vr(n,e){return Nl(n.writeTree,n.treePath,e)}function bs(n,e,t,i){return Rl(n.writeTree,n.treePath,e,t,i)}function It(n,e){return Al(n.writeTree,I(n.treePath,e))}function Pl(n,e,t,i,s,r){return kl(n.writeTree,n.treePath,e,t,i,s,r)}function oi(n,e,t){return xl(n.writeTree,n.treePath,e,t)}function Er(n,e){return wr(I(n.treePath,e),n.writeTree)}function wr(n,e){return{treePath:n,writeTree:e}}var $n=class{constructor(){this.changeMap=new Map}trackChildChange(e){let t=e.type,i=e.childName;f(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),f(i!==".priority","Only non-priority child changes can be tracked.");let s=this.changeMap.get(i);if(s){let r=s.type;if(t==="child_added"&&r==="child_removed")this.changeMap.set(i,ms(i,e.snapshotNode,s.snapshotNode));else if(t==="child_removed"&&r==="child_added")this.changeMap.delete(i);else if(t==="child_removed"&&r==="child_changed")this.changeMap.set(i,dl(i,s.oldSnap));else if(t==="child_changed"&&r==="child_added")this.changeMap.set(i,ul(i,e.snapshotNode));else if(t==="child_changed"&&r==="child_changed")this.changeMap.set(i,ms(i,e.snapshotNode,s.oldSnap));else throw se("Illegal combination of changes: "+e+" occurred after "+s)}else this.changeMap.set(i,e)}getChanges(){return Array.from(this.changeMap.values())}};var jn=class{getCompleteChild(e){return null}getChildAfterChild(e,t,i){return null}},Cr=new jn,Xe=class{constructor(e,t,i=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=i}getCompleteChild(e){let t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{let i=this.optCompleteServerCache_!=null?new Qe(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return oi(this.writes_,e,i)}}getChildAfterChild(e,t,i){let s=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:_e(this.viewCache_),r=Pl(this.writes_,s,t,1,i,e);return r.length===0?null:r[0]}};function Ol(n,e){f(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),f(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function Ml(n,e,t,i,s){let r=new $n,o,a;if(t.type===$.OVERWRITE){let c=t;c.source.fromUser?o=zn(n,e,c.path,c.snap,i,s,r):(f(c.source.fromServer,"Unknown source."),a=c.source.tagged||e.serverCache.isFiltered()&&!g(c.path),o=St(n,e,c.path,c.snap,i,s,a,r))}else if(t.type===$.MERGE){let c=t;c.source.fromUser?o=Fl(n,e,c.path,c.children,i,s,r):(f(c.source.fromServer,"Unknown source."),a=c.source.tagged||e.serverCache.isFiltered(),o=Gn(n,e,c.path,c.children,i,s,a,r))}else if(t.type===$.ACK_USER_WRITE){let c=t;c.revert?o=Ul(n,e,c.path,i,s,r):o=Bl(n,e,c.path,c.affectedTree,i,s,r)}else if(t.type===$.LISTEN_COMPLETE)o=Wl(n,e,t.path,i,r);else throw se("Unknown operation type: "+t.type);let l=r.getChanges();return Ll(e,o,l),{viewCache:o,changes:l}}function Ll(n,e,t){let i=e.eventCache;if(i.isFullyInitialized()){let s=i.getNode().isLeafNode()||i.getNode().isEmpty(),r=Wn(n);(t.length>0||!n.eventCache.isFullyInitialized()||s&&!i.getNode().equals(r)||!i.getNode().getPriority().equals(r.getPriority()))&&t.push(hl(Wn(e)))}}function br(n,e,t,i,s,r){let o=e.eventCache;if(It(i,t)!=null)return e;{let a,l;if(g(t))if(f(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){let c=_e(e),u=c instanceof C?c:C.EMPTY_NODE,h=vr(i,u);a=n.filter.updateFullNode(e.eventCache.getNode(),h,r)}else{let c=Vn(i,_e(e));a=n.filter.updateFullNode(e.eventCache.getNode(),c,r)}else{let c=m(t);if(c===".priority"){f(te(t)===1,"Can't have a priority with additional path components");let u=o.getNode();l=e.serverCache.getNode();let h=bs(i,t,u,l);h!=null?a=n.filter.updatePriority(u,h):a=o.getNode()}else{let u=b(t),h;if(o.isCompleteForChild(c)){l=e.serverCache.getNode();let d=bs(i,t,o.getNode(),l);d!=null?h=o.getNode().getImmediateChild(c).updateChild(u,d):h=o.getNode().getImmediateChild(c)}else h=oi(i,c,e.serverCache);h!=null?a=n.filter.updateChild(o.getNode(),c,h,u,s,r):a=o.getNode()}}return qe(e,a,o.isFullyInitialized()||g(t),n.filter.filtersNodes())}}function St(n,e,t,i,s,r,o,a){let l=e.serverCache,c,u=o?n.filter:n.filter.getIndexedFilter();if(g(t))c=u.updateFullNode(l.getNode(),i,null);else if(u.filtersNodes()&&!l.isFiltered()){let _=l.getNode().updateChild(t,i);c=u.updateFullNode(l.getNode(),_,null)}else{let _=m(t);if(!l.isCompleteForPath(t)&&te(t)>1)return e;let p=b(t),P=l.getNode().getImmediateChild(_).updateChild(p,i);_===".priority"?c=u.updatePriority(l.getNode(),P):c=u.updateChild(l.getNode(),_,P,p,Cr,null)}let h=_r(e,c,l.isFullyInitialized()||g(t),u.filtersNodes()),d=new Xe(s,h,r);return br(n,h,t,s,d,a)}function zn(n,e,t,i,s,r,o){let a=e.eventCache,l,c,u=new Xe(s,e,r);if(g(t))c=n.filter.updateFullNode(e.eventCache.getNode(),i,o),l=qe(e,c,!0,n.filter.filtersNodes());else{let h=m(t);if(h===".priority")c=n.filter.updatePriority(e.eventCache.getNode(),i),l=qe(e,c,a.isFullyInitialized(),a.isFiltered());else{let d=b(t),_=a.getNode().getImmediateChild(h),p;if(g(d))p=i;else{let S=u.getCompleteChild(h);S!=null?er(d)===".priority"&&S.getChild(nr(d)).isEmpty()?p=S:p=S.updateChild(d,i):p=C.EMPTY_NODE}if(_.equals(p))l=e;else{let S=n.filter.updateChild(a.getNode(),h,p,d,u,o);l=qe(e,S,a.isFullyInitialized(),n.filter.filtersNodes())}}}return l}function Is(n,e){return n.eventCache.isCompleteForChild(e)}function Fl(n,e,t,i,s,r,o){let a=e;return i.foreach((l,c)=>{let u=I(t,l);Is(e,m(u))&&(a=zn(n,a,u,c,s,r,o))}),i.foreach((l,c)=>{let u=I(t,l);Is(e,m(u))||(a=zn(n,a,u,c,s,r,o))}),a}function Ss(n,e,t){return t.foreach((i,s)=>{e=e.updateChild(i,s)}),e}function Gn(n,e,t,i,s,r,o,a){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let l=e,c;g(t)?c=i:c=new D(null).setTree(t,i);let u=e.serverCache.getNode();return c.children.inorderTraversal((h,d)=>{if(u.hasChild(h)){let _=e.serverCache.getNode().getImmediateChild(h),p=Ss(n,_,d);l=St(n,l,new w(h),p,s,r,o,a)}}),c.children.inorderTraversal((h,d)=>{let _=!e.serverCache.isCompleteForChild(h)&&d.value===null;if(!u.hasChild(h)&&!_){let p=e.serverCache.getNode().getImmediateChild(h),S=Ss(n,p,d);l=St(n,l,new w(h),S,s,r,o,a)}}),l}function Bl(n,e,t,i,s,r,o){if(It(s,t)!=null)return e;let a=e.serverCache.isFiltered(),l=e.serverCache;if(i.value!=null){if(g(t)&&l.isFullyInitialized()||l.isCompleteForPath(t))return St(n,e,t,l.getNode().getChild(t),s,r,a,o);if(g(t)){let c=new D(null);return l.getNode().forEachChild(Ie,(u,h)=>{c=c.set(new w(u),h)}),Gn(n,e,t,c,s,r,a,o)}else return e}else{let c=new D(null);return i.foreach((u,h)=>{let d=I(t,u);l.isCompleteForPath(d)&&(c=c.set(u,l.getNode().getChild(d)))}),Gn(n,e,t,c,s,r,a,o)}}function Wl(n,e,t,i,s){let r=e.serverCache,o=_r(e,r.getNode(),r.isFullyInitialized()||g(t),r.isFiltered());return br(n,o,t,i,Cr,s)}function Ul(n,e,t,i,s,r){let o;if(It(i,t)!=null)return e;{let a=new Xe(i,e,s),l=e.eventCache.getNode(),c;if(g(t)||m(t)===".priority"){let u;if(e.serverCache.isFullyInitialized())u=Vn(i,_e(e));else{let h=e.serverCache.getNode();f(h instanceof C,"serverChildren would be complete if leaf node"),u=vr(i,h)}u=u,c=n.filter.updateFullNode(l,u,r)}else{let u=m(t),h=oi(i,u,e.serverCache);h==null&&e.serverCache.isCompleteForChild(u)&&(h=l.getImmediateChild(u)),h!=null?c=n.filter.updateChild(l,u,h,b(t),a,r):e.eventCache.getNode().hasChild(u)?c=n.filter.updateChild(l,u,C.EMPTY_NODE,b(t),a,r):c=l,c.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=Vn(i,_e(e)),o.isLeafNode()&&(c=n.filter.updateFullNode(c,o,r)))}return o=e.serverCache.isFullyInitialized()||It(i,v())!=null,qe(e,c,o,n.filter.filtersNodes())}}function Hl(n,e){let t=_e(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!g(e)&&!t.getImmediateChild(m(e)).isEmpty())?t.getChild(e):null}function Ts(n,e,t,i){e.type===$.MERGE&&e.source.queryId!==null&&(f(_e(n.viewCache_),"We should always have a full cache before handling merges"),f(Wn(n.viewCache_),"Missing event cache, even though we have a server cache"));let s=n.viewCache_,r=Ml(n.processor_,s,e,t,i);return Ol(n.processor_,r.viewCache),f(r.viewCache.serverCache.isFullyInitialized()||!s.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=r.viewCache,Vl(n,r.changes,r.viewCache.eventCache.getNode(),null)}function Vl(n,e,t,i){let s=i?[i]:n.eventRegistrations_;return gl(n.eventGenerator_,e,t,s)}var Ns;function $l(n){f(!Ns,"__referenceConstructor has already been defined"),Ns=n}function ai(n,e,t,i){let s=e.source.queryId;if(s!==null){let r=n.views.get(s);return f(r!=null,"SyncTree gave us an op for an invalid query."),Ts(r,e,t,i)}else{let r=[];for(let o of n.views.values())r=r.concat(Ts(o,e,t,i));return r}}function li(n,e){let t=null;for(let i of n.views.values())t=t||Hl(i,e);return t}var Rs;function jl(n){f(!Rs,"__referenceConstructor has already been defined"),Rs=n}var Tt=class{constructor(e){this.listenProvider_=e,this.syncPointTree_=new D(null),this.pendingWriteTree_=Dl(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}};function Ir(n,e,t,i,s){return wl(n.pendingWriteTree_,e,t,i,s),s?Rt(n,new Re(hr(),e,t)):[]}function he(n,e,t=!1){let i=Cl(n.pendingWriteTree_,e);if(bl(n.pendingWriteTree_,e)){let r=new D(null);return i.snap!=null?r=r.set(v(),!0):L(i.children,o=>{r=r.set(new w(o),!0)}),Rt(n,new Bn(i.path,r,t))}else return[]}function Nt(n,e,t){return Rt(n,new Re(ur(),e,t))}function zl(n,e,t){let i=D.fromObject(t);return Rt(n,new bt(ur(),e,i))}function Gl(n,e,t,i){let s=Nr(n,i);if(s!=null){let r=Rr(s),o=r.path,a=r.queryId,l=O(o,e),c=new Re(dr(a),l,t);return xr(n,o,c)}else return[]}function Yl(n,e,t,i){let s=Nr(n,i);if(s){let r=Rr(s),o=r.path,a=r.queryId,l=O(o,e),c=D.fromObject(t),u=new bt(dr(a),l,c);return xr(n,o,u)}else return[]}function ci(n,e,t){let s=n.pendingWriteTree_,r=n.syncPointTree_.findOnPath(e,(o,a)=>{let l=O(o,e),c=li(a,l);if(c)return c});return yr(s,e,r,t,!0)}function Rt(n,e){return Sr(e,n.syncPointTree_,null,mr(n.pendingWriteTree_,v()))}function Sr(n,e,t,i){if(g(n.path))return Tr(n,e,t,i);{let s=e.get(v());t==null&&s!=null&&(t=li(s,v()));let r=[],o=m(n.path),a=n.operationForChild(o),l=e.children.get(o);if(l&&a){let c=t?t.getImmediateChild(o):null,u=Er(i,o);r=r.concat(Sr(a,l,c,u))}return s&&(r=r.concat(ai(s,n,i,t))),r}}function Tr(n,e,t,i){let s=e.get(v());t==null&&s!=null&&(t=li(s,v()));let r=[];return e.children.inorderTraversal((o,a)=>{let l=t?t.getImmediateChild(o):null,c=Er(i,o),u=n.operationForChild(o);u&&(r=r.concat(Tr(u,a,l,c)))}),s&&(r=r.concat(ai(s,n,i,t))),r}function Nr(n,e){return n.tagToQueryMap.get(e)}function Rr(n){let e=n.indexOf("$");return f(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new w(n.substr(0,e))}}function xr(n,e,t){let i=n.syncPointTree_.get(e);f(i,"Missing sync point for query tag that we're tracking");let s=mr(n.pendingWriteTree_,e);return ai(i,t,s,null)}var Yn=class n{constructor(e){this.node_=e}getImmediateChild(e){let t=this.node_.getImmediateChild(e);return new n(t)}node(){return this.node_}},qn=class n{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){let t=I(this.path_,e);return new n(this.syncTree_,t)}node(){return ci(this.syncTree_,this.path_)}},ql=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},xs=function(n,e,t){if(!n||typeof n!="object")return n;if(f(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return Kl(n[".sv"],e,t);if(typeof n[".sv"]=="object")return Ql(n[".sv"],e);f(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},Kl=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:f(!1,"Unexpected server value: "+n)}},Ql=function(n,e,t){n.hasOwnProperty("increment")||f(!1,"Unexpected server value: "+JSON.stringify(n,null,2));let i=n.increment;typeof i!="number"&&f(!1,"Unexpected increment value: "+i);let s=e.node();if(f(s!==null&&typeof s<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!s.isLeafNode())return i;let o=s.getValue();return typeof o!="number"?i:o+i},Xl=function(n,e,t,i){return hi(e,new qn(t,n),i)},Ar=function(n,e,t){return hi(n,new Yn(e),t)};function hi(n,e,t){let i=n.getPriority().val(),s=xs(i,e.getImmediateChild(".priority"),t),r;if(n.isLeafNode()){let o=n,a=xs(o.getValue(),e,t);return a!==o.getValue()||s!==o.getPriority().val()?new q(a,N(s)):n}else{let o=n;return r=o,s!==o.getPriority().val()&&(r=r.updatePriority(new q(s))),o.forEachChild(x,(a,l)=>{let c=hi(l,e.getImmediateChild(a),t);c!==l&&(r=r.updateImmediateChild(a,c))}),r}}var Je=class{constructor(e="",t=null,i={children:{},childCount:0}){this.name=e,this.parent=t,this.node=i}};function ui(n,e){let t=e instanceof w?e:new w(e),i=n,s=m(t);for(;s!==null;){let r=re(i.node.children,s)||{children:{},childCount:0};i=new Je(s,i,r),t=b(t),s=m(t)}return i}function De(n){return n.node.value}function kr(n,e){n.node.value=e,Kn(n)}function Dr(n){return n.node.childCount>0}function Jl(n){return De(n)===void 0&&!Dr(n)}function xt(n,e){L(n.node.children,(t,i)=>{e(new Je(t,n,i))})}function Pr(n,e,t,i){t&&!i&&e(n),xt(n,s=>{Pr(s,e,!0,i)}),t&&i&&e(n)}function Zl(n,e,t){let i=t?n:n.parent;for(;i!==null;){if(e(i))return!0;i=i.parent}return!1}function nt(n){return new w(n.parent===null?n.name:nt(n.parent)+"/"+n.name)}function Kn(n){n.parent!==null&&ec(n.parent,n.name,n)}function ec(n,e,t){let i=Jl(t),s=H(n.node.children,e);i&&s?(delete n.node.children[e],n.node.childCount--,Kn(n)):!i&&!s&&(n.node.children[e]=t.node,n.node.childCount++,Kn(n))}var tc=/[\[\].#$\/\u0000-\u001F\u007F]/,nc=/[\[\].#$\u0000-\u001F\u007F]/,cn=10*1024*1024,Or=function(n){return typeof n=="string"&&n.length!==0&&!tc.test(n)},Mr=function(n){return typeof n=="string"&&n.length!==0&&!nc.test(n)},ic=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),Mr(n)};var Lr=function(n,e,t,i){i&&e===void 0||di(lt(n,"value"),e,t)},di=function(n,e,t){let i=t instanceof w?new bn(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+le(i));if(typeof e=="function")throw new Error(n+"contains a function "+le(i)+" with contents = "+e.toString());if(Ls(e))throw new Error(n+"contains "+e.toString()+" "+le(i));if(typeof e=="string"&&e.length>cn/3&&We(e)>cn)throw new Error(n+"contains a string greater than "+cn+" utf8 bytes "+le(i)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let s=!1,r=!1;if(L(e,(o,a)=>{if(o===".value")s=!0;else if(o!==".priority"&&o!==".sv"&&(r=!0,!Or(o)))throw new Error(n+" contains an invalid key ("+o+") "+le(i)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);Xa(i,o),di(n,a,i),Ja(i)}),s&&r)throw new Error(n+' contains ".value" child '+le(i)+" in addition to actual children.")}};var Fr=function(n,e,t,i){if(!(i&&t===void 0)&&!Mr(t))throw new Error(lt(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},sc=function(n,e,t,i){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),Fr(n,e,t,i)},Br=function(n,e){if(m(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},rc=function(n,e){let t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!Or(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!ic(t))throw new Error(lt(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};var Qn=class{constructor(){this.eventLists_=[],this.recursionDepth_=0}};function Wr(n,e){let t=null;for(let i=0;i<e.length;i++){let s=e[i],r=s.getPath();t!==null&&!ir(r,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:r}),t.events.push(s)}t&&n.eventLists_.push(t)}function K(n,e,t){Wr(n,t),oc(n,i=>B(i,e)||B(e,i))}function oc(n,e){n.recursionDepth_++;let t=!0;for(let i=0;i<n.eventLists_.length;i++){let s=n.eventLists_[i];if(s){let r=s.path;e(r)?(ac(n.eventLists_[i]),n.eventLists_[i]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function ac(n){for(let e=0;e<n.events.length;e++){let t=n.events[e];if(t!==null){n.events[e]=null;let i=t.getEventRunner();ue&&R("event: "+t.toString()),ke(i)}}}var lc="repo_interrupt",cc=25,Xn=class{constructor(e,t,i,s){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=i,this.appCheckProvider_=s,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new Qn,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Ct(),this.transactionQueueTree_=new Je,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}};function hc(n,e,t){if(n.stats_=si(n.repoInfo_),n.forceRestClient_||Na())n.server_=new Pn(n.repoInfo_,(i,s,r,o)=>{As(n,i,s,r,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>ks(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{T(t)}catch(i){throw new Error("Invalid authOverride provided: "+i)}}n.persistentConnection_=new fe(n.repoInfo_,e,(i,s,r,o)=>{As(n,i,s,r,o)},i=>{ks(n,i)},i=>{uc(n,i)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(i=>{n.server_.refreshAuthToken(i)}),n.appCheckProvider_.addTokenChangeListener(i=>{n.server_.refreshAppCheckToken(i.token)}),n.statsReporter_=xa(n.repoInfo_,()=>new Fn(n.stats_,n.server_)),n.infoData_=new On,n.infoSyncTree_=new Tt({startListening:(i,s,r,o)=>{let a=[],l=n.infoData_.getNode(i._path);return l.isEmpty()||(a=Nt(n.infoSyncTree_,i._path,l),setTimeout(()=>{o("ok")},0)),a},stopListening:()=>{}}),_i(n,"connected",!1),n.serverSyncTree_=new Tt({startListening:(i,s,r,o)=>(n.server_.listen(i,r,s,(a,l)=>{let c=o(a,l);K(n.eventQueue_,i._path,c)}),[]),stopListening:(i,s)=>{n.server_.unlisten(i,s)}})}function Ur(n){let t=n.infoData_.getNode(new w(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function fi(n){return ql({timestamp:Ur(n)})}function As(n,e,t,i,s){n.dataUpdateCount++;let r=new w(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(s)if(i){let l=Be(t,c=>N(c));o=Yl(n.serverSyncTree_,r,l,s)}else{let l=N(t);o=Gl(n.serverSyncTree_,r,l,s)}else if(i){let l=Be(t,c=>N(c));o=zl(n.serverSyncTree_,r,l)}else{let l=N(t);o=Nt(n.serverSyncTree_,r,l)}let a=r;o.length>0&&(a=At(n,r)),K(n.eventQueue_,a,o)}function ks(n,e){_i(n,"connected",e),e===!1&&fc(n)}function uc(n,e){L(e,(t,i)=>{_i(n,t,i)})}function _i(n,e,t){let i=new w("/.info/"+e),s=N(t);n.infoData_.updateSnapshot(i,s);let r=Nt(n.infoSyncTree_,i,s);K(n.eventQueue_,i,r)}function Hr(n){return n.nextWriteId_++}function dc(n,e,t,i,s){pi(n,"set",{path:e.toString(),value:t,priority:i});let r=fi(n),o=N(t,i),a=ci(n.serverSyncTree_,e),l=Ar(o,a,r),c=Hr(n),u=Ir(n.serverSyncTree_,e,l,c,!0);Wr(n.eventQueue_,u),n.server_.put(e.toString(),o.val(!0),(d,_)=>{let p=d==="ok";p||k("set at "+e+" failed: "+d);let S=he(n.serverSyncTree_,c,!p);K(n.eventQueue_,e,S),pc(n,s,d,_)});let h=Gr(n,e);At(n,h),K(n.eventQueue_,h,[])}function fc(n){pi(n,"onDisconnectEvents");let e=fi(n),t=Ct();Mn(n.onDisconnect_,v(),(s,r)=>{let o=Xl(s,r,n.serverSyncTree_,e);cr(t,s,o)});let i=[];Mn(t,v(),(s,r)=>{i=i.concat(Nt(n.serverSyncTree_,s,r));let o=Gr(n,s);At(n,o)}),n.onDisconnect_=Ct(),K(n.eventQueue_,v(),i)}function _c(n){n.persistentConnection_&&n.persistentConnection_.interrupt(lc)}function pi(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),R(t,...e)}function pc(n,e,t,i){e&&ke(()=>{if(t==="ok")e(null);else{let s=(t||"error").toUpperCase(),r=s;i&&(r+=": "+i);let o=new Error(r);o.code=s,e(o)}})}function Vr(n,e,t){return ci(n.serverSyncTree_,e,t)||C.EMPTY_NODE}function mi(n,e=n.transactionQueueTree_){if(e||kt(n,e),De(e)){let t=jr(n,e);f(t.length>0,"Sending zero length transaction queue"),t.every(s=>s.status===0)&&mc(n,nt(e),t)}else Dr(e)&&xt(e,t=>{mi(n,t)})}function mc(n,e,t){let i=t.map(c=>c.currentWriteId),s=Vr(n,e,i),r=s,o=s.hash();for(let c=0;c<t.length;c++){let u=t[c];f(u.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),u.status=1,u.retryCount++;let h=O(e,u.path);r=r.updateChild(h,u.currentOutputSnapshotRaw)}let a=r.val(!0),l=e;n.server_.put(l.toString(),a,c=>{pi(n,"transaction put response",{path:l.toString(),status:c});let u=[];if(c==="ok"){let h=[];for(let d=0;d<t.length;d++)t[d].status=2,u=u.concat(he(n.serverSyncTree_,t[d].currentWriteId)),t[d].onComplete&&h.push(()=>t[d].onComplete(null,!0,t[d].currentOutputSnapshotResolved)),t[d].unwatcher();kt(n,ui(n.transactionQueueTree_,e)),mi(n,n.transactionQueueTree_),K(n.eventQueue_,e,u);for(let d=0;d<h.length;d++)ke(h[d])}else{if(c==="datastale")for(let h=0;h<t.length;h++)t[h].status===3?t[h].status=4:t[h].status=0;else{k("transaction at "+l.toString()+" failed: "+c);for(let h=0;h<t.length;h++)t[h].status=4,t[h].abortReason=c}At(n,e)}},o)}function At(n,e){let t=$r(n,e),i=nt(t),s=jr(n,t);return gc(n,s,i),i}function gc(n,e,t){if(e.length===0)return;let i=[],s=[],o=e.filter(a=>a.status===0).map(a=>a.currentWriteId);for(let a=0;a<e.length;a++){let l=e[a],c=O(t,l.path),u=!1,h;if(f(c!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),l.status===4)u=!0,h=l.abortReason,s=s.concat(he(n.serverSyncTree_,l.currentWriteId,!0));else if(l.status===0)if(l.retryCount>=cc)u=!0,h="maxretry",s=s.concat(he(n.serverSyncTree_,l.currentWriteId,!0));else{let d=Vr(n,l.path,o);l.currentInputSnapshot=d;let _=e[a].update(d.val());if(_!==void 0){di("transaction failed: Data returned ",_,l.path);let p=N(_);typeof _=="object"&&_!=null&&H(_,".priority")||(p=p.updatePriority(d.getPriority()));let P=l.currentWriteId,Ot=fi(n),st=Ar(p,d,Ot);l.currentOutputSnapshotRaw=p,l.currentOutputSnapshotResolved=st,l.currentWriteId=Hr(n),o.splice(o.indexOf(P),1),s=s.concat(Ir(n.serverSyncTree_,l.path,st,l.currentWriteId,l.applyLocally)),s=s.concat(he(n.serverSyncTree_,P,!0))}else u=!0,h="nodata",s=s.concat(he(n.serverSyncTree_,l.currentWriteId,!0))}K(n.eventQueue_,t,s),s=[],u&&(e[a].status=2,function(d){setTimeout(d,Math.floor(0))}(e[a].unwatcher),e[a].onComplete&&(h==="nodata"?i.push(()=>e[a].onComplete(null,!1,e[a].currentInputSnapshot)):i.push(()=>e[a].onComplete(new Error(h),!1,null))))}kt(n,n.transactionQueueTree_);for(let a=0;a<i.length;a++)ke(i[a]);mi(n,n.transactionQueueTree_)}function $r(n,e){let t,i=n.transactionQueueTree_;for(t=m(e);t!==null&&De(i)===void 0;)i=ui(i,t),e=b(e),t=m(e);return i}function jr(n,e){let t=[];return zr(n,e,t),t.sort((i,s)=>i.order-s.order),t}function zr(n,e,t){let i=De(e);if(i)for(let s=0;s<i.length;s++)t.push(i[s]);xt(e,s=>{zr(n,s,t)})}function kt(n,e){let t=De(e);if(t){let i=0;for(let s=0;s<t.length;s++)t[s].status!==2&&(t[i]=t[s],i++);t.length=i,kr(e,t.length>0?t:void 0)}xt(e,i=>{kt(n,i)})}function Gr(n,e){let t=nt($r(n,e)),i=ui(n.transactionQueueTree_,e);return Zl(i,s=>{hn(n,s)}),hn(n,i),Pr(i,s=>{hn(n,s)}),t}function hn(n,e){let t=De(e);if(t){let i=[],s=[],r=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(f(r===o-1,"All SENT items should be at beginning of queue."),r=o,t[o].status=3,t[o].abortReason="set"):(f(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),s=s.concat(he(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&i.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));r===-1?kr(e,void 0):t.length=r+1,K(n.eventQueue_,nt(e),s);for(let o=0;o<i.length;o++)ke(i[o])}}function yc(n){let e="",t=n.split("/");for(let i=0;i<t.length;i++)if(t[i].length>0){let s=t[i];try{s=decodeURIComponent(s.replace(/\+/g," "))}catch{}e+="/"+s}return e}function vc(n){let e={};n.charAt(0)==="?"&&(n=n.substring(1));for(let t of n.split("&")){if(t.length===0)continue;let i=t.split("=");i.length===2?e[decodeURIComponent(i[0])]=decodeURIComponent(i[1]):k(`Invalid query segment '${t}' in query '${n}'`)}return e}var Ds=function(n,e){let t=Ec(n),i=t.namespace;t.domain==="firebase.com"&&Y(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!i||i==="undefined")&&t.domain!=="localhost"&&Y("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||va();let s=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new _t(t.host,t.secure,i,s,e,"",i!==t.subdomain),path:new w(t.pathString)}},Ec=function(n){let e="",t="",i="",s="",r="",o=!0,a="https",l=443;if(typeof n=="string"){let c=n.indexOf("//");c>=0&&(a=n.substring(0,c-1),n=n.substring(c+2));let u=n.indexOf("/");u===-1&&(u=n.length);let h=n.indexOf("?");h===-1&&(h=n.length),e=n.substring(0,Math.min(u,h)),u<h&&(s=yc(n.substring(u,h)));let d=vc(n.substring(Math.min(n.length,h)));c=e.indexOf(":"),c>=0?(o=a==="https"||a==="wss",l=parseInt(e.substring(c+1),10)):c=e.length;let _=e.slice(0,c);if(_.toLowerCase()==="localhost")t="localhost";else if(_.split(".").length<=2)t=_;else{let p=e.indexOf(".");i=e.substring(0,p).toLowerCase(),t=e.substring(p+1),r=i}"ns"in d&&(r=d.ns)}return{host:e,port:l,domain:t,subdomain:i,secure:o,scheme:a,pathString:s,namespace:r}};var Ps="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",wc=function(){let n=0,e=[];return function(t){let i=t===n;n=t;let s,r=new Array(8);for(s=7;s>=0;s--)r[s]=Ps.charAt(t%64),t=Math.floor(t/64);f(t===0,"Cannot push at time == 0");let o=r.join("");if(i){for(s=11;s>=0&&e[s]===63;s--)e[s]=0;e[s]++}else for(s=0;s<12;s++)e[s]=Math.floor(Math.random()*64);for(s=0;s<12;s++)o+=Ps.charAt(e[s]);return f(o.length===20,"nextPushId: Length should be 20."),o}}();var Jn=class n{constructor(e,t,i,s){this._repo=e,this._path=t,this._queryParams=i,this._orderByCalled=s}get key(){return g(this._path)?null:er(this._path)}get ref(){return new pe(this._repo,this._path)}get _queryIdentifier(){let e=ys(this._queryParams),t=ii(e);return t==="{}"?"default":t}get _queryObject(){return ys(this._queryParams)}isEqual(e){if(e=oe(e),!(e instanceof n))return!1;let t=this._repo===e._repo,i=ir(this._path,e._path),s=this._queryIdentifier===e._queryIdentifier;return t&&i&&s}toJSON(){return this.toString()}toString(){return this._repo.toString()+Qa(this._path)}};var pe=class n extends Jn{constructor(e,t){super(e,t,new Dn,!1)}get parent(){let e=nr(this._path);return e===null?null:new n(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}};function Yr(n,e){return n=oe(n),n._checkNotDeleted("ref"),e!==void 0?Zn(n._root,e):n._root}function Zn(n,e){return n=oe(n),m(n._path)===null?sc("child","path",e,!1):Fr("child","path",e,!1),new pe(n._repo,I(n._path,e))}function qr(n,e){n=oe(n),Br("push",n._path),Lr("push",e,n._path,!0);let t=Ur(n._repo),i=wc(t),s=Zn(n,i),r=Zn(n,i),o;return e!=null?o=gi(r,e).then(()=>r):o=Promise.resolve(r),s.then=o.then.bind(o),s.catch=o.then.bind(o,void 0),s}function gi(n,e){n=oe(n),Br("set",n._path),Lr("set",e,n._path,!1);let t=new Q;return dc(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}$l(pe);jl(pe);var Cc="FIREBASE_DATABASE_EMULATOR_HOST",ei={},bc=!1;function Ic(n,e,t,i){n.repoInfo_=new _t(`${e}:${t}`,!1,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0),i&&(n.authTokenProvider_=i)}function Sc(n,e,t,i,s){let r=i||n.options.databaseURL;r===void 0&&(n.options.projectId||Y("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),R("Using default host for project ",n.options.projectId),r=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=Ds(r,s),a=o.repoInfo,l,c;typeof process<"u"&&process.env&&(c=process.env[Cc]),c?(l=!0,r=`http://${c}?ns=${a.namespace}`,o=Ds(r,s),a=o.repoInfo):l=!o.repoInfo.secure;let u=s&&l?new Z(Z.OWNER):new mn(n.name,n.options,e);rc("Invalid Firebase Database URL",o),g(o.path)||Y("Database URL must point to the root of a Firebase Database (not including a child path).");let h=Nc(a,n,u,new pn(n.name,t));return new ti(h,n)}function Tc(n,e){let t=ei[e];(!t||t[n.key]!==n)&&Y(`Database ${e}(${n.repoInfo_}) has already been deleted.`),_c(n),delete t[n.key]}function Nc(n,e,t,i){let s=ei[e.name];s||(s={},ei[e.name]=s);let r=s[n.toURLString()];return r&&Y("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),r=new Xn(n,bc,t,i),s[n.toURLString()]=r,r}var ti=class{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(hc(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new pe(this._repo,v())),this._rootInternal}_delete(){return this._rootInternal!==null&&(Tc(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&Y("Cannot call "+e+" on a deleted database.")}};function Kr(n=Xi(),e){let t=Ki(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){let i=Ni("database");i&&Rc(t,...i)}return t}function Rc(n,e,t,i={}){n=oe(n),n._checkNotDeleted("useEmulator"),n._instanceStarted&&Y("Cannot call useEmulator() after instance has already been initialized.");let s=n._repoInternal,r;if(s.repoInfo_.nodeAdmin)i.mockUserToken&&Y('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),r=new Z(Z.OWNER);else if(i.mockUserToken){let o=typeof i.mockUserToken=="string"?i.mockUserToken:Ri(i.mockUserToken,n.app.options.projectId);r=new Z(o)}Ic(s,e,t,r)}function xc(n){ma(Qi),He(new j("database",(e,{instanceIdentifier:t})=>{let i=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return Sc(i,s,r,t)},"PUBLIC").setMultipleInstances(!0)),J(es,ts,n),J(es,ts,"esm2017")}fe.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};fe.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};xc();var Ac={apiKey:"AIzaSyBvSYH1cdLkBgrkJyo5k1IpIXOl6CSQa_Y",authDomain:"linkdump-f6ac5.firebaseapp.com",databaseURL:"https://linkdump-f6ac5-default-rtdb.firebaseio.com",projectId:"linkdump-f6ac5",storageBucket:"linkdump-f6ac5.firebasestorage.app",messagingSenderId:"259393222123",appId:"1:259393222123:web:04e84d13399b5e8d1e15ae",measurementId:"G-0QT7LW7YHY"},kc=nn(Ac),Dc=Kr(kc);async function Dt(n,e){if(!n)throw new Error("No board ID provided");let t=qr(Yr(Dc,`boards/${n}/items`)),i=t.key;return await gi(t,{...e,id:i,timestamp:Date.now()}),i}function yi(n,e={x:100,y:100}){return{type:"link",content:n,position:e,sourceUrl:"",isEmpty:!1,timestamp:Date.now()}}function Qr(n,e={x:100,y:100}){return{type:"newText",content:n,position:e,sourceUrl:"",isEmpty:!1,timestamp:Date.now()}}function Xr(n,e={x:100,y:100},t=""){return{type:"image",content:n,position:e,sourceUrl:t,isEmpty:!1,timestamp:Date.now()}}function it(){return{x:100+Math.random()*400,y:100+Math.random()*300}}var vi=300,Pc=.7,wi=document.getElementById("boardUrl"),Oc=document.getElementById("clearBoard"),Pt=document.getElementById("boardStatus"),Pe=document.getElementById("savePageBtn"),ge=document.getElementById("textInput"),Oe=document.getElementById("saveTextBtn"),Ei=document.getElementById("toast"),Jr=document.getElementById("imagePreview"),Zr=document.getElementById("previewImg"),Mc=document.getElementById("clearImage"),F=null,Me=null;function Lc(n){if(!n)return null;n=n.trim();try{return new URL(n).pathname.replace(/^\//,"").split("/")[0]||null}catch{return n.replace(/^\/|\/$/g,"")||null}}async function Fc(n){return new Promise((e,t)=>{let i=new FileReader;i.onload=async s=>{try{let r=new Image;r.onload=()=>{let o=r.width,a=r.height;if(o>vi){let h=vi/o;o=vi,a=Math.round(a*h)}let l=document.createElement("canvas");l.width=o,l.height=a,l.getContext("2d").drawImage(r,0,0,o,a);let u=l.toDataURL("image/jpeg",Pc);e(u)},r.onerror=()=>t(new Error("Failed to load image")),r.src=s.target.result}catch(r){t(r)}},i.onerror=()=>t(new Error("Failed to read file")),i.readAsDataURL(n)})}function ne(){F?(Pt.textContent=`Connected to: ${F}`,Pt.classList.add("connected"),Pe.disabled=!1,Oe.disabled=!ge.value.trim()&&!Me):(Pt.textContent="No board connected",Pt.classList.remove("connected"),Pe.disabled=!0,Oe.disabled=!0)}function ye(n,e="success"){Ei.textContent=n,Ei.className=`toast ${e}`,setTimeout(()=>{Ei.classList.add("hidden")},3e3)}async function Bc(n){await chrome.storage.local.set({boardId:n})}async function Wc(){return(await chrome.storage.local.get(["boardId"])).boardId||null}function eo(){Me=null,Zr.src="",Jr.classList.add("hidden"),ne()}async function Uc(){F=await Wc(),F&&(wi.value=F),ne()}wi.addEventListener("input",async n=>{let e=Lc(n.target.value);F=e,e&&await Bc(e),ne()});Oc.addEventListener("click",async()=>{wi.value="",F=null,await chrome.storage.local.remove(["boardId"]),ne()});Pe.addEventListener("click",async()=>{if(F){Pe.classList.add("loading"),Pe.disabled=!0;try{let[n]=await chrome.tabs.query({active:!0,currentWindow:!0});if(!n?.url)throw new Error("Could not get current page URL");let e=yi(n.url,it());await Dt(F,e),ye("Page saved!","success")}catch(n){console.error("Error saving page:",n),ye("Failed to save page","error")}finally{Pe.classList.remove("loading"),ne()}}});ge.addEventListener("input",()=>{ne()});ge.addEventListener("paste",async n=>{let e=n.clipboardData?.items;if(e){for(let t of e)if(t.type.startsWith("image/")){n.preventDefault();let i=t.getAsFile();if(!i)continue;try{let s=await Fc(i);Me=s,Zr.src=s,Jr.classList.remove("hidden"),ne(),ye("Image ready to save","success")}catch(s){console.error("Error processing image:",s),ye("Failed to process image","error")}break}}});Mc.addEventListener("click",()=>{eo()});Oe.addEventListener("click",async()=>{if(F&&!(!ge.value.trim()&&!Me)){Oe.classList.add("loading"),Oe.disabled=!0;try{if(Me){let n=Xr(Me,it());await Dt(F,n),eo(),ye("Image saved!","success")}if(ge.value.trim()){let n=ge.value.trim(),e=/^https?:\/\/[^\s]+$/.test(n),t=e?yi(n,it()):Qr(n,it());await Dt(F,t),ge.value="",ye(e?"Link saved!":"Text saved!","success")}}catch(n){console.error("Error saving:",n),ye("Failed to save","error")}finally{Oe.classList.remove("loading"),ne()}}});Uc();
/*! Bundled license information:

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/logger/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/database/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
