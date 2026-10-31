var CampusSphere3DModule=(()=>{var ps=Object.defineProperty;var Th=Object.getOwnPropertyDescriptor;var Ah=Object.getOwnPropertyNames;var bh=Object.prototype.hasOwnProperty;var Rh=(n,e)=>{for(var t in e)ps(n,t,{get:e[t],enumerable:!0})},wh=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Ah(e))!bh.call(n,r)&&r!==t&&ps(n,r,{get:()=>e[r],enumerable:!(i=Th(e,r))||i.enumerable});return n};var Ch=n=>wh(ps({},"__esModule",{value:!0}),n);var Fd={};Rh(Fd,{canRun3D:()=>ra,init3D:()=>Zr});var rr="169";var pa=0,ds=1,da=2;var $r=1,ma=2,Qt=3,zt=0,et=1,At=2,Xt=0,xi=1,ms=2,_s=3,gs=4,_a=5,Mi=100,ga=101,xa=102,Ma=103,va=104,Sa=200,Ea=201,ya=202,Ta=203,or=204,sr=205,Aa=206,ba=207,Ra=208,wa=209,Ca=210,Pa=211,La=212,Ua=213,Da=214,Qr=0,eo=1,to=2,Ci=3,io=4,no=5,ro=6,oo=7,so=0,Ia=1,Fa=2,qt=0,Na=1,Ba=2,Oa=3,Ga=4,za=5,Va=6,ka=7;var xs=300,ei=301,ui=302,ar=303,cr=304,Pi=306,lr=1e3,ti=1001,ur=1002,Mt=1003,Ha=1004;var hr=1005;var vt=1006,ao=1007;var ii=1008;var St=1009,co=1010,lo=1011,vi=1012,ln=1013,Vt=1014,bt=1015,hi=1016,un=1017,hn=1018,ni=1020,uo=35902,ho=1021,fo=1022,dt=1023,po=1024,mo=1025,fi=1026,pi=1027,_o=1028,fn=1029,go=1030,pn=1031;var dn=1033,mn=33776,_n=33777,gn=33778,xn=33779,fr=35840,pr=35841,dr=35842,mr=35843,_r=36196,gr=37492,xr=37496,Mr=37808,vr=37809,Sr=37810,Er=37811,yr=37812,Tr=37813,Ar=37814,br=37815,Rr=37816,wr=37817,Cr=37818,Pr=37819,Lr=37820,Ur=37821,Mn=36492,Dr=36494,Ir=36495,xo=36283,Fr=36284,Nr=36285,Br=36286;var Wa=3200,Xa=3201;var Mo=0,qa=1,Yt="",Ut="srgb",Dt="srgb-linear",vn="display-p3",Yi="display-p3-linear",Sn="linear",qe="srgb",En="rec709",yn="p3";var Ki=7680;var Ms=519,Ya=512,Ka=513,Za=514,vo=515,ja=516,Ja=517,$a=518,Qa=519,vs=35044;var Ss="300 es",It=2e3,Zi=2001;var Ft=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let o=r.indexOf(t);o!==-1&&r.splice(o,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let o=0,s=r.length;o<s;o++)r[o].call(this,e);e.target=null}}};var Et=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var So=Math.PI/180,Or=180/Math.PI;function di(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Et[n&255]+Et[n>>8&255]+Et[n>>16&255]+Et[n>>24&255]+"-"+Et[e&255]+Et[e>>8&255]+"-"+Et[e>>16&15|64]+Et[e>>24&255]+"-"+Et[t&63|128]+Et[t>>8&255]+"-"+Et[t>>16&255]+Et[t>>24&255]+Et[i&255]+Et[i>>8&255]+Et[i>>16&255]+Et[i>>24&255]).toLowerCase()}function ct(n,e,t){return Math.max(e,Math.min(t,n))}function ec(n,e){return(n%e+e)%e}function Eo(n,e,t){return(1-t)*n+t*e}function Tn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Rt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var ve=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(ct(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),o=this.x-e.x,s=this.y-e.y;return this.x=o*i-s*r+e.x,this.y=o*r+s*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};var Le=class n{constructor(e,t,i,r,o,s,a,c,l){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,s,a,c,l)}set(e,t,i,r,o,s,a,c,l){let h=this.elements;return h[0]=e,h[1]=r,h[2]=a,h[3]=t,h[4]=o,h[5]=c,h[6]=i,h[7]=s,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,o=this.elements,s=i[0],a=i[3],c=i[6],l=i[1],h=i[4],p=i[7],d=i[2],m=i[5],g=i[8],S=r[0],f=r[3],u=r[6],A=r[1],E=r[4],T=r[7],I=r[2],R=r[5],b=r[8];return o[0]=s*S+a*A+c*I,o[3]=s*f+a*E+c*R,o[6]=s*u+a*T+c*b,o[1]=l*S+h*A+p*I,o[4]=l*f+h*E+p*R,o[7]=l*u+h*T+p*b,o[2]=d*S+m*A+g*I,o[5]=d*f+m*E+g*R,o[8]=d*u+m*T+g*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],s=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*s*h-t*a*l-i*o*h+i*a*c+r*o*l-r*s*c}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],s=e[4],a=e[5],c=e[6],l=e[7],h=e[8],p=h*s-a*l,d=a*c-h*o,m=l*o-s*c,g=t*p+i*d+r*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let S=1/g;return e[0]=p*S,e[1]=(r*l-h*i)*S,e[2]=(a*i-r*s)*S,e[3]=d*S,e[4]=(h*t-r*c)*S,e[5]=(r*o-a*t)*S,e[6]=m*S,e[7]=(i*c-l*t)*S,e[8]=(s*t-i*o)*S,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,o,s,a){let c=Math.cos(o),l=Math.sin(o);return this.set(i*c,i*l,-i*(c*s+l*a)+s+e,-r*l,r*c,-r*(-l*s+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Es.makeScale(e,t)),this}rotate(e){return this.premultiply(Es.makeRotation(-e)),this}translate(e,t){return this.premultiply(Es.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Es=new Le;function yo(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function An(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function ic(){let n=An("canvas");return n.style.display="block",n}var tc={};function bn(n){n in tc||(tc[n]=!0,console.warn(n))}function nc(n,e,t){return new Promise(function(i,r){function o(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(o,t);break;default:i()}}setTimeout(o,t)})}function rc(n){let e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function oc(n){let e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var sc=new Le().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),ac=new Le().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Gr={[Dt]:{transfer:Sn,primaries:En,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n,fromReference:n=>n},[Ut]:{transfer:qe,primaries:En,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[Yi]:{transfer:Sn,primaries:yn,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.applyMatrix3(ac),fromReference:n=>n.applyMatrix3(sc)},[vn]:{transfer:qe,primaries:yn,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.convertSRGBToLinear().applyMatrix3(ac),fromReference:n=>n.applyMatrix3(sc).convertLinearToSRGB()}},Ph=new Set([Dt,Yi]),Ue={enabled:!0,_workingColorSpace:Dt,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!Ph.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;let i=Gr[e].toReference,r=Gr[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return Gr[n].primaries},getTransfer:function(n){return n===Yt?Sn:Gr[n].transfer},getLuminanceCoefficients:function(n,e=this._workingColorSpace){return n.fromArray(Gr[e].luminanceCoefficients)}};function Li(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function To(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Rn,Ao=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Rn===void 0&&(Rn=An("canvas")),Rn.width=e.width,Rn.height=e.height;let i=Rn.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Rn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=An("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),o=r.data;for(let s=0;s<o.length;s++)o[s]=Li(o[s]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Li(t[i]/255)*255):t[i]=Li(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}};var Lh=0,wn=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Lh++}),this.uuid=di(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let o;if(Array.isArray(r)){o=[];for(let s=0,a=r.length;s<a;s++)r[s].isDataTexture?o.push(ys(r[s].image)):o.push(ys(r[s]))}else o=ys(r);i.url=o}return t||(e.images[this.uuid]=i),i}};function ys(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ao.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Uh=0,ht=class n extends Ft{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=ti,r=ti,o=vt,s=ii,a=dt,c=St,l=n.DEFAULT_ANISOTROPY,h=Yt){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Uh++}),this.uuid=di(),this.name="",this.source=new wn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=o,this.minFilter=s,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ve(0,0),this.repeat=new ve(1,1),this.center=new ve(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Le,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==xs)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case lr:e.x=e.x-Math.floor(e.x);break;case ti:e.x=e.x<0?0:1;break;case ur:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case lr:e.y=e.y-Math.floor(e.y);break;case ti:e.y=e.y<0?0:1;break;case ur:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};ht.DEFAULT_IMAGE=null;ht.DEFAULT_MAPPING=xs;ht.DEFAULT_ANISOTROPY=1;var De=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,o=this.w,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r+s[12]*o,this.y=s[1]*t+s[5]*i+s[9]*r+s[13]*o,this.z=s[2]*t+s[6]*i+s[10]*r+s[14]*o,this.w=s[3]*t+s[7]*i+s[11]*r+s[15]*o,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,o,c=e.elements,l=c[0],h=c[4],p=c[8],d=c[1],m=c[5],g=c[9],S=c[2],f=c[6],u=c[10];if(Math.abs(h-d)<.01&&Math.abs(p-S)<.01&&Math.abs(g-f)<.01){if(Math.abs(h+d)<.1&&Math.abs(p+S)<.1&&Math.abs(g+f)<.1&&Math.abs(l+m+u-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(l+1)/2,T=(m+1)/2,I=(u+1)/2,R=(h+d)/4,b=(p+S)/4,D=(g+f)/4;return E>T&&E>I?E<.01?(i=0,r=.707106781,o=.707106781):(i=Math.sqrt(E),r=R/i,o=b/i):T>I?T<.01?(i=.707106781,r=0,o=.707106781):(r=Math.sqrt(T),i=R/r,o=D/r):I<.01?(i=.707106781,r=.707106781,o=0):(o=Math.sqrt(I),i=b/o,r=D/o),this.set(i,r,o,t),this}let A=Math.sqrt((f-g)*(f-g)+(p-S)*(p-S)+(d-h)*(d-h));return Math.abs(A)<.001&&(A=1),this.x=(f-g)/A,this.y=(p-S)/A,this.z=(d-h)/A,this.w=Math.acos((l+m+u-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};var bo=class extends Ft{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new De(0,0,e,t),this.scissorTest=!1,this.viewport=new De(0,0,e,t);let r={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:vt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let o=new ht(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);o.flipY=!1,o.generateMipmaps=i.generateMipmaps,o.internalFormat=i.internalFormat,this.textures=[];let s=i.count;for(let a=0;a<s;a++)this.textures[a]=o.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,o=this.textures.length;r<o;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new wn(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Nt=class extends bo{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}};var Cn=class extends ht{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Mt,this.minFilter=Mt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ro=class extends ht{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Mt,this.minFilter=Mt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var _i=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,o,s,a){let c=i[r+0],l=i[r+1],h=i[r+2],p=i[r+3],d=o[s+0],m=o[s+1],g=o[s+2],S=o[s+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=p;return}if(a===1){e[t+0]=d,e[t+1]=m,e[t+2]=g,e[t+3]=S;return}if(p!==S||c!==d||l!==m||h!==g){let f=1-a,u=c*d+l*m+h*g+p*S,A=u>=0?1:-1,E=1-u*u;if(E>Number.EPSILON){let I=Math.sqrt(E),R=Math.atan2(I,u*A);f=Math.sin(f*R)/I,a=Math.sin(a*R)/I}let T=a*A;if(c=c*f+d*T,l=l*f+m*T,h=h*f+g*T,p=p*f+S*T,f===1-a){let I=1/Math.sqrt(c*c+l*l+h*h+p*p);c*=I,l*=I,h*=I,p*=I}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=p}static multiplyQuaternionsFlat(e,t,i,r,o,s){let a=i[r],c=i[r+1],l=i[r+2],h=i[r+3],p=o[s],d=o[s+1],m=o[s+2],g=o[s+3];return e[t]=a*g+h*p+c*m-l*d,e[t+1]=c*g+h*d+l*p-a*m,e[t+2]=l*g+h*m+a*d-c*p,e[t+3]=h*g-a*p-c*d-l*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,o=e._z,s=e._order,a=Math.cos,c=Math.sin,l=a(i/2),h=a(r/2),p=a(o/2),d=c(i/2),m=c(r/2),g=c(o/2);switch(s){case"XYZ":this._x=d*h*p+l*m*g,this._y=l*m*p-d*h*g,this._z=l*h*g+d*m*p,this._w=l*h*p-d*m*g;break;case"YXZ":this._x=d*h*p+l*m*g,this._y=l*m*p-d*h*g,this._z=l*h*g-d*m*p,this._w=l*h*p+d*m*g;break;case"ZXY":this._x=d*h*p-l*m*g,this._y=l*m*p+d*h*g,this._z=l*h*g+d*m*p,this._w=l*h*p-d*m*g;break;case"ZYX":this._x=d*h*p-l*m*g,this._y=l*m*p+d*h*g,this._z=l*h*g-d*m*p,this._w=l*h*p+d*m*g;break;case"YZX":this._x=d*h*p+l*m*g,this._y=l*m*p+d*h*g,this._z=l*h*g-d*m*p,this._w=l*h*p-d*m*g;break;case"XZY":this._x=d*h*p-l*m*g,this._y=l*m*p-d*h*g,this._z=l*h*g+d*m*p,this._w=l*h*p+d*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+s)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],o=t[8],s=t[1],a=t[5],c=t[9],l=t[2],h=t[6],p=t[10],d=i+a+p;if(d>0){let m=.5/Math.sqrt(d+1);this._w=.25/m,this._x=(h-c)*m,this._y=(o-l)*m,this._z=(s-r)*m}else if(i>a&&i>p){let m=2*Math.sqrt(1+i-a-p);this._w=(h-c)/m,this._x=.25*m,this._y=(r+s)/m,this._z=(o+l)/m}else if(a>p){let m=2*Math.sqrt(1+a-i-p);this._w=(o-l)/m,this._x=(r+s)/m,this._y=.25*m,this._z=(c+h)/m}else{let m=2*Math.sqrt(1+p-i-a);this._w=(s-r)/m,this._x=(o+l)/m,this._y=(c+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ct(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,o=e._z,s=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+s*a+r*l-o*c,this._y=r*h+s*c+o*a-i*l,this._z=o*h+s*l+i*c-r*a,this._w=s*h-i*a-r*c-o*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,o=this._z,s=this._w,a=s*e._w+i*e._x+r*e._y+o*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=s,this._x=i,this._y=r,this._z=o,this;let c=1-a*a;if(c<=Number.EPSILON){let m=1-t;return this._w=m*s+t*this._w,this._x=m*i+t*this._x,this._y=m*r+t*this._y,this._z=m*o+t*this._z,this.normalize(),this}let l=Math.sqrt(c),h=Math.atan2(l,a),p=Math.sin((1-t)*h)/l,d=Math.sin(t*h)/l;return this._w=s*p+this._w*d,this._x=i*p+this._x*d,this._y=r*p+this._y*d,this._z=o*p+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),o=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),o*Math.sin(t),o*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}};var C=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6]*r,this.y=o[1]*t+o[4]*i+o[7]*r,this.z=o[2]*t+o[5]*i+o[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,o=e.elements,s=1/(o[3]*t+o[7]*i+o[11]*r+o[15]);return this.x=(o[0]*t+o[4]*i+o[8]*r+o[12])*s,this.y=(o[1]*t+o[5]*i+o[9]*r+o[13])*s,this.z=(o[2]*t+o[6]*i+o[10]*r+o[14])*s,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,o=e.x,s=e.y,a=e.z,c=e.w,l=2*(s*r-a*i),h=2*(a*t-o*r),p=2*(o*i-s*t);return this.x=t+c*l+s*p-a*h,this.y=i+c*h+a*l-o*p,this.z=r+c*p+o*h-s*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r,this.y=o[1]*t+o[5]*i+o[9]*r,this.z=o[2]*t+o[6]*i+o[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,o=e.z,s=t.x,a=t.y,c=t.z;return this.x=r*c-o*a,this.y=o*s-i*c,this.z=i*a-r*s,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ts.copy(this).projectOnVector(e),this.sub(Ts)}reflect(e){return this.sub(Ts.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(ct(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ts=new C,cc=new _i;var Ei=class{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(ri.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(ri.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=ri.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let o=i.getAttribute("position");if(t===!0&&o!==void 0&&e.isInstancedMesh!==!0)for(let s=0,a=o.count;s<a;s++)e.isMesh===!0?e.getVertexPosition(s,ri):ri.fromBufferAttribute(o,s),ri.applyMatrix4(e.matrixWorld),this.expandByPoint(ri);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),wo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),wo.copy(i.boundingBox)),wo.applyMatrix4(e.matrixWorld),this.union(wo)}let r=e.children;for(let o=0,s=r.length;o<s;o++)this.expandByObject(r[o],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ri),ri.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zr),Co.subVectors(this.max,zr),Pn.subVectors(e.a,zr),Ln.subVectors(e.b,zr),Un.subVectors(e.c,zr),Ui.subVectors(Ln,Pn),Di.subVectors(Un,Ln),ji.subVectors(Pn,Un);let t=[0,-Ui.z,Ui.y,0,-Di.z,Di.y,0,-ji.z,ji.y,Ui.z,0,-Ui.x,Di.z,0,-Di.x,ji.z,0,-ji.x,-Ui.y,Ui.x,0,-Di.y,Di.x,0,-ji.y,ji.x,0];return!As(t,Pn,Ln,Un,Co)||(t=[1,0,0,0,1,0,0,0,1],!As(t,Pn,Ln,Un,Co))?!1:(Po.crossVectors(Ui,Di),t=[Po.x,Po.y,Po.z],As(t,Pn,Ln,Un,Co))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ri).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ri).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Si),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Si=[new C,new C,new C,new C,new C,new C,new C,new C],ri=new C,wo=new Ei,Pn=new C,Ln=new C,Un=new C,Ui=new C,Di=new C,ji=new C,zr=new C,Co=new C,Po=new C,Ji=new C;function As(n,e,t,i,r){for(let o=0,s=n.length-3;o<=s;o+=3){Ji.fromArray(n,o);let a=r.x*Math.abs(Ji.x)+r.y*Math.abs(Ji.y)+r.z*Math.abs(Ji.z),c=e.dot(Ji),l=t.dot(Ji),h=i.dot(Ji);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var Dh=new Ei,Vr=new C,bs=new C,Ii=class{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Dh.setFromPoints(e).getCenter(i);let r=0;for(let o=0,s=e.length;o<s;o++)r=Math.max(r,i.distanceToSquared(e[o]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vr.subVectors(e,this.center);let t=Vr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Vr,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(bs.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vr.copy(e.center).add(bs)),this.expandByPoint(Vr.copy(e.center).sub(bs))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}};var yi=new C,Rs=new C,Lo=new C,Fi=new C,ws=new C,Uo=new C,Cs=new C,Do=class{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,yi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=yi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(yi.copy(this.origin).addScaledVector(this.direction,t),yi.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Rs.copy(e).add(t).multiplyScalar(.5),Lo.copy(t).sub(e).normalize(),Fi.copy(this.origin).sub(Rs);let o=e.distanceTo(t)*.5,s=-this.direction.dot(Lo),a=Fi.dot(this.direction),c=-Fi.dot(Lo),l=Fi.lengthSq(),h=Math.abs(1-s*s),p,d,m,g;if(h>0)if(p=s*c-a,d=s*a-c,g=o*h,p>=0)if(d>=-g)if(d<=g){let S=1/h;p*=S,d*=S,m=p*(p+s*d+2*a)+d*(s*p+d+2*c)+l}else d=o,p=Math.max(0,-(s*d+a)),m=-p*p+d*(d+2*c)+l;else d=-o,p=Math.max(0,-(s*d+a)),m=-p*p+d*(d+2*c)+l;else d<=-g?(p=Math.max(0,-(-s*o+a)),d=p>0?-o:Math.min(Math.max(-o,-c),o),m=-p*p+d*(d+2*c)+l):d<=g?(p=0,d=Math.min(Math.max(-o,-c),o),m=d*(d+2*c)+l):(p=Math.max(0,-(s*o+a)),d=p>0?o:Math.min(Math.max(-o,-c),o),m=-p*p+d*(d+2*c)+l);else d=s>0?-o:o,p=Math.max(0,-(s*d+a)),m=-p*p+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(Rs).addScaledVector(Lo,d),m}intersectSphere(e,t){yi.subVectors(e.center,this.origin);let i=yi.dot(this.direction),r=yi.dot(yi)-i*i,o=e.radius*e.radius;if(r>o)return null;let s=Math.sqrt(o-r),a=i-s,c=i+s;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,o,s,a,c,l=1/this.direction.x,h=1/this.direction.y,p=1/this.direction.z,d=this.origin;return l>=0?(i=(e.min.x-d.x)*l,r=(e.max.x-d.x)*l):(i=(e.max.x-d.x)*l,r=(e.min.x-d.x)*l),h>=0?(o=(e.min.y-d.y)*h,s=(e.max.y-d.y)*h):(o=(e.max.y-d.y)*h,s=(e.min.y-d.y)*h),i>s||o>r||((o>i||isNaN(i))&&(i=o),(s<r||isNaN(r))&&(r=s),p>=0?(a=(e.min.z-d.z)*p,c=(e.max.z-d.z)*p):(a=(e.max.z-d.z)*p,c=(e.min.z-d.z)*p),i>c||a>r)||((a>i||i!==i)&&(i=a),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,yi)!==null}intersectTriangle(e,t,i,r,o){ws.subVectors(t,e),Uo.subVectors(i,e),Cs.crossVectors(ws,Uo);let s=this.direction.dot(Cs),a;if(s>0){if(r)return null;a=1}else if(s<0)a=-1,s=-s;else return null;Fi.subVectors(this.origin,e);let c=a*this.direction.dot(Uo.crossVectors(Fi,Uo));if(c<0)return null;let l=a*this.direction.dot(ws.cross(Fi));if(l<0||c+l>s)return null;let h=-a*Fi.dot(Cs);return h<0?null:this.at(h/s,o)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}};var Ge=class n{constructor(e,t,i,r,o,s,a,c,l,h,p,d,m,g,S,f){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,s,a,c,l,h,p,d,m,g,S,f)}set(e,t,i,r,o,s,a,c,l,h,p,d,m,g,S,f){let u=this.elements;return u[0]=e,u[4]=t,u[8]=i,u[12]=r,u[1]=o,u[5]=s,u[9]=a,u[13]=c,u[2]=l,u[6]=h,u[10]=p,u[14]=d,u[3]=m,u[7]=g,u[11]=S,u[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/Dn.setFromMatrixColumn(e,0).length(),o=1/Dn.setFromMatrixColumn(e,1).length(),s=1/Dn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*o,t[5]=i[5]*o,t[6]=i[6]*o,t[7]=0,t[8]=i[8]*s,t[9]=i[9]*s,t[10]=i[10]*s,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,o=e.z,s=Math.cos(i),a=Math.sin(i),c=Math.cos(r),l=Math.sin(r),h=Math.cos(o),p=Math.sin(o);if(e.order==="XYZ"){let d=s*h,m=s*p,g=a*h,S=a*p;t[0]=c*h,t[4]=-c*p,t[8]=l,t[1]=m+g*l,t[5]=d-S*l,t[9]=-a*c,t[2]=S-d*l,t[6]=g+m*l,t[10]=s*c}else if(e.order==="YXZ"){let d=c*h,m=c*p,g=l*h,S=l*p;t[0]=d+S*a,t[4]=g*a-m,t[8]=s*l,t[1]=s*p,t[5]=s*h,t[9]=-a,t[2]=m*a-g,t[6]=S+d*a,t[10]=s*c}else if(e.order==="ZXY"){let d=c*h,m=c*p,g=l*h,S=l*p;t[0]=d-S*a,t[4]=-s*p,t[8]=g+m*a,t[1]=m+g*a,t[5]=s*h,t[9]=S-d*a,t[2]=-s*l,t[6]=a,t[10]=s*c}else if(e.order==="ZYX"){let d=s*h,m=s*p,g=a*h,S=a*p;t[0]=c*h,t[4]=g*l-m,t[8]=d*l+S,t[1]=c*p,t[5]=S*l+d,t[9]=m*l-g,t[2]=-l,t[6]=a*c,t[10]=s*c}else if(e.order==="YZX"){let d=s*c,m=s*l,g=a*c,S=a*l;t[0]=c*h,t[4]=S-d*p,t[8]=g*p+m,t[1]=p,t[5]=s*h,t[9]=-a*h,t[2]=-l*h,t[6]=m*p+g,t[10]=d-S*p}else if(e.order==="XZY"){let d=s*c,m=s*l,g=a*c,S=a*l;t[0]=c*h,t[4]=-p,t[8]=l*h,t[1]=d*p+S,t[5]=s*h,t[9]=m*p-g,t[2]=g*p-m,t[6]=a*h,t[10]=S*p+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ih,e,Fh)}lookAt(e,t,i){let r=this.elements;return kt.subVectors(e,t),kt.lengthSq()===0&&(kt.z=1),kt.normalize(),Ni.crossVectors(i,kt),Ni.lengthSq()===0&&(Math.abs(i.z)===1?kt.x+=1e-4:kt.z+=1e-4,kt.normalize(),Ni.crossVectors(i,kt)),Ni.normalize(),Io.crossVectors(kt,Ni),r[0]=Ni.x,r[4]=Io.x,r[8]=kt.x,r[1]=Ni.y,r[5]=Io.y,r[9]=kt.y,r[2]=Ni.z,r[6]=Io.z,r[10]=kt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,o=this.elements,s=i[0],a=i[4],c=i[8],l=i[12],h=i[1],p=i[5],d=i[9],m=i[13],g=i[2],S=i[6],f=i[10],u=i[14],A=i[3],E=i[7],T=i[11],I=i[15],R=r[0],b=r[4],D=r[8],z=r[12],_=r[1],v=r[5],F=r[9],B=r[13],k=r[2],Z=r[6],V=r[10],Q=r[14],W=r[3],ae=r[7],ce=r[11],_e=r[15];return o[0]=s*R+a*_+c*k+l*W,o[4]=s*b+a*v+c*Z+l*ae,o[8]=s*D+a*F+c*V+l*ce,o[12]=s*z+a*B+c*Q+l*_e,o[1]=h*R+p*_+d*k+m*W,o[5]=h*b+p*v+d*Z+m*ae,o[9]=h*D+p*F+d*V+m*ce,o[13]=h*z+p*B+d*Q+m*_e,o[2]=g*R+S*_+f*k+u*W,o[6]=g*b+S*v+f*Z+u*ae,o[10]=g*D+S*F+f*V+u*ce,o[14]=g*z+S*B+f*Q+u*_e,o[3]=A*R+E*_+T*k+I*W,o[7]=A*b+E*v+T*Z+I*ae,o[11]=A*D+E*F+T*V+I*ce,o[15]=A*z+E*B+T*Q+I*_e,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],o=e[12],s=e[1],a=e[5],c=e[9],l=e[13],h=e[2],p=e[6],d=e[10],m=e[14],g=e[3],S=e[7],f=e[11],u=e[15];return g*(+o*c*p-r*l*p-o*a*d+i*l*d+r*a*m-i*c*m)+S*(+t*c*m-t*l*d+o*s*d-r*s*m+r*l*h-o*c*h)+f*(+t*l*p-t*a*m-o*s*p+i*s*m+o*a*h-i*l*h)+u*(-r*a*h-t*c*p+t*a*d+r*s*p-i*s*d+i*c*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],s=e[4],a=e[5],c=e[6],l=e[7],h=e[8],p=e[9],d=e[10],m=e[11],g=e[12],S=e[13],f=e[14],u=e[15],A=p*f*l-S*d*l+S*c*m-a*f*m-p*c*u+a*d*u,E=g*d*l-h*f*l-g*c*m+s*f*m+h*c*u-s*d*u,T=h*S*l-g*p*l+g*a*m-s*S*m-h*a*u+s*p*u,I=g*p*c-h*S*c-g*a*d+s*S*d+h*a*f-s*p*f,R=t*A+i*E+r*T+o*I;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let b=1/R;return e[0]=A*b,e[1]=(S*d*o-p*f*o-S*r*m+i*f*m+p*r*u-i*d*u)*b,e[2]=(a*f*o-S*c*o+S*r*l-i*f*l-a*r*u+i*c*u)*b,e[3]=(p*c*o-a*d*o-p*r*l+i*d*l+a*r*m-i*c*m)*b,e[4]=E*b,e[5]=(h*f*o-g*d*o+g*r*m-t*f*m-h*r*u+t*d*u)*b,e[6]=(g*c*o-s*f*o-g*r*l+t*f*l+s*r*u-t*c*u)*b,e[7]=(s*d*o-h*c*o+h*r*l-t*d*l-s*r*m+t*c*m)*b,e[8]=T*b,e[9]=(g*p*o-h*S*o-g*i*m+t*S*m+h*i*u-t*p*u)*b,e[10]=(s*S*o-g*a*o+g*i*l-t*S*l-s*i*u+t*a*u)*b,e[11]=(h*a*o-s*p*o-h*i*l+t*p*l+s*i*m-t*a*m)*b,e[12]=I*b,e[13]=(h*S*r-g*p*r+g*i*d-t*S*d-h*i*f+t*p*f)*b,e[14]=(g*a*r-s*S*r-g*i*c+t*S*c+s*i*f-t*a*f)*b,e[15]=(s*p*r-h*a*r+h*i*c-t*p*c-s*i*d+t*a*d)*b,this}scale(e){let t=this.elements,i=e.x,r=e.y,o=e.z;return t[0]*=i,t[4]*=r,t[8]*=o,t[1]*=i,t[5]*=r,t[9]*=o,t[2]*=i,t[6]*=r,t[10]*=o,t[3]*=i,t[7]*=r,t[11]*=o,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),o=1-i,s=e.x,a=e.y,c=e.z,l=o*s,h=o*a;return this.set(l*s+i,l*a-r*c,l*c+r*a,0,l*a+r*c,h*a+i,h*c-r*s,0,l*c-r*a,h*c+r*s,o*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,o,s){return this.set(1,i,o,0,e,1,s,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,o=t._x,s=t._y,a=t._z,c=t._w,l=o+o,h=s+s,p=a+a,d=o*l,m=o*h,g=o*p,S=s*h,f=s*p,u=a*p,A=c*l,E=c*h,T=c*p,I=i.x,R=i.y,b=i.z;return r[0]=(1-(S+u))*I,r[1]=(m+T)*I,r[2]=(g-E)*I,r[3]=0,r[4]=(m-T)*R,r[5]=(1-(d+u))*R,r[6]=(f+A)*R,r[7]=0,r[8]=(g+E)*b,r[9]=(f-A)*b,r[10]=(1-(d+S))*b,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,o=Dn.set(r[0],r[1],r[2]).length(),s=Dn.set(r[4],r[5],r[6]).length(),a=Dn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(o=-o),e.x=r[12],e.y=r[13],e.z=r[14],oi.copy(this);let l=1/o,h=1/s,p=1/a;return oi.elements[0]*=l,oi.elements[1]*=l,oi.elements[2]*=l,oi.elements[4]*=h,oi.elements[5]*=h,oi.elements[6]*=h,oi.elements[8]*=p,oi.elements[9]*=p,oi.elements[10]*=p,t.setFromRotationMatrix(oi),i.x=o,i.y=s,i.z=a,this}makePerspective(e,t,i,r,o,s,a=It){let c=this.elements,l=2*o/(t-e),h=2*o/(i-r),p=(t+e)/(t-e),d=(i+r)/(i-r),m,g;if(a===It)m=-(s+o)/(s-o),g=-2*s*o/(s-o);else if(a===Zi)m=-s/(s-o),g=-s*o/(s-o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=p,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,r,o,s,a=It){let c=this.elements,l=1/(t-e),h=1/(i-r),p=1/(s-o),d=(t+e)*l,m=(i+r)*h,g,S;if(a===It)g=(s+o)*p,S=-2*p;else if(a===Zi)g=o*p,S=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-m,c[2]=0,c[6]=0,c[10]=S,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Dn=new C,oi=new Ge,Ih=new C(0,0,0),Fh=new C(1,1,1),Ni=new C,Io=new C,kt=new C;var lc=new Ge,uc=new _i,yt=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,o=r[0],s=r[4],a=r[8],c=r[1],l=r[5],h=r[9],p=r[2],d=r[6],m=r[10];switch(t){case"XYZ":this._y=Math.asin(ct(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-s,o)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-ct(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-p,o),this._z=0);break;case"ZXY":this._x=Math.asin(ct(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-p,m),this._z=Math.atan2(-s,l)):(this._y=0,this._z=Math.atan2(c,o));break;case"ZYX":this._y=Math.asin(-ct(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(d,m),this._z=Math.atan2(c,o)):(this._x=0,this._z=Math.atan2(-s,l));break;case"YZX":this._z=Math.asin(ct(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-p,o)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-ct(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,o)):(this._x=Math.atan2(-h,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return lc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(lc,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return uc.setFromEuler(this),this.setFromQuaternion(uc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};yt.DEFAULT_ORDER="XYZ";var In=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}};var Nh=0,hc=new C,Fn=new _i,Ti=new Ge,Fo=new C,kr=new C,Bh=new C,Oh=new _i,fc=new C(1,0,0),pc=new C(0,1,0),dc=new C(0,0,1),mc={type:"added"},Gh={type:"removed"},Nn={type:"childadded",child:null},Ps={type:"childremoved",child:null},rt=class n extends Ft{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Nh++}),this.uuid=di(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new C,t=new yt,i=new _i,r=new C(1,1,1);function o(){i.setFromEuler(t,!1)}function s(){t.setFromQuaternion(i,void 0,!1)}t._onChange(o),i._onChange(s),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ge},normalMatrix:{value:new Le}}),this.matrix=new Ge,this.matrixWorld=new Ge,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new In,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Fn.setFromAxisAngle(e,t),this.quaternion.multiply(Fn),this}rotateOnWorldAxis(e,t){return Fn.setFromAxisAngle(e,t),this.quaternion.premultiply(Fn),this}rotateX(e){return this.rotateOnAxis(fc,e)}rotateY(e){return this.rotateOnAxis(pc,e)}rotateZ(e){return this.rotateOnAxis(dc,e)}translateOnAxis(e,t){return hc.copy(e).applyQuaternion(this.quaternion),this.position.add(hc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(fc,e)}translateY(e){return this.translateOnAxis(pc,e)}translateZ(e){return this.translateOnAxis(dc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ti.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Fo.copy(e):Fo.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),kr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ti.lookAt(kr,Fo,this.up):Ti.lookAt(Fo,kr,this.up),this.quaternion.setFromRotationMatrix(Ti),r&&(Ti.extractRotation(r.matrixWorld),Fn.setFromRotationMatrix(Ti),this.quaternion.premultiply(Fn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(mc),Nn.child=e,this.dispatchEvent(Nn),Nn.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Gh),Ps.child=e,this.dispatchEvent(Ps),Ps.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ti),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(mc),Nn.child=e,this.dispatchEvent(Nn),Nn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let s=this.children[i].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let o=0,s=r.length;o<s;o++)r[o].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,e,Bh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,Oh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let r=this.children;for(let o=0,s=r.length;o<s;o++)r[o].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function o(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=o(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let p=c[l];o(e.shapes,p)}else o(e.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(o(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(o(e.materials,this.material[c]));r.material=a}else r.material=o(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];r.animations.push(o(e.animations,c))}}if(t){let a=s(e.geometries),c=s(e.materials),l=s(e.textures),h=s(e.images),p=s(e.shapes),d=s(e.skeletons),m=s(e.animations),g=s(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),p.length>0&&(i.shapes=p),d.length>0&&(i.skeletons=d),m.length>0&&(i.animations=m),g.length>0&&(i.nodes=g)}return i.object=r,i;function s(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};rt.DEFAULT_UP=new C(0,1,0);rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var si=new C,Ai=new C,Ls=new C,bi=new C,Bn=new C,On=new C,_c=new C,Us=new C,Ds=new C,Is=new C,Fs=new De,Ns=new De,Bs=new De,Bi=class n{constructor(e=new C,t=new C,i=new C){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),si.subVectors(e,t),r.cross(si);let o=r.lengthSq();return o>0?r.multiplyScalar(1/Math.sqrt(o)):r.set(0,0,0)}static getBarycoord(e,t,i,r,o){si.subVectors(r,t),Ai.subVectors(i,t),Ls.subVectors(e,t);let s=si.dot(si),a=si.dot(Ai),c=si.dot(Ls),l=Ai.dot(Ai),h=Ai.dot(Ls),p=s*l-a*a;if(p===0)return o.set(0,0,0),null;let d=1/p,m=(l*c-a*h)*d,g=(s*h-a*c)*d;return o.set(1-m-g,g,m)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,bi)===null?!1:bi.x>=0&&bi.y>=0&&bi.x+bi.y<=1}static getInterpolation(e,t,i,r,o,s,a,c){return this.getBarycoord(e,t,i,r,bi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(o,bi.x),c.addScaledVector(s,bi.y),c.addScaledVector(a,bi.z),c)}static getInterpolatedAttribute(e,t,i,r,o,s){return Fs.setScalar(0),Ns.setScalar(0),Bs.setScalar(0),Fs.fromBufferAttribute(e,t),Ns.fromBufferAttribute(e,i),Bs.fromBufferAttribute(e,r),s.setScalar(0),s.addScaledVector(Fs,o.x),s.addScaledVector(Ns,o.y),s.addScaledVector(Bs,o.z),s}static isFrontFacing(e,t,i,r){return si.subVectors(i,t),Ai.subVectors(e,t),si.cross(Ai).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return si.subVectors(this.c,this.b),Ai.subVectors(this.a,this.b),si.cross(Ai).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,o){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,o)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,o=this.c,s,a;Bn.subVectors(r,i),On.subVectors(o,i),Us.subVectors(e,i);let c=Bn.dot(Us),l=On.dot(Us);if(c<=0&&l<=0)return t.copy(i);Ds.subVectors(e,r);let h=Bn.dot(Ds),p=On.dot(Ds);if(h>=0&&p<=h)return t.copy(r);let d=c*p-h*l;if(d<=0&&c>=0&&h<=0)return s=c/(c-h),t.copy(i).addScaledVector(Bn,s);Is.subVectors(e,o);let m=Bn.dot(Is),g=On.dot(Is);if(g>=0&&m<=g)return t.copy(o);let S=m*l-c*g;if(S<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(i).addScaledVector(On,a);let f=h*g-m*p;if(f<=0&&p-h>=0&&m-g>=0)return _c.subVectors(o,r),a=(p-h)/(p-h+(m-g)),t.copy(r).addScaledVector(_c,a);let u=1/(f+S+d);return s=S*u,a=d*u,t.copy(i).addScaledVector(Bn,s).addScaledVector(On,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}};var gc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Oi={h:0,s:0,l:0},No={h:0,s:0,l:0};function Os(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Pe=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ut){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ue.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=Ue.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ue.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=Ue.workingColorSpace){if(e=ec(e,1),t=ct(t,0,1),i=ct(i,0,1),t===0)this.r=this.g=this.b=i;else{let o=i<=.5?i*(1+t):i+t-i*t,s=2*i-o;this.r=Os(s,o,e+1/3),this.g=Os(s,o,e),this.b=Os(s,o,e-1/3)}return Ue.toWorkingColorSpace(this,r),this}setStyle(e,t=Ut){function i(o){o!==void 0&&parseFloat(o)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let o,s=r[1],a=r[2];switch(s){case"rgb":case"rgba":if(o=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(o[4]),this.setRGB(Math.min(255,parseInt(o[1],10))/255,Math.min(255,parseInt(o[2],10))/255,Math.min(255,parseInt(o[3],10))/255,t);if(o=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(o[4]),this.setRGB(Math.min(100,parseInt(o[1],10))/100,Math.min(100,parseInt(o[2],10))/100,Math.min(100,parseInt(o[3],10))/100,t);break;case"hsl":case"hsla":if(o=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(o[4]),this.setHSL(parseFloat(o[1])/360,parseFloat(o[2])/100,parseFloat(o[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let o=r[1],s=o.length;if(s===3)return this.setRGB(parseInt(o.charAt(0),16)/15,parseInt(o.charAt(1),16)/15,parseInt(o.charAt(2),16)/15,t);if(s===6)return this.setHex(parseInt(o,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ut){let i=gc[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Li(e.r),this.g=Li(e.g),this.b=Li(e.b),this}copyLinearToSRGB(e){return this.r=To(e.r),this.g=To(e.g),this.b=To(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ut){return Ue.fromWorkingColorSpace(Tt.copy(this),e),Math.round(ct(Tt.r*255,0,255))*65536+Math.round(ct(Tt.g*255,0,255))*256+Math.round(ct(Tt.b*255,0,255))}getHexString(e=Ut){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ue.workingColorSpace){Ue.fromWorkingColorSpace(Tt.copy(this),t);let i=Tt.r,r=Tt.g,o=Tt.b,s=Math.max(i,r,o),a=Math.min(i,r,o),c,l,h=(a+s)/2;if(a===s)c=0,l=0;else{let p=s-a;switch(l=h<=.5?p/(s+a):p/(2-s-a),s){case i:c=(r-o)/p+(r<o?6:0);break;case r:c=(o-i)/p+2;break;case o:c=(i-r)/p+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Ue.workingColorSpace){return Ue.fromWorkingColorSpace(Tt.copy(this),t),e.r=Tt.r,e.g=Tt.g,e.b=Tt.b,e}getStyle(e=Ut){Ue.fromWorkingColorSpace(Tt.copy(this),e);let t=Tt.r,i=Tt.g,r=Tt.b;return e!==Ut?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Oi),this.setHSL(Oi.h+e,Oi.s+t,Oi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Oi),e.getHSL(No);let i=Eo(Oi.h,No.h,t),r=Eo(Oi.s,No.s,t),o=Eo(Oi.l,No.l,t);return this.setHSL(i,r,o),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,o=e.elements;return this.r=o[0]*t+o[3]*i+o[6]*r,this.g=o[1]*t+o[4]*i+o[7]*r,this.b=o[2]*t+o[5]*i+o[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Tt=new Pe;Pe.NAMES=gc;var zh=0,Kt=class extends Ft{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:zh++}),this.uuid=di(),this.name="",this.type="Material",this.blending=xi,this.side=zt,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=or,this.blendDst=sr,this.blendEquation=Mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Pe(0,0,0),this.blendAlpha=0,this.depthFunc=Ci,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ms,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ki,this.stencilZFail=Ki,this.stencilZPass=Ki,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==xi&&(i.blending=this.blending),this.side!==zt&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==or&&(i.blendSrc=this.blendSrc),this.blendDst!==sr&&(i.blendDst=this.blendDst),this.blendEquation!==Mi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ci&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ms&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ki&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ki&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ki&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(o){let s=[];for(let a in o){let c=o[a];delete c.metadata,s.push(c)}return s}if(t){let o=r(e.textures),s=r(e.images);o.length>0&&(i.textures=o),s.length>0&&(i.images=s)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let o=0;o!==r;++o)i[o]=t[o].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}};var ai=class extends Kt{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Pe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yt,this.combine=so,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var ut=new C,Bo=new ve,wt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=vs,this.updateRanges=[],this.gpuType=bt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,o=this.itemSize;r<o;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Bo.fromBufferAttribute(this,t),Bo.applyMatrix3(e),this.setXY(t,Bo.x,Bo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix3(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix4(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyNormalMatrix(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.transformDirection(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Tn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Rt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Tn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Tn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Tn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Tn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),i=Rt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),i=Rt(i,this.array),r=Rt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,o){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),i=Rt(i,this.array),r=Rt(r,this.array),o=Rt(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=o,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==vs&&(e.usage=this.usage),e}};var Gn=class extends wt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var zn=class extends wt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var it=class extends wt{constructor(e,t,i){super(new Float32Array(e),t,i)}};var Vh=0,Zt=new Ge,Gs=new rt,Vn=new C,Ht=new Ei,Hr=new Ei,mt=new C,_t=class n extends Ft{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Vh++}),this.uuid=di(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(yo(e)?zn:Gn)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let o=new Le().getNormalMatrix(e);i.applyNormalMatrix(o),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Zt.makeRotationFromQuaternion(e),this.applyMatrix4(Zt),this}rotateX(e){return Zt.makeRotationX(e),this.applyMatrix4(Zt),this}rotateY(e){return Zt.makeRotationY(e),this.applyMatrix4(Zt),this}rotateZ(e){return Zt.makeRotationZ(e),this.applyMatrix4(Zt),this}translate(e,t,i){return Zt.makeTranslation(e,t,i),this.applyMatrix4(Zt),this}scale(e,t,i){return Zt.makeScale(e,t,i),this.applyMatrix4(Zt),this}lookAt(e){return Gs.lookAt(e),Gs.updateMatrix(),this.applyMatrix4(Gs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vn).negate(),this.translate(Vn.x,Vn.y,Vn.z),this}setFromPoints(e){let t=[];for(let i=0,r=e.length;i<r;i++){let o=e[i];t.push(o.x,o.y,o.z||0)}return this.setAttribute("position",new it(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ei);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let o=t[i];Ht.setFromBufferAttribute(o),this.morphTargetsRelative?(mt.addVectors(this.boundingBox.min,Ht.min),this.boundingBox.expandByPoint(mt),mt.addVectors(this.boundingBox.max,Ht.max),this.boundingBox.expandByPoint(mt)):(this.boundingBox.expandByPoint(Ht.min),this.boundingBox.expandByPoint(Ht.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ii);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){let i=this.boundingSphere.center;if(Ht.setFromBufferAttribute(e),t)for(let o=0,s=t.length;o<s;o++){let a=t[o];Hr.setFromBufferAttribute(a),this.morphTargetsRelative?(mt.addVectors(Ht.min,Hr.min),Ht.expandByPoint(mt),mt.addVectors(Ht.max,Hr.max),Ht.expandByPoint(mt)):(Ht.expandByPoint(Hr.min),Ht.expandByPoint(Hr.max))}Ht.getCenter(i);let r=0;for(let o=0,s=e.count;o<s;o++)mt.fromBufferAttribute(e,o),r=Math.max(r,i.distanceToSquared(mt));if(t)for(let o=0,s=t.length;o<s;o++){let a=t[o],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)mt.fromBufferAttribute(a,l),c&&(Vn.fromBufferAttribute(e,l),mt.add(Vn)),r=Math.max(r,i.distanceToSquared(mt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,r=t.normal,o=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new wt(new Float32Array(4*i.count),4));let s=this.getAttribute("tangent"),a=[],c=[];for(let D=0;D<i.count;D++)a[D]=new C,c[D]=new C;let l=new C,h=new C,p=new C,d=new ve,m=new ve,g=new ve,S=new C,f=new C;function u(D,z,_){l.fromBufferAttribute(i,D),h.fromBufferAttribute(i,z),p.fromBufferAttribute(i,_),d.fromBufferAttribute(o,D),m.fromBufferAttribute(o,z),g.fromBufferAttribute(o,_),h.sub(l),p.sub(l),m.sub(d),g.sub(d);let v=1/(m.x*g.y-g.x*m.y);isFinite(v)&&(S.copy(h).multiplyScalar(g.y).addScaledVector(p,-m.y).multiplyScalar(v),f.copy(p).multiplyScalar(m.x).addScaledVector(h,-g.x).multiplyScalar(v),a[D].add(S),a[z].add(S),a[_].add(S),c[D].add(f),c[z].add(f),c[_].add(f))}let A=this.groups;A.length===0&&(A=[{start:0,count:e.count}]);for(let D=0,z=A.length;D<z;++D){let _=A[D],v=_.start,F=_.count;for(let B=v,k=v+F;B<k;B+=3)u(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let E=new C,T=new C,I=new C,R=new C;function b(D){I.fromBufferAttribute(r,D),R.copy(I);let z=a[D];E.copy(z),E.sub(I.multiplyScalar(I.dot(z))).normalize(),T.crossVectors(R,z);let v=T.dot(c[D])<0?-1:1;s.setXYZW(D,E.x,E.y,E.z,v)}for(let D=0,z=A.length;D<z;++D){let _=A[D],v=_.start,F=_.count;for(let B=v,k=v+F;B<k;B+=3)b(e.getX(B+0)),b(e.getX(B+1)),b(e.getX(B+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new wt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,m=i.count;d<m;d++)i.setXYZ(d,0,0,0);let r=new C,o=new C,s=new C,a=new C,c=new C,l=new C,h=new C,p=new C;if(e)for(let d=0,m=e.count;d<m;d+=3){let g=e.getX(d+0),S=e.getX(d+1),f=e.getX(d+2);r.fromBufferAttribute(t,g),o.fromBufferAttribute(t,S),s.fromBufferAttribute(t,f),h.subVectors(s,o),p.subVectors(r,o),h.cross(p),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,S),l.fromBufferAttribute(i,f),a.add(h),c.add(h),l.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(S,c.x,c.y,c.z),i.setXYZ(f,l.x,l.y,l.z)}else for(let d=0,m=t.count;d<m;d+=3)r.fromBufferAttribute(t,d+0),o.fromBufferAttribute(t,d+1),s.fromBufferAttribute(t,d+2),h.subVectors(s,o),p.subVectors(r,o),h.cross(p),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)mt.fromBufferAttribute(e,t),mt.normalize(),e.setXYZ(t,mt.x,mt.y,mt.z)}toNonIndexed(){function e(a,c){let l=a.array,h=a.itemSize,p=a.normalized,d=new l.constructor(c.length*h),m=0,g=0;for(let S=0,f=c.length;S<f;S++){a.isInterleavedBufferAttribute?m=c[S]*a.data.stride+a.offset:m=c[S]*h;for(let u=0;u<h;u++)d[g++]=l[m++]}return new wt(d,h,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let c=r[a],l=e(c,i);t.setAttribute(a,l)}let o=this.morphAttributes;for(let a in o){let c=[],l=o[a];for(let h=0,p=l.length;h<p;h++){let d=l[h],m=e(d,i);c.push(m)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let s=this.groups;for(let a=0,c=s.length;a<c;a++){let l=s[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let r={},o=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let p=0,d=l.length;p<d;p++){let m=l[p];h.push(m.toJSON(e.data))}h.length>0&&(r[c]=h,o=!0)}o&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let s=this.groups;s.length>0&&(e.data.groups=JSON.parse(JSON.stringify(s)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let r=e.attributes;for(let l in r){let h=r[l];this.setAttribute(l,h.clone(t))}let o=e.morphAttributes;for(let l in o){let h=[],p=o[l];for(let d=0,m=p.length;d<m;d++)h.push(p[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let s=e.groups;for(let l=0,h=s.length;l<h;l++){let p=s[l];this.addGroup(p.start,p.count,p.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}};var xc=new Ge,$i=new Do,Oo=new Ii,Mc=new C,Go=new C,zo=new C,Vo=new C,zs=new C,ko=new C,vc=new C,Ho=new C,se=class extends rt{constructor(e=new _t,t=new ai){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,s=r.length;o<s;o++){let a=r[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=o}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,o=i.morphAttributes.position,s=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(o&&a){ko.set(0,0,0);for(let c=0,l=o.length;c<l;c++){let h=a[c],p=o[c];h!==0&&(zs.fromBufferAttribute(p,e),s?ko.addScaledVector(zs,h):ko.addScaledVector(zs.sub(t),h))}t.add(ko)}return t}raycast(e,t){let i=this.geometry,r=this.material,o=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Oo.copy(i.boundingSphere),Oo.applyMatrix4(o),$i.copy(e.ray).recast(e.near),!(Oo.containsPoint($i.origin)===!1&&($i.intersectSphere(Oo,Mc)===null||$i.origin.distanceToSquared(Mc)>(e.far-e.near)**2))&&(xc.copy(o).invert(),$i.copy(e.ray).applyMatrix4(xc),!(i.boundingBox!==null&&$i.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,$i)))}_computeIntersections(e,t,i){let r,o=this.geometry,s=this.material,a=o.index,c=o.attributes.position,l=o.attributes.uv,h=o.attributes.uv1,p=o.attributes.normal,d=o.groups,m=o.drawRange;if(a!==null)if(Array.isArray(s))for(let g=0,S=d.length;g<S;g++){let f=d[g],u=s[f.materialIndex],A=Math.max(f.start,m.start),E=Math.min(a.count,Math.min(f.start+f.count,m.start+m.count));for(let T=A,I=E;T<I;T+=3){let R=a.getX(T),b=a.getX(T+1),D=a.getX(T+2);r=Wo(this,u,e,i,l,h,p,R,b,D),r&&(r.faceIndex=Math.floor(T/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{let g=Math.max(0,m.start),S=Math.min(a.count,m.start+m.count);for(let f=g,u=S;f<u;f+=3){let A=a.getX(f),E=a.getX(f+1),T=a.getX(f+2);r=Wo(this,s,e,i,l,h,p,A,E,T),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(s))for(let g=0,S=d.length;g<S;g++){let f=d[g],u=s[f.materialIndex],A=Math.max(f.start,m.start),E=Math.min(c.count,Math.min(f.start+f.count,m.start+m.count));for(let T=A,I=E;T<I;T+=3){let R=T,b=T+1,D=T+2;r=Wo(this,u,e,i,l,h,p,R,b,D),r&&(r.faceIndex=Math.floor(T/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{let g=Math.max(0,m.start),S=Math.min(c.count,m.start+m.count);for(let f=g,u=S;f<u;f+=3){let A=f,E=f+1,T=f+2;r=Wo(this,s,e,i,l,h,p,A,E,T),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}}};function kh(n,e,t,i,r,o,s,a){let c;if(e.side===et?c=i.intersectTriangle(s,o,r,!0,a):c=i.intersectTriangle(r,o,s,e.side===zt,a),c===null)return null;Ho.copy(a),Ho.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(Ho);return l<t.near||l>t.far?null:{distance:l,point:Ho.clone(),object:n}}function Wo(n,e,t,i,r,o,s,a,c,l){n.getVertexPosition(a,Go),n.getVertexPosition(c,zo),n.getVertexPosition(l,Vo);let h=kh(n,e,t,i,Go,zo,Vo,vc);if(h){let p=new C;Bi.getBarycoord(vc,Go,zo,Vo,p),r&&(h.uv=Bi.getInterpolatedAttribute(r,a,c,l,p,new ve)),o&&(h.uv1=Bi.getInterpolatedAttribute(o,a,c,l,p,new ve)),s&&(h.normal=Bi.getInterpolatedAttribute(s,a,c,l,p,new C),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new C,materialIndex:0};Bi.getNormal(Go,zo,Vo,d.normal),h.face=d,h.barycoord=p}return h}var tt=class n extends _t{constructor(e=1,t=1,i=1,r=1,o=1,s=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:o,depthSegments:s};let a=this;r=Math.floor(r),o=Math.floor(o),s=Math.floor(s);let c=[],l=[],h=[],p=[],d=0,m=0;g("z","y","x",-1,-1,i,t,e,s,o,0),g("z","y","x",1,-1,i,t,-e,s,o,1),g("x","z","y",1,1,e,i,t,r,s,2),g("x","z","y",1,-1,e,i,-t,r,s,3),g("x","y","z",1,-1,e,t,i,r,o,4),g("x","y","z",-1,-1,e,t,-i,r,o,5),this.setIndex(c),this.setAttribute("position",new it(l,3)),this.setAttribute("normal",new it(h,3)),this.setAttribute("uv",new it(p,2));function g(S,f,u,A,E,T,I,R,b,D,z){let _=T/b,v=I/D,F=T/2,B=I/2,k=R/2,Z=b+1,V=D+1,Q=0,W=0,ae=new C;for(let ce=0;ce<V;ce++){let _e=ce*v-B;for(let ke=0;ke<Z;ke++){let Ye=ke*_-F;ae[S]=Ye*A,ae[f]=_e*E,ae[u]=k,l.push(ae.x,ae.y,ae.z),ae[S]=0,ae[f]=0,ae[u]=R>0?1:-1,h.push(ae.x,ae.y,ae.z),p.push(ke/b),p.push(1-ce/D),Q+=1}}for(let ce=0;ce<D;ce++)for(let _e=0;_e<b;_e++){let ke=d+_e+Z*ce,Ye=d+_e+Z*(ce+1),X=d+(_e+1)+Z*(ce+1),J=d+(_e+1)+Z*ce;c.push(ke,Ye,J),c.push(Ye,X,J),W+=6}a.addGroup(m,W,z),m+=W,d+=Q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ri(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function kn(n){let e={};for(let t=0;t<n.length;t++){let i=Ri(n[t]);for(let r in i)e[r]=i[r]}return e}function Sc(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Xo(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ue.workingColorSpace}var Ec={clone:Ri,merge:kn};var yc=`
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;var Tc=`
void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
`;var Ct=class extends Kt{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=yc,this.fragmentShader=Tc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ri(e.uniforms),this.uniformsGroups=Sc(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let s=this.uniforms[r].value;s&&s.isTexture?t.uniforms[r]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[r]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[r]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[r]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[r]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[r]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[r]={type:"m4",value:s.toArray()}:t.uniforms[r]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}};var Hn=class extends rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ge,this.projectionMatrix=new Ge,this.projectionMatrixInverse=new Ge,this.coordinateSystem=It}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}};var Gi=new C,Ac=new ve,bc=new ve,ot=class extends Hn{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Or*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(So*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Or*2*Math.atan(Math.tan(So*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Gi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z),Gi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z)}getViewSize(e,t){return this.getViewBounds(e,Ac,bc),t.subVectors(bc,Ac)}setViewOffset(e,t,i,r,o,s){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(So*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,o=-.5*r,s=this.view;if(this.view!==null&&this.view.enabled){let c=s.fullWidth,l=s.fullHeight;o+=s.offsetX*r/c,t-=s.offsetY*i/l,r*=s.width/c,i*=s.height/l}let a=this.filmOffset;a!==0&&(o+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(o,o+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Wn=-90,Xn=1,qo=class extends rt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new ot(Wn,Xn,e,t);r.layers=this.layers,this.add(r);let o=new ot(Wn,Xn,e,t);o.layers=this.layers,this.add(o);let s=new ot(Wn,Xn,e,t);s.layers=this.layers,this.add(s);let a=new ot(Wn,Xn,e,t);a.layers=this.layers,this.add(a);let c=new ot(Wn,Xn,e,t);c.layers=this.layers,this.add(c);let l=new ot(Wn,Xn,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,o,s,a,c]=t;for(let l of t)this.remove(l);if(e===It)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),o.up.set(0,0,-1),o.lookAt(0,1,0),s.up.set(0,0,1),s.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Zi)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),o.up.set(0,0,1),o.lookAt(0,1,0),s.up.set(0,0,-1),s.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[o,s,a,c,l,h]=this.children,p=e.getRenderTarget(),d=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let S=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,o),e.setRenderTarget(i,1,r),e.render(t,s),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,c),e.setRenderTarget(i,4,r),e.render(t,l),i.texture.generateMipmaps=S,e.setRenderTarget(i,5,r),e.render(t,h),e.setRenderTarget(p,d,m),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}};var qn=class extends ht{constructor(e,t,i,r,o,s,a,c,l,h){e=e!==void 0?e:[],t=t!==void 0?t:ei,super(e,t,i,r,o,s,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Yo=class extends Nt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new qn(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:vt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new tt(5,5,5),o=new Ct({name:"CubemapFromEquirect",uniforms:Ri(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:et,blending:Xt});o.uniforms.tEquirect.value=t;let s=new se(r,o),a=t.minFilter;return t.minFilter===ii&&(t.minFilter=vt),new qo(1,10,this).update(e,s),t.minFilter=a,s.geometry.dispose(),s.material.dispose(),this}clear(e,t,i,r){let o=e.getRenderTarget();for(let s=0;s<6;s++)e.setRenderTarget(this,s),e.clear(t,i,r);e.setRenderTarget(o)}};var Vs=new C,Hh=new C,Wh=new Le,ci=class{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=Vs.subVectors(i,t).cross(Hh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(Vs),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return o<0||o>1?null:t.copy(e.start).addScaledVector(i,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Wh.getNormalMatrix(e),r=this.coplanarPoint(Vs).applyMatrix4(e),o=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(o),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}};var Qi=new Ii,Ko=new C,zi=class{constructor(e=new ci,t=new ci,i=new ci,r=new ci,o=new ci,s=new ci){this.planes=[e,t,i,r,o,s]}set(e,t,i,r,o,s){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(o),a[5].copy(s),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=It){let i=this.planes,r=e.elements,o=r[0],s=r[1],a=r[2],c=r[3],l=r[4],h=r[5],p=r[6],d=r[7],m=r[8],g=r[9],S=r[10],f=r[11],u=r[12],A=r[13],E=r[14],T=r[15];if(i[0].setComponents(c-o,d-l,f-m,T-u).normalize(),i[1].setComponents(c+o,d+l,f+m,T+u).normalize(),i[2].setComponents(c+s,d+h,f+g,T+A).normalize(),i[3].setComponents(c-s,d-h,f-g,T-A).normalize(),i[4].setComponents(c-a,d-p,f-S,T-E).normalize(),t===It)i[5].setComponents(c+a,d+p,f+S,T+E).normalize();else if(t===Zi)i[5].setComponents(a,p,S,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Qi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Qi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Qi)}intersectsSprite(e){return Qi.center.set(0,0,0),Qi.radius=.7071067811865476,Qi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Qi)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let o=0;o<6;o++)if(t[o].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(Ko.x=r.normal.x>0?e.max.x:e.min.x,Ko.y=r.normal.y>0?e.max.y:e.min.y,Ko.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ko)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Zo(){let n=null,e=!1,t=null,i=null;function r(o,s){t(o,s),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(o){t=o},setContext:function(o){n=o}}}function Rc(n){let e=new WeakMap;function t(a,c){let l=a.array,h=a.usage,p=l.byteLength,d=n.createBuffer();n.bindBuffer(c,d),n.bufferData(c,l,h),a.onUploadCallback();let m;if(l instanceof Float32Array)m=n.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?m=n.HALF_FLOAT:m=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)m=n.SHORT;else if(l instanceof Uint32Array)m=n.UNSIGNED_INT;else if(l instanceof Int32Array)m=n.INT;else if(l instanceof Int8Array)m=n.BYTE;else if(l instanceof Uint8Array)m=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)m=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:m,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:p}}function i(a,c,l){let h=c.array,p=c.updateRanges;if(n.bindBuffer(l,a),p.length===0)n.bufferSubData(l,0,h);else{p.sort((m,g)=>m.start-g.start);let d=0;for(let m=1;m<p.length;m++){let g=p[d],S=p[m];S.start<=g.start+g.count+1?g.count=Math.max(g.count,S.start+S.count-g.start):(++d,p[d]=S)}p.length=d+1;for(let m=0,g=p.length;m<g;m++){let S=p[m];n.bufferSubData(l,S.start*h.BYTES_PER_ELEMENT,h,S.start,S.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function o(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function s(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:r,remove:o,update:s}}var Vi=class n extends _t{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let o=e/2,s=t/2,a=Math.floor(i),c=Math.floor(r),l=a+1,h=c+1,p=e/a,d=t/c,m=[],g=[],S=[],f=[];for(let u=0;u<h;u++){let A=u*d-s;for(let E=0;E<l;E++){let T=E*p-o;g.push(T,-A,0),S.push(0,0,1),f.push(E/a),f.push(1-u/c)}}for(let u=0;u<c;u++)for(let A=0;A<a;A++){let E=A+l*u,T=A+l*(u+1),I=A+1+l*(u+1),R=A+1+l*u;m.push(E,T,R),m.push(T,I,R)}this.setIndex(m),this.setAttribute("position",new it(g,3)),this.setAttribute("normal",new it(S,3)),this.setAttribute("uv",new it(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};var wc=`
#ifdef USE_ALPHATEST

	#ifdef ALPHA_TO_COVERAGE

	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;

	#else

	if ( diffuseColor.a < alphaTest ) discard;

	#endif

#endif
`;var Cc=`
#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif
`;var Pc=`
#ifdef USE_AOMAP

	// reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;

	reflectedLight.indirectDiffuse *= ambientOcclusion;

	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD )

		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );

		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );

	#endif

#endif
`;var Lc=`
#ifdef USE_AOMAP

	uniform sampler2D aoMap;
	uniform float aoMapIntensity;

#endif
`;var Uc=`
vec3 transformed = vec3( position );

#ifdef USE_ALPHAHASH

	vPosition = vec3( position );

#endif
`;var Dc=`
vec3 objectNormal = vec3( normal );

#ifdef USE_TANGENT

	vec3 objectTangent = vec3( tangent.xyz );

#endif
`;var Ic=`

float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}

vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {

	vec3 halfDir = normalize( lightDir + viewDir );

	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );

	vec3 F = F_Schlick( specularColor, 1.0, dotVH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

} // validated

`;var Fc=`
#if defined( USE_COLOR_ALPHA )

	diffuseColor *= vColor;

#elif defined( USE_COLOR )

	diffuseColor.rgb *= vColor;

#endif
`;var Nc=`
#if defined( USE_COLOR_ALPHA )

	varying vec4 vColor;

#elif defined( USE_COLOR )

	varying vec3 vColor;

#endif
`;var Bc=`
#if defined( USE_COLOR_ALPHA )

	varying vec4 vColor;

#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )

	varying vec3 vColor;

#endif
`;var Oc=`
#if defined( USE_COLOR_ALPHA )

	vColor = vec4( 1.0 );

#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )

	vColor = vec3( 1.0 );

#endif

#ifdef USE_COLOR

	vColor *= color;

#endif

#ifdef USE_INSTANCING_COLOR

	vColor.xyz *= instanceColor.xyz;

#endif

#ifdef USE_BATCHING_COLOR

	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );

	vColor.xyz *= batchingColor.xyz;

#endif
`;var Gc=`
#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6

#ifndef saturate
// <tonemapping_pars_fragment> may have defined saturate() already
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )

float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }

// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand( const in vec2 uv ) {

	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );

	return fract( sin( sn ) * c );

}

#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif

struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};

struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};

#ifdef USE_ALPHAHASH

	varying vec3 vPosition;

#endif

vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

}

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {

	// dir can be either a direction vector or a normal vector
	// upper-left 3x3 of matrix is assumed to be orthogonal

	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );

}

mat3 transposeMat3( const in mat3 m ) {

	mat3 tmp;

	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );

	return tmp;

}

bool isPerspectiveMatrix( mat4 m ) {

	return m[ 2 ][ 3 ] == - 1.0;

}

vec2 equirectUv( in vec3 dir ) {

	// dir is assumed to be unit length

	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;

	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;

	return vec2( u, v );

}

vec3 BRDF_Lambert( const in vec3 diffuseColor ) {

	return RECIPROCAL_PI * diffuseColor;

} // validated

vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );

	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );

} // validated

float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );

	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );

} // validated
`;var zc=`
#ifdef ENVMAP_TYPE_CUBE_UV

	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0

	// These shader functions convert between the UV coordinates of a single face of
	// a cubemap, the 0-5 integer index of a cube face, and the direction vector for
	// sampling a textureCube (not generally normalized ).

	float getFace( vec3 direction ) {

		vec3 absDirection = abs( direction );

		float face = - 1.0;

		if ( absDirection.x > absDirection.z ) {

			if ( absDirection.x > absDirection.y )

				face = direction.x > 0.0 ? 0.0 : 3.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		} else {

			if ( absDirection.z > absDirection.y )

				face = direction.z > 0.0 ? 2.0 : 5.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		}

		return face;

	}

	// RH coordinate system; PMREM face-indexing convention
	vec2 getUV( vec3 direction, float face ) {

		vec2 uv;

		if ( face == 0.0 ) {

			uv = vec2( direction.z, direction.y ) / abs( direction.x ); // pos x

		} else if ( face == 1.0 ) {

			uv = vec2( - direction.x, - direction.z ) / abs( direction.y ); // pos y

		} else if ( face == 2.0 ) {

			uv = vec2( - direction.x, direction.y ) / abs( direction.z ); // pos z

		} else if ( face == 3.0 ) {

			uv = vec2( - direction.z, direction.y ) / abs( direction.x ); // neg x

		} else if ( face == 4.0 ) {

			uv = vec2( - direction.x, direction.z ) / abs( direction.y ); // neg y

		} else {

			uv = vec2( direction.x, direction.y ) / abs( direction.z ); // neg z

		}

		return 0.5 * ( uv + 1.0 );

	}

	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {

		float face = getFace( direction );

		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );

		mipInt = max( mipInt, cubeUV_minMipLevel );

		float faceSize = exp2( mipInt );

		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0; // #25071

		if ( face > 2.0 ) {

			uv.y += faceSize;

			face -= 3.0;

		}

		uv.x += face * faceSize;

		uv.x += filterInt * 3.0 * cubeUV_minTileSize;

		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );

		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;

		#ifdef texture2DGradEXT

			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb; // disable anisotropic filtering

		#else

			return texture2D( envMap, uv ).rgb;

		#endif

	}

	// These defines must match with PMREMGenerator

	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0

	float roughnessToMip( float roughness ) {

		float mip = 0.0;

		if ( roughness >= cubeUV_r1 ) {

			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;

		} else if ( roughness >= cubeUV_r4 ) {

			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;

		} else if ( roughness >= cubeUV_r5 ) {

			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;

		} else if ( roughness >= cubeUV_r6 ) {

			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;

		} else {

			mip = - 2.0 * log2( 1.16 * roughness ); // 1.16 = 1.79^0.25
		}

		return mip;

	}

	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {

		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );

		float mipF = fract( mip );

		float mipInt = floor( mip );

		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );

		if ( mipF == 0.0 ) {

			return vec4( color0, 1.0 );

		} else {

			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );

			return vec4( mix( color0, color1, mipF ), 1.0 );

		}

	}

#endif
`;var Vc=`

vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT

	vec3 transformedTangent = objectTangent;

#endif

#ifdef USE_BATCHING

	// this is in lieu of a per-instance normal-matrix
	// shear transforms in the instance matrix are not supported

	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;

	#ifdef USE_TANGENT

		transformedTangent = bm * transformedTangent;

	#endif

#endif

#ifdef USE_INSTANCING

	// this is in lieu of a per-instance normal-matrix
	// shear transforms in the instance matrix are not supported

	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;

	#ifdef USE_TANGENT

		transformedTangent = im * transformedTangent;

	#endif

#endif

transformedNormal = normalMatrix * transformedNormal;

#ifdef FLIP_SIDED

	transformedNormal = - transformedNormal;

#endif

#ifdef USE_TANGENT

	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;

	#ifdef FLIP_SIDED

		transformedTangent = - transformedTangent;

	#endif

#endif
`;var kc=`
gl_FragColor = linearToOutputTexel( gl_FragColor );
`;var Hc=`

// http://www.russellcottrell.com/photo/matrixCalculator.htm

// Linear sRGB => XYZ => Linear Display P3
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);

// Linear Display P3 => XYZ => Linear sRGB
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);

vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}

vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}

vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}

vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

`;var Wc=`
#ifdef USE_ENVMAP

	#ifdef ENV_WORLDPOS

		vec3 cameraToFrag;

		if ( isOrthographic ) {

			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );

		} else {

			cameraToFrag = normalize( vWorldPosition - cameraPosition );

		}

		// Transforming Normal Vectors with the Inverse Transformation
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

		#ifdef ENVMAP_MODE_REFLECTION

			vec3 reflectVec = reflect( cameraToFrag, worldNormal );

		#else

			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );

		#endif

	#else

		vec3 reflectVec = vReflect;

	#endif

	#ifdef ENVMAP_TYPE_CUBE

		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#else

		vec4 envColor = vec4( 0.0 );

	#endif

	#ifdef ENVMAP_BLENDING_MULTIPLY

		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );

	#elif defined( ENVMAP_BLENDING_MIX )

		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );

	#elif defined( ENVMAP_BLENDING_ADD )

		outgoingLight += envColor.xyz * specularStrength * reflectivity;

	#endif

#endif
`;var Xc=`
#ifdef USE_ENVMAP

	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;

	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif
`;var qc=`
#ifdef USE_ENVMAP

	uniform float reflectivity;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )

		#define ENV_WORLDPOS

	#endif

	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif

#endif
`;var Yc=`
#ifdef USE_ENVMAP

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )

		#define ENV_WORLDPOS

	#endif

	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;

	#else

		varying vec3 vReflect;
		uniform float refractionRatio;

	#endif

#endif
`;var Kc=`
#ifdef USE_ENVMAP

	#ifdef ENV_WORLDPOS

		vWorldPosition = worldPosition.xyz;

	#else

		vec3 cameraToVertex;

		if ( isOrthographic ) {

			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );

		} else {

			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );

		}

		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );

		#ifdef ENVMAP_MODE_REFLECTION

			vReflect = reflect( cameraToVertex, worldNormal );

		#else

			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );

		#endif

	#endif

#endif
`;var Zc=`
uniform bool receiveShadow;
uniform vec3 ambientLightColor;

#if defined( USE_LIGHT_PROBES )

	uniform vec3 lightProbe[ 9 ];

#endif

// get the irradiance (radiance convolved with cosine lobe) at the point 'normal' on the unit sphere
// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {

	// normal is assumed to have unit length

	float x = normal.x, y = normal.y, z = normal.z;

	// band 0
	vec3 result = shCoefficients[ 0 ] * 0.886227;

	// band 1
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;

	// band 2
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );

	return result;

}

vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {

	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );

	return irradiance;

}

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

	vec3 irradiance = ambientLightColor;

	return irradiance;

}

float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );

	if ( cutoffDistance > 0.0 ) {

		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

	}

	return distanceFalloff;

}

float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {

	return smoothstep( coneCosine, penumbraCosine, angleCosine );

}

#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {

		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;

	}

#endif


#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

	// light is an out parameter as having it as a return value caused compiler errors on some devices
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {

		vec3 lVector = pointLight.position - geometryPosition;

		light.direction = normalize( lVector );

		float lightDistance = length( lVector );

		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );

	}

#endif


#if NUM_SPOT_LIGHTS > 0

	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};

	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];

	// light is an out parameter as having it as a return value caused compiler errors on some devices
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {

		vec3 lVector = spotLight.position - geometryPosition;

		light.direction = normalize( lVector );

		float angleCos = dot( light.direction, spotLight.direction );

		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );

		if ( spotAttenuation > 0.0 ) {

			float lightDistance = length( lVector );

			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );

		} else {

			light.color = vec3( 0.0 );
			light.visible = false;

		}

	}

#endif


#if NUM_RECT_AREA_LIGHTS > 0

	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};

	// Pre-computed values of LinearTransformedCosine approximation of BRDF
	// BRDF approximation Texture is 64x64
	uniform sampler2D ltc_1; // RGBA Float
	uniform sampler2D ltc_2; // RGBA Float

	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];

#endif


#if NUM_HEMI_LIGHTS > 0

	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};

	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];

	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {

		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );

		return irradiance;

	}

#endif
`;var jc=`
#ifdef USE_ENVMAP

	vec3 getIBLIrradiance( const in vec3 normal ) {

		#ifdef ENVMAP_TYPE_CUBE_UV

			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );

			return PI * envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {

		#ifdef ENVMAP_TYPE_CUBE_UV

			vec3 reflectVec = reflect( - viewDir, normal );

			// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );

			return envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	#ifdef USE_ANISOTROPY

		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {

			#ifdef ENVMAP_TYPE_CUBE_UV

			  // https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights/anisotropy
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );

				return getIBLRadiance( viewDir, bentNormal, roughness );

			#else

				return vec3( 0.0 );

			#endif

		}

	#endif

#endif
`;var Jc=`
PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );

vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );

material.roughness = max( roughnessFactor, 0.0525 );// 0.0525 corresponds to the base mip of a 256 cubemap.
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );

#ifdef IOR

	material.ior = ior;

	#ifdef USE_SPECULAR

		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;

		#ifdef USE_SPECULAR_COLORMAP

			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;

		#endif

		#ifdef USE_SPECULAR_INTENSITYMAP

			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;

		#endif

		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );

	#else

		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;

	#endif

	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );

#else

	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;

#endif

#ifdef USE_CLEARCOAT

	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;

	#ifdef USE_CLEARCOATMAP

		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;

	#endif

	#ifdef USE_CLEARCOAT_ROUGHNESSMAP

		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;

	#endif

	material.clearcoat = saturate( material.clearcoat ); // Burley clearcoat model
	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );

#endif

#ifdef USE_DISPERSION

	material.dispersion = dispersion;

#endif

#ifdef USE_IRIDESCENCE

	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;

	#ifdef USE_IRIDESCENCEMAP

		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;

	#endif

	#ifdef USE_IRIDESCENCE_THICKNESSMAP

		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;

	#else

		material.iridescenceThickness = iridescenceThicknessMaximum;

	#endif

#endif

#ifdef USE_SHEEN

	material.sheenColor = sheenColor;

	#ifdef USE_SHEEN_COLORMAP

		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;

	#endif

	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );

	#ifdef USE_SHEEN_ROUGHNESSMAP

		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;

	#endif

#endif

#ifdef USE_ANISOTROPY

	#ifdef USE_ANISOTROPYMAP

		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;

	#else

		vec2 anisotropyV = anisotropyVector;

	#endif

	material.anisotropy = length( anisotropyV );

	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}

	// Roughness along the anisotropy bitangent is the material roughness, while the tangent roughness increases with anisotropy.
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );

	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;

#endif
`;var $c=`

struct PhysicalMaterial {

	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;

	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif

	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif

	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif

	#ifdef IOR
		float ior;
	#endif

	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif

	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif

};

// temporary
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );

vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );

    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {

	float a2 = pow2( alpha );

	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );

	return 0.5 / max( gv + gl, EPSILON );

}

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney\u2019s reparameterization
float D_GGX( const in float alpha, const in float dotNH ) {

	float a2 = pow2( alpha );

	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return RECIPROCAL_PI * a2 / pow2( denom );

}

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf
#ifdef USE_ANISOTROPY

	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {

		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );

		return saturate(v);

	}

	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {

		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;

		return RECIPROCAL_PI * a2 * pow2 ( w2 );

	}

#endif

#ifdef USE_CLEARCOAT

	// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {

		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;

		float alpha = pow2( roughness ); // UE4's roughness

		vec3 halfDir = normalize( lightDir + viewDir );

		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );

		vec3 F = F_Schlick( f0, f90, dotVH );

		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );

		float D = D_GGX( alpha, dotNH );

		return F * ( V * D );

	}

#endif

vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {

	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;

	float alpha = pow2( roughness ); // UE4's roughness

	vec3 halfDir = normalize( lightDir + viewDir );

	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );

	vec3 F = F_Schlick( f0, f90, dotVH );

	#ifdef USE_IRIDESCENCE

		F = mix( F, material.iridescenceFresnel, material.iridescence );

	#endif

	#ifdef USE_ANISOTROPY

		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );

		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );

		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );

	#else

		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );

		float D = D_GGX( alpha, dotNH );

	#endif

	return F * ( V * D );

}

// Rect Area Light

// Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
// by Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
// code: https://github.com/selfshadow/ltc_code/

vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {

	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	float dotNV = saturate( dot( N, V ) );

	// texture parameterized by sqrt( GGX alpha ) and sqrt( 1 - cos( theta ) )
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );

	uv = uv * LUT_SCALE + LUT_BIAS;

	return uv;

}

float LTC_ClippedSphereFormFactor( const in vec3 f ) {

	// Real-Time Area Lighting: a Journey from Research to Production (p.102)
	// An approximation of the form factor of a horizon-clipped rectangle.

	float l = length( f );

	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );

}

vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {

	float x = dot( v1, v2 );

	float y = abs( x );

	// rational polynomial approximation to theta / sin( theta ) / 2PI
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;

	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;

	return cross( v1, v2 ) * theta_sintheta;

}

vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {

	// bail if point is on back side of plane of light
	// assumes ccw winding order of light vertices
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );

	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );

	// construct orthonormal basis around N
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 ); // negated from paper; possibly due to a different handedness of world coordinate system

	// compute transform
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );

	// transform rect
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );

	// project rect onto sphere
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );

	// calculate vector form factor
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );

	// adjust for horizon clipping
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );

/*
	// alternate method of adjusting for horizon clipping (see referece)
	// refactoring required
	float len = length( vectorFormFactor );
	float z = vectorFormFactor.z / len;

	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	// tabulated horizon-clipped sphere, apparently...
	vec2 uv = vec2( z * 0.5 + 0.5, len );
	uv = uv * LUT_SCALE + LUT_BIAS;

	float scale = texture2D( ltc_2, uv ).w;

	float result = len * scale;
*/

	return vec3( result );

}

// End Rect Area Light

#if defined( USE_SHEEN )

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
float D_Charlie( float roughness, float dotNH ) {

	float alpha = pow2( roughness );

	// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF"
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 ); // 2^(-14/2), so sin2h^2 > 0 in fp16

	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );

}

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
float V_Neubelt( float dotNV, float dotNL ) {

	// Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );

}

vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {

	vec3 halfDir = normalize( lightDir + viewDir );

	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );

	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );

	return sheenColor * ( D * V );

}

#endif

// This is a curve-fit approxmation to the "Charlie sheen" BRDF integrated over the hemisphere from 
// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF". The analysis can be found
// in the Sheen section of https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {

	float dotNV = saturate( dot( normal, viewDir ) );

	float r2 = roughness * roughness;

	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;

	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;

	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );

	return saturate( DG * RECIPROCAL_PI );

}

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {

	float dotNV = saturate( dot( normal, viewDir ) );

	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	vec4 r = roughness * c0 + c1;

	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;

	return fab;

}

vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {

	vec2 fab = DFGApprox( normal, viewDir, roughness );

	return specularColor * fab.x + specularF90 * fab.y;

}

// Fdez-Ag\xFCera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multiscattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif

	vec2 fab = DFGApprox( normal, viewDir, roughness );

	#ifdef USE_IRIDESCENCE

		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );

	#else

		vec3 Fr = specularColor;

	#endif

	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;

	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;

	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619; // 1/21
	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );

	singleScatter += FssEss;
	multiScatter += Fms * Ems;

}

#if NUM_RECT_AREA_LIGHTS > 0

	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;

		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight; // counterclockwise; light shines in local neg z direction
		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;

		vec2 uv = LTC_Uv( normal, viewDir, roughness );

		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );

		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );

		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );

		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );

	}

#endif

void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );

	vec3 irradiance = dotNL * directLight.color;

	#ifdef USE_CLEARCOAT

		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );

		vec3 ccIrradiance = dotNLcc * directLight.color;

		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );

	#endif

	#ifdef USE_SHEEN

		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );

	#endif

	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}

void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {

	#ifdef USE_CLEARCOAT

		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );

	#endif

	#ifdef USE_SHEEN

		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );

	#endif

	// Both indirect specular and indirect diffuse light accumulate here

	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;

	#ifdef USE_IRIDESCENCE

		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );

	#else

		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );

	#endif

	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );

	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;

	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;

}

#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical

// ref: https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {

	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );

}
`;var Qc=`
/**
 * This is a template that can be used to light a material, it uses pluggable
 * RenderEquations (RE)for specific lighting scenarios.
 *
 * Instructions for use:
 * - Ensure that both RE_Direct, RE_IndirectDiffuse and RE_IndirectSpecular are defined
 * - Create a material parameter that is to be passed as the third parameter to your lighting functions.
 *
 * TODO:
 * - Add area light support.
 * - Add sphere light support.
 * - Add diffuse light probe (irradiance cubemap) support.
 */

vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

vec3 geometryClearcoatNormal = vec3( 0.0 );

#ifdef USE_CLEARCOAT

	geometryClearcoatNormal = clearcoatNormal;

#endif

#ifdef USE_IRIDESCENCE

	float dotNVi = saturate( dot( normal, geometryViewDir ) );

	if ( material.iridescenceThickness == 0.0 ) {

		material.iridescence = 0.0;

	} else {

		material.iridescence = saturate( material.iridescence );

	}

	if ( material.iridescence > 0.0 ) {

		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );

		// Iridescence F0 approximation
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );

	}

#endif

IncidentLight directLight;

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		pointLight = pointLights[ i ];

		getPointLightInfo( pointLight, geometryPosition, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;

	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		spotLight = spotLights[ i ];

		getSpotLightInfo( spotLight, geometryPosition, directLight );

		// spot lights are ordered [shadows with maps, shadows without maps, maps without shadows, none]
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif

		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif

		#undef SPOT_LIGHT_MAP_INDEX

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		directionalLight = directionalLights[ i ];

		getDirectionalLightInfo( directionalLight, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

	RectAreaLight rectAreaLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	#if defined( USE_LIGHT_PROBES )

		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );

	#endif

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );

		}
		#pragma unroll_loop_end

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );

#endif
`;var el=`
#if defined( RE_IndirectDiffuse )

	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )

		iblIrradiance += getIBLIrradiance( geometryNormal );

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

	#ifdef USE_ANISOTROPY

		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );

	#else

		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );

	#endif

	#ifdef USE_CLEARCOAT

		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );

	#endif

#endif
`;var tl=`
#if defined( RE_IndirectDiffuse )

	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

#endif

#if defined( RE_IndirectSpecular )

	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

#endif
`;var il=`
#ifdef USE_MAP

	vec4 sampledDiffuseColor = texture2D( map, vMapUv );

	#ifdef DECODE_VIDEO_TEXTURE

		// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif

	diffuseColor *= sampledDiffuseColor;

#endif
`;var nl=`
#ifdef USE_MAP

	uniform sampler2D map;

#endif
`;var rl=`
float metalnessFactor = metalness;

#ifdef USE_METALNESSMAP

	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );

	// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	metalnessFactor *= texelMetalness.b;

#endif
`;var ol=`
float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;

#ifdef FLAT_SHADED

	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );

#else

	vec3 normal = normalize( vNormal );

	#ifdef DOUBLE_SIDED

		normal *= faceDirection;

	#endif

#endif

#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )

	#ifdef USE_TANGENT

		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

	#else

		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);

	#endif

	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;

	#endif

#endif

#ifdef USE_CLEARCOAT_NORMALMAP

	#ifdef USE_TANGENT

		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

	#else

		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );

	#endif

	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;

	#endif

#endif

// non perturbed normal for clearcoat among others

vec3 nonPerturbedNormal = normal;

`;var sl=`

#ifdef USE_NORMALMAP_OBJECTSPACE

	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

	#ifdef FLIP_SIDED

		normal = - normal;

	#endif

	#ifdef DOUBLE_SIDED

		normal = normal * faceDirection;

	#endif

	normal = normalize( normalMatrix * normal );

#elif defined( USE_NORMALMAP_TANGENTSPACE )

	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;

	normal = normalize( tbn * mapN );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );

#endif
`;var al=`
#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif
`;var cl=`
#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif
`;var ll=`
#ifndef FLAT_SHADED // normal is computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

	#ifdef USE_TANGENT

		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

	#endif

#endif
`;var ul=`
#ifdef USE_CLEARCOAT

	vec3 clearcoatNormal = nonPerturbedNormal;

#endif
`;var hl=`
#ifdef USE_CLEARCOAT_NORMALMAP

	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;

	clearcoatNormal = normalize( tbn2 * clearcoatMapN );

#endif
`;var fl=`

#ifdef USE_CLEARCOATMAP

	uniform sampler2D clearcoatMap;

#endif

#ifdef USE_CLEARCOAT_NORMALMAP

	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;

#endif

#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	uniform sampler2D clearcoatRoughnessMap;

#endif
`;var pl=`
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif

gl_FragColor = vec4( outgoingLight, diffuseColor.a );
`;var dl=`
vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}

vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}

const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)
const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;

const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );

const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );

vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}

vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	// the 0.9999 tweak is unimportant, very tiny empirical improvement
	// return vec3( vuf * Inv255, gf * PackUpscale, bf * 0.9999 );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}

vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}

float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}

float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}

float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}

vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}

vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}

// NOTE: viewZ, the z-coordinate in camera space, is negative for points in front of the camera

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	// -near maps to 0; -far maps to 1
	return ( viewZ + near ) / ( near - far );
}

float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	// maps orthographic depth in [ 0, 1 ] to viewZ
	return depth * ( near - far ) - near;
}

// NOTE: https://twitter.com/gonnavis/status/1377183786949959682

float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	// -near maps to 0; -far maps to 1
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}

float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	// maps perspective depth in [ 0, 1 ] to viewZ
	return ( near * far ) / ( ( far - near ) * depth - far );
}
`;var ml=`
#ifdef PREMULTIPLIED_ALPHA

	// Get get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
	gl_FragColor.rgb *= gl_FragColor.a;

#endif
`;var _l=`
vec4 mvPosition = vec4( transformed, 1.0 );

#ifdef USE_BATCHING

	mvPosition = batchingMatrix * mvPosition;

#endif

#ifdef USE_INSTANCING

	mvPosition = instanceMatrix * mvPosition;

#endif

mvPosition = modelViewMatrix * mvPosition;

gl_Position = projectionMatrix * mvPosition;
`;var gl=`
#ifdef DITHERING

	gl_FragColor.rgb = dithering( gl_FragColor.rgb );

#endif
`;var xl=`
#ifdef DITHERING

	// based on https://www.shadertoy.com/view/MslGR8
	vec3 dithering( vec3 color ) {
		//Calculate grid position
		float grid_position = rand( gl_FragCoord.xy );

		//Shift the individual colors differently, thus making it even harder to see the dithering pattern
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );

		//modify shift according to grid position.
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );

		//shift the color by dither_shift
		return color + dither_shift_RGB;
	}

#endif
`;var Ml=`
float roughnessFactor = roughness;

#ifdef USE_ROUGHNESSMAP

	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );

	// reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	roughnessFactor *= texelRoughness.g;

#endif
`;var vl=`
#if defined( TONE_MAPPING )

	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );

#endif
`;var Sl=`
#ifndef saturate
// <common> may have defined saturate() already
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

uniform float toneMappingExposure;

// exposure only
vec3 LinearToneMapping( vec3 color ) {

	return saturate( toneMappingExposure * color );

}

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
vec3 ReinhardToneMapping( vec3 color ) {

	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );

}

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
vec3 CineonToneMapping( vec3 color ) {

	// filmic operator by Jim Hejl and Richard Burgess-Dawson
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );

}

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
vec3 RRTAndODTFit( vec3 v ) {

	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;

}

// this implementation of ACES is modified to accommodate a brighter viewing environment.
// the scale factor of 1/0.6 is subjective. see discussion in #19621.

vec3 ACESFilmicToneMapping( vec3 color ) {

	// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);

	// ODT_SAT => XYZ => D60_2_D65 => sRGB
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);

	color *= toneMappingExposure / 0.6;

	color = ACESInputMat * color;

	// Apply RRT and ODT
	color = RRTAndODTFit( color );

	color = ACESOutputMat * color;

	// Clamp to [0, 1]
	return saturate( color );

}

// Matrices for rec 2020 <> rec 709 color space conversion
// matrix provided in row-major order so it has been transposed
// https://www.itu.int/pub/R-REP-BT.2407-2017
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);

const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);

// https://iolite-engine.com/blog_posts/minimal_agx_implementation
// Mean error^2: 3.6705141e-06
vec3 agxDefaultContrastApprox( vec3 x ) {

	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;

	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;

}

// AgX Tone Mapping implementation based on Filament, which in turn is based
// on Blender's implementation using rec 2020 primaries
// https://github.com/google/filament/pull/7236
// Inputs and outputs are encoded as Linear-sRGB.

vec3 AgXToneMapping( vec3 color ) {

	// AgX constants
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);

	// explicit AgXOutsetMatrix generated from Filaments AgXOutsetMatrixInv
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);

	// LOG2_MIN      = -10.0
	// LOG2_MAX      =  +6.5
	// MIDDLE_GRAY   =  0.18
	const float AgxMinEv = - 12.47393;  // log2( pow( 2, LOG2_MIN ) * MIDDLE_GRAY )
	const float AgxMaxEv = 4.026069;    // log2( pow( 2, LOG2_MAX ) * MIDDLE_GRAY )

	color *= toneMappingExposure;

	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;

	color = AgXInsetMatrix * color;

	// Log2 encoding
	color = max( color, 1e-10 ); // avoid 0 or negative numbers for log2
	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );

	color = clamp( color, 0.0, 1.0 );

	// Apply sigmoid
	color = agxDefaultContrastApprox( color );

	// Apply AgX look
	// v = agxLook(v, look);

	color = AgXOutsetMatrix * color;

	// Linearize
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );

	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;

	// Gamut mapping. Simple clamp for now.
	color = clamp( color, 0.0, 1.0 );

	return color;

}

// https://modelviewer.dev/examples/tone-mapping

vec3 NeutralToneMapping( vec3 color ) {

	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;

	color *= toneMappingExposure;

	float x = min( color.r, min( color.g, color.b ) );

	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;

	color -= offset;

	float peak = max( color.r, max( color.g, color.b ) );

	if ( peak < StartCompression ) return color;

	float d = 1. - StartCompression;

	float newPeak = 1. - d * d / ( peak + d - StartCompression );

	color *= newPeak / peak;

	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );

	return mix( color, vec3( newPeak ), g );

}

vec3 CustomToneMapping( vec3 color ) { return color; }
`;var El=`
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	varying vec2 vUv;

#endif
#ifdef USE_MAP

	varying vec2 vMapUv;

#endif
#ifdef USE_ALPHAMAP

	varying vec2 vAlphaMapUv;

#endif
#ifdef USE_LIGHTMAP

	varying vec2 vLightMapUv;

#endif
#ifdef USE_AOMAP

	varying vec2 vAoMapUv;

#endif
#ifdef USE_BUMPMAP

	varying vec2 vBumpMapUv;

#endif
#ifdef USE_NORMALMAP

	varying vec2 vNormalMapUv;

#endif
#ifdef USE_EMISSIVEMAP

	varying vec2 vEmissiveMapUv;

#endif
#ifdef USE_METALNESSMAP

	varying vec2 vMetalnessMapUv;

#endif
#ifdef USE_ROUGHNESSMAP

	varying vec2 vRoughnessMapUv;

#endif
#ifdef USE_ANISOTROPYMAP

	varying vec2 vAnisotropyMapUv;

#endif
#ifdef USE_CLEARCOATMAP

	varying vec2 vClearcoatMapUv;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

	varying vec2 vClearcoatNormalMapUv;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	varying vec2 vClearcoatRoughnessMapUv;

#endif
#ifdef USE_IRIDESCENCEMAP

	varying vec2 vIridescenceMapUv;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

	varying vec2 vIridescenceThicknessMapUv;

#endif
#ifdef USE_SHEEN_COLORMAP

	varying vec2 vSheenColorMapUv;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

	varying vec2 vSheenRoughnessMapUv;

#endif
#ifdef USE_SPECULARMAP

	varying vec2 vSpecularMapUv;

#endif
#ifdef USE_SPECULAR_COLORMAP

	varying vec2 vSpecularColorMapUv;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

	varying vec2 vSpecularIntensityMapUv;

#endif
#ifdef USE_TRANSMISSIONMAP

	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;

#endif
#ifdef USE_THICKNESSMAP

	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;

#endif
`;var yl=`
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	varying vec2 vUv;

#endif
#ifdef USE_MAP

	uniform mat3 mapTransform;
	varying vec2 vMapUv;

#endif
#ifdef USE_ALPHAMAP

	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;

#endif
#ifdef USE_LIGHTMAP

	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;

#endif
#ifdef USE_AOMAP

	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;

#endif
#ifdef USE_BUMPMAP

	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;

#endif
#ifdef USE_NORMALMAP

	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;

#endif
#ifdef USE_DISPLACEMENTMAP

	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;

#endif
#ifdef USE_EMISSIVEMAP

	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;

#endif
#ifdef USE_METALNESSMAP

	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;

#endif
#ifdef USE_ROUGHNESSMAP

	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;

#endif
#ifdef USE_ANISOTROPYMAP

	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;

#endif
#ifdef USE_CLEARCOATMAP

	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;

#endif
#ifdef USE_SHEEN_COLORMAP

	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;

#endif
#ifdef USE_IRIDESCENCEMAP

	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;

#endif
#ifdef USE_SPECULARMAP

	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;

#endif
#ifdef USE_SPECULAR_COLORMAP

	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;

#endif
#ifdef USE_TRANSMISSIONMAP

	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;

#endif
#ifdef USE_THICKNESSMAP

	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;

#endif
`;var Tl=`
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	vUv = vec3( uv, 1 ).xy;

#endif
#ifdef USE_MAP

	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;

#endif
#ifdef USE_ALPHAMAP

	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_LIGHTMAP

	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_AOMAP

	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_BUMPMAP

	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_NORMALMAP

	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_DISPLACEMENTMAP

	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_EMISSIVEMAP

	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_METALNESSMAP

	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_ROUGHNESSMAP

	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_ANISOTROPYMAP

	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_CLEARCOATMAP

	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_IRIDESCENCEMAP

	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SHEEN_COLORMAP

	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SPECULARMAP

	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SPECULAR_COLORMAP

	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_TRANSMISSIONMAP

	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_THICKNESSMAP

	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;

#endif
`;var Al=`
#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0

	vec4 worldPosition = vec4( transformed, 1.0 );

	#ifdef USE_BATCHING

		worldPosition = batchingMatrix * worldPosition;

	#endif

	#ifdef USE_INSTANCING

		worldPosition = instanceMatrix * worldPosition;

	#endif

	worldPosition = modelMatrix * worldPosition;

#endif
`;var bl=`
varying vec2 vUv;
uniform mat3 uvTransform;

void main() {

	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	gl_Position = vec4( position.xy, 1.0, 1.0 );

}
`,Rl=`
uniform sampler2D t2D;
uniform float backgroundIntensity;

varying vec2 vUv;

void main() {

	vec4 texColor = texture2D( t2D, vUv );

	#ifdef DECODE_VIDEO_TEXTURE

		// use inline sRGB decode until browsers properly support SRGB8_APLHA8 with video textures

		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );

	#endif

	texColor.rgb *= backgroundIntensity;

	gl_FragColor = texColor;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;var wl=`
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

	gl_Position.z = gl_Position.w; // set z to camera.far

}
`,Cl=`

#ifdef ENVMAP_TYPE_CUBE

	uniform samplerCube envMap;

#elif defined( ENVMAP_TYPE_CUBE_UV )

	uniform sampler2D envMap;

#endif

uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;

varying vec3 vWorldDirection;

#include <cube_uv_reflection_fragment>

void main() {

	#ifdef ENVMAP_TYPE_CUBE

		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );

	#elif defined( ENVMAP_TYPE_CUBE_UV )

		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );

	#else

		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );

	#endif

	texColor.rgb *= backgroundIntensity;

	gl_FragColor = texColor;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;var Pl=`
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

	gl_Position.z = gl_Position.w; // set z to camera.far

}
`,Ll=`
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;

varying vec3 vWorldDirection;

void main() {

	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );

	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;var Ul=`
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

// This is used for computing an equivalent of gl_FragCoord.z that is as high precision as possible.
// Some platforms compute gl_FragCoord at a lower precision which makes the manually computed value better for
// depth-based postprocessing effects. Reproduced on iPad with A10 processor / iPadOS 13.3.1.
varying vec2 vHighPrecisionZW;

void main() {

	#include <uv_vertex>

	#include <batching_vertex>
	#include <skinbase_vertex>

	#include <morphinstance_vertex>

	#ifdef USE_DISPLACEMENTMAP

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>

	#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vHighPrecisionZW = gl_Position.zw;

}
`,Dl=`
#if DEPTH_PACKING == 3200

	uniform float opacity;

#endif

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec2 vHighPrecisionZW;

void main() {

	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>

	#if DEPTH_PACKING == 3200

		diffuseColor.a = opacity;

	#endif

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	#include <logdepthbuf_fragment>

	// Higher precision equivalent of gl_FragCoord.z. This assumes depthRange has been left to its default values.
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;

	#if DEPTH_PACKING == 3200

		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );

	#elif DEPTH_PACKING == 3201

		gl_FragColor = packDepthToRGBA( fragCoordZ );

	#elif DEPTH_PACKING == 3202

		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );

	#elif DEPTH_PACKING == 3203

		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );

	#endif

}
`;var Il=`
#define DISTANCE

varying vec3 vWorldPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>

	#include <batching_vertex>
	#include <skinbase_vertex>

	#include <morphinstance_vertex>

	#ifdef USE_DISPLACEMENTMAP

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>

	#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>

	vWorldPosition = worldPosition.xyz;

}
`,Fl=`
#define DISTANCE

uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>

void main () {

	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist ); // clamp to [ 0, 1 ]

	gl_FragColor = packDepthToRGBA( dist );

}
`;var Nl=`
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

}
`,Bl=`
uniform sampler2D tEquirect;

varying vec3 vWorldDirection;

#include <common>

void main() {

	vec3 direction = normalize( vWorldDirection );

	vec2 sampleUV = equirectUv( direction );

	gl_FragColor = texture2D( tEquirect, sampleUV );

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;var Ol=`
uniform float scale;
attribute float lineDistance;

varying float vLineDistance;

#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	vLineDistance = scale * lineDistance;

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

}
`,Gl=`
uniform vec3 diffuse;
uniform float opacity;

uniform float dashSize;
uniform float totalSize;

varying float vLineDistance;

#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	if ( mod( vLineDistance, totalSize ) > dashSize ) {

		discard;

	}

	vec3 outgoingLight = vec3( 0.0 );

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>

	outgoingLight = diffuseColor.rgb; // simple shader

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>

}
`;var zl=`
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>

	#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

}
`,Vl=`
uniform vec3 diffuse;
uniform float opacity;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	// accumulation (baked indirect lighting only)
	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;

	#else

		reflectedLight.indirectDiffuse += vec3( 1.0 );

	#endif

	// modulation
	#include <aomap_fragment>

	reflectedLight.indirectDiffuse *= diffuseColor.rgb;

	vec3 outgoingLight = reflectedLight.indirectDiffuse;

	#include <envmap_fragment>

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;var kl=`
#define LAMBERT

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`,Hl=`
#define LAMBERT

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;var Wl=`
#define MATCAP

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>

#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

	vViewPosition = - mvPosition.xyz;

}
`,Xl=`
#define MATCAP

uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;

varying vec3 vViewPosition;

#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

	#ifdef USE_MATCAP

		vec4 matcapColor = texture2D( matcap, uv );

	#else

		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 ); // default if matcap is missing

	#endif

	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;var ql=`
#define NORMAL

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )

	varying vec3 vViewPosition;

#endif

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )

	vViewPosition = - mvPosition.xyz;

#endif

}
`,Yl=`
#define NORMAL

uniform float opacity;

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )

	varying vec3 vViewPosition;

#endif

#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );

	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>

	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );

	#ifdef OPAQUE

		gl_FragColor.a = 1.0;

	#endif

}
`;var Kl=`
#define PHONG

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`,Zl=`
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;var jl=`
#define STANDARD

varying vec3 vViewPosition;

#ifdef USE_TRANSMISSION

	varying vec3 vWorldPosition;

#endif

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

#ifdef USE_TRANSMISSION

	vWorldPosition = worldPosition.xyz;

#endif
}
`,Jl=`
#define STANDARD

#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

#ifdef IOR
	uniform float ior;
#endif

#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;

	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif

	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif

#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif

#ifdef USE_DISPERSION
	uniform float dispersion;
#endif

#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif

#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;

	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif

	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif

#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;

	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif

varying vec3 vViewPosition;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;

	#include <transmission_fragment>

	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

	#ifdef USE_SHEEN

		// Sheen energy compensation approximation calculation can be found at the end of
		// https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );

		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;

	#endif

	#ifdef USE_CLEARCOAT

		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );

		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );

		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;

	#endif

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;var $l=`
#define TOON

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`,Ql=`
#define TOON

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;var eu=`
uniform float size;
uniform float scale;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef USE_POINTS_UV

	varying vec2 vUv;
	uniform mat3 uvTransform;

#endif

void main() {

	#ifdef USE_POINTS_UV

		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	#endif

	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>

	gl_PointSize = size;

	#ifdef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

	#endif

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

}
`,tu=`
uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );

	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>

}
`;var iu=`
#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>

void main() {

	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`,nu=`
uniform vec3 color;
uniform float opacity;

#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main() {

	#include <logdepthbuf_fragment>

	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>

}
`;var ru=`
uniform float rotation;
uniform vec2 center;

#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>

	vec4 mvPosition = modelViewMatrix[ 3 ];

	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );

	#ifndef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) scale *= - mvPosition.z;

	#endif

	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;

	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;

	mvPosition.xy += rotatedPosition;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

}
`,ou=`
uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>

}
`;var lf="",uf="",hf="",ff="",pf="",df="",mf="",_f="",gf="",xf="",Mf="",vf="",Sf="",Ef="",yf="",Tf="",Af="",bf="",Rf="",wf="",Cf="",Pf="",Lf="",Uf="",Df="",If="",Ff="",Nf="",Bf="",Of="",Gf="",zf="",Vf="",kf="",Hf="",Wf="",Xf="",qf="",Yf="",Kf="",Zf="",jf="",Jf="",$f="",Qf="",ep="",tp="",ip="",np="",rp="",op="",sp="",ap="",cp="",lp="",st={alphahash_fragment:lf,alphahash_pars_fragment:uf,alphamap_fragment:hf,alphamap_pars_fragment:ff,alphatest_fragment:wc,alphatest_pars_fragment:Cc,aomap_fragment:Pc,aomap_pars_fragment:Lc,batching_pars_vertex:pf,batching_vertex:df,begin_vertex:Uc,beginnormal_vertex:Dc,bsdfs:Ic,iridescence_fragment:mf,bumpmap_pars_fragment:_f,clipping_planes_fragment:gf,clipping_planes_pars_fragment:xf,clipping_planes_pars_vertex:Mf,clipping_planes_vertex:vf,color_fragment:Fc,color_pars_fragment:Nc,color_pars_vertex:Bc,color_vertex:Oc,common:Gc,cube_uv_reflection_fragment:zc,defaultnormal_vertex:Vc,displacementmap_pars_vertex:Sf,displacementmap_vertex:Ef,emissivemap_fragment:yf,emissivemap_pars_fragment:Tf,colorspace_fragment:kc,colorspace_pars_fragment:Hc,envmap_fragment:Wc,envmap_common_pars_fragment:Xc,envmap_pars_fragment:qc,envmap_pars_vertex:Yc,envmap_physical_pars_fragment:jc,envmap_vertex:Kc,fog_vertex:Af,fog_pars_vertex:bf,fog_fragment:Rf,fog_pars_fragment:wf,gradientmap_pars_fragment:Cf,lightmap_pars_fragment:Pf,lights_lambert_fragment:Lf,lights_lambert_pars_fragment:Uf,lights_pars_begin:Zc,lights_toon_fragment:Df,lights_toon_pars_fragment:If,lights_phong_fragment:Ff,lights_phong_pars_fragment:Nf,lights_physical_fragment:Jc,lights_physical_pars_fragment:$c,lights_fragment_begin:Qc,lights_fragment_maps:el,lights_fragment_end:tl,logdepthbuf_fragment:Bf,logdepthbuf_pars_fragment:Of,logdepthbuf_pars_vertex:Gf,logdepthbuf_vertex:zf,map_fragment:il,map_pars_fragment:nl,map_particle_fragment:Vf,map_particle_pars_fragment:kf,metalnessmap_fragment:rl,metalnessmap_pars_fragment:Hf,morphinstance_vertex:Wf,morphcolor_vertex:Xf,morphnormal_vertex:qf,morphtarget_pars_vertex:Yf,morphtarget_vertex:Kf,normal_fragment_begin:ol,normal_fragment_maps:sl,normal_pars_fragment:al,normal_pars_vertex:cl,normal_vertex:ll,normalmap_pars_fragment:Zf,clearcoat_normal_fragment_begin:ul,clearcoat_normal_fragment_maps:hl,clearcoat_pars_fragment:fl,iridescence_pars_fragment:jf,opaque_fragment:pl,packing:dl,premultiplied_alpha_fragment:ml,project_vertex:_l,dithering_fragment:gl,dithering_pars_fragment:xl,roughnessmap_fragment:Ml,roughnessmap_pars_fragment:Jf,shadowmap_pars_fragment:$f,shadowmap_pars_vertex:Qf,shadowmap_vertex:ep,shadowmask_pars_fragment:tp,skinbase_vertex:ip,skinning_pars_vertex:np,skinning_vertex:rp,skinnormal_vertex:op,specularmap_fragment:sp,specularmap_pars_fragment:ap,tonemapping_fragment:vl,tonemapping_pars_fragment:Sl,transmission_fragment:cp,transmission_pars_fragment:lp,uv_pars_fragment:El,uv_pars_vertex:yl,uv_vertex:Tl,worldpos_vertex:Al,background_vert:bl,background_frag:Rl,backgroundCube_vert:wl,backgroundCube_frag:Cl,cube_vert:Pl,cube_frag:Ll,depth_vert:Ul,depth_frag:Dl,distanceRGBA_vert:Il,distanceRGBA_frag:Fl,equirect_vert:Nl,equirect_frag:Bl,linedashed_vert:Ol,linedashed_frag:Gl,meshbasic_vert:zl,meshbasic_frag:Vl,meshlambert_vert:kl,meshlambert_frag:Hl,meshmatcap_vert:Wl,meshmatcap_frag:Xl,meshnormal_vert:ql,meshnormal_frag:Yl,meshphong_vert:Kl,meshphong_frag:Zl,meshphysical_vert:jl,meshphysical_frag:Jl,meshtoon_vert:$l,meshtoon_frag:Ql,points_vert:eu,points_frag:tu,shadow_vert:iu,shadow_frag:nu,sprite_vert:ru,sprite_frag:ou};var Je={common:{diffuse:{value:new Pe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Le}},envmap:{envMap:{value:null},envMapRotation:{value:new Le},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Le}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Le}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Le},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Le},normalScale:{value:new ve(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Le},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Le}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Le}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Le}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Pe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Pe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0},uvTransform:{value:new Le}},sprite:{diffuse:{value:new Pe(16777215)},opacity:{value:1},center:{value:new ve(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}}};var jt={basic:{uniforms:kn([Je.common,Je.specularmap,Je.envmap,Je.aomap,Je.lightmap,Je.fog]),vertexShader:st.meshbasic_vert,fragmentShader:st.meshbasic_frag},lambert:{uniforms:{},vertexShader:"",fragmentShader:""},phong:{uniforms:{},vertexShader:"",fragmentShader:""},standard:{uniforms:kn([Je.common,Je.envmap,Je.aomap,Je.lightmap,Je.emissivemap,Je.bumpmap,Je.normalmap,Je.displacementmap,Je.roughnessmap,Je.metalnessmap,Je.fog,Je.lights,{emissive:{value:new Pe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag},toon:{uniforms:{},vertexShader:"",fragmentShader:""},matcap:{uniforms:{},vertexShader:"",fragmentShader:""},points:{uniforms:{},vertexShader:"",fragmentShader:""},dashed:{uniforms:{},vertexShader:"",fragmentShader:""},depth:{uniforms:{},vertexShader:"",fragmentShader:""},normal:{uniforms:{},vertexShader:"",fragmentShader:""},sprite:{uniforms:{},vertexShader:"",fragmentShader:""},background:{uniforms:{uvTransform:{value:new Le},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:st.background_vert,fragmentShader:st.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Le}},vertexShader:st.backgroundCube_vert,fragmentShader:st.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:st.cube_vert,fragmentShader:st.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:st.equirect_vert,fragmentShader:st.equirect_frag},distanceRGBA:{uniforms:{},vertexShader:"",fragmentShader:""},shadow:{uniforms:kn([Je.lights,Je.fog,{color:{value:new Pe(0)},opacity:{value:1}}]),vertexShader:st.shadow_vert,fragmentShader:st.shadow_frag}};jt.physical={uniforms:kn([jt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Le},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Le},clearcoatNormalScale:{value:new ve(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Le},specularColor:{value:new Pe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Le},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Le}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag};var jo={r:0,b:0,g:0},en=new yt,up=new Ge;function su(n,e,t,i,r,o,s){let a=new Pe(0),c=o===!0?0:1,l,h,p=null,d=0,m=null;function g(A){let E=A.isScene===!0?A.background:null;return E&&E.isTexture&&(E=(A.backgroundBlurriness>0?t:e).get(E)),E}function S(A){let E=!1,T=g(A);T===null?u(a,c):T&&T.isColor&&(u(T,1),E=!0);let I=n.xr.getEnvironmentBlendMode();I==="additive"?i.buffers.color.setClear(0,0,0,1,s):I==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,s),(n.autoClear||E)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function f(A,E){let T=g(E);T&&(T.isCubeTexture||T.mapping===Pi)?(h===void 0&&(h=new se(new tt(1,1,1),new Ct({name:"BackgroundCubeMaterial",uniforms:Ri(jt.backgroundCube.uniforms),vertexShader:jt.backgroundCube.vertexShader,fragmentShader:jt.backgroundCube.fragmentShader,side:et,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,R,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),en.copy(E.backgroundRotation),en.x*=-1,en.y*=-1,en.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(en.y*=-1,en.z*=-1),h.material.uniforms.envMap.value=T,h.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(up.makeRotationFromEuler(en)),h.material.toneMapped=Ue.getTransfer(T.colorSpace)!==qe,(p!==T||d!==T.version||m!==n.toneMapping)&&(h.material.needsUpdate=!0,p=T,d=T.version,m=n.toneMapping),h.layers.enableAll(),A.unshift(h,h.geometry,h.material,0,0,null)):T&&T.isTexture&&(l===void 0&&(l=new se(new Vi(2,2),new Ct({name:"BackgroundMaterial",uniforms:Ri(jt.background.uniforms),vertexShader:jt.background.vertexShader,fragmentShader:jt.background.fragmentShader,side:zt,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(l)),l.material.uniforms.t2D.value=T,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.toneMapped=Ue.getTransfer(T.colorSpace)!==qe,T.matrixAutoUpdate===!0&&T.updateMatrix(),l.material.uniforms.uvTransform.value.copy(T.matrix),(p!==T||d!==T.version||m!==n.toneMapping)&&(l.material.needsUpdate=!0,p=T,d=T.version,m=n.toneMapping),l.layers.enableAll(),A.unshift(l,l.geometry,l.material,0,0,null))}function u(A,E){A.getRGB(jo,Xo(n)),i.buffers.color.setClear(jo.r,jo.g,jo.b,E,s)}return{getClearColor:function(){return a},setClearColor:function(A,E=1){a.set(A),c=E,u(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(A){c=A,u(a,c)},render:S,addToRenderList:f}}function au(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=d(null),o=r,s=!1;function a(_,v,F,B,k){let Z=!1,V=p(B,F,v);o!==V&&(o=V,l(o.object)),Z=m(_,B,F,k),Z&&g(_,B,F,k),k!==null&&e.update(k,n.ELEMENT_ARRAY_BUFFER),(Z||s)&&(s=!1,T(_,v,F,B),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function c(){return n.createVertexArray()}function l(_){return n.bindVertexArray(_)}function h(_){return n.deleteVertexArray(_)}function p(_,v,F){let B=F.wireframe===!0,k=i[_.id];k===void 0&&(k={},i[_.id]=k);let Z=k[v.id];Z===void 0&&(Z={},k[v.id]=Z);let V=Z[B];return V===void 0&&(V=d(c()),Z[B]=V),V}function d(_){let v=[],F=[],B=[];for(let k=0;k<t;k++)v[k]=0,F[k]=0,B[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:v,enabledAttributes:F,attributeDivisors:B,object:_,attributes:{},index:null}}function m(_,v,F,B){let k=o.attributes,Z=v.attributes,V=0,Q=F.getAttributes();for(let W in Q)if(Q[W].location>=0){let ce=k[W],_e=Z[W];if(_e===void 0&&(W==="instanceMatrix"&&_.instanceMatrix&&(_e=_.instanceMatrix),W==="instanceColor"&&_.instanceColor&&(_e=_.instanceColor)),ce===void 0||ce.attribute!==_e||_e&&ce.data!==_e.data)return!0;V++}return o.attributesNum!==V||o.index!==B}function g(_,v,F,B){let k={},Z=v.attributes,V=0,Q=F.getAttributes();for(let W in Q)if(Q[W].location>=0){let ce=Z[W];ce===void 0&&(W==="instanceMatrix"&&_.instanceMatrix&&(ce=_.instanceMatrix),W==="instanceColor"&&_.instanceColor&&(ce=_.instanceColor));let _e={};_e.attribute=ce,ce&&ce.data&&(_e.data=ce.data),k[W]=_e,V++}o.attributes=k,o.attributesNum=V,o.index=B}function S(){let _=o.newAttributes;for(let v=0,F=_.length;v<F;v++)_[v]=0}function f(_){u(_,0)}function u(_,v){let F=o.newAttributes,B=o.enabledAttributes,k=o.attributeDivisors;F[_]=1,B[_]===0&&(n.enableVertexAttribArray(_),B[_]=1),k[_]!==v&&(n.vertexAttribDivisor(_,v),k[_]=v)}function A(){let _=o.newAttributes,v=o.enabledAttributes;for(let F=0,B=v.length;F<B;F++)v[F]!==_[F]&&(n.disableVertexAttribArray(F),v[F]=0)}function E(_,v,F,B,k,Z,V){V===!0?n.vertexAttribIPointer(_,v,F,k,Z):n.vertexAttribPointer(_,v,F,B,k,Z)}function T(_,v,F,B){S();let k=B.attributes,Z=F.getAttributes(),V=v.defaultAttributeValues;for(let Q in Z){let W=Z[Q];if(W.location>=0){let ae=k[Q];if(ae===void 0&&(Q==="instanceMatrix"&&_.instanceMatrix&&(ae=_.instanceMatrix),Q==="instanceColor"&&_.instanceColor&&(ae=_.instanceColor)),ae!==void 0){let ce=ae.normalized,_e=ae.itemSize,ke=e.get(ae);if(ke===void 0)continue;let Ye=ke.buffer,X=ke.type,J=ke.bytesPerElement,de=X===n.INT||X===n.UNSIGNED_INT||ae.gpuType===ln;if(ae.isInterleavedBufferAttribute){let le=ae.data,we=le.stride,Ee=ae.offset;if(le.isInstancedInterleavedBuffer){for(let Ne=0;Ne<W.locationSize;Ne++)u(W.location+Ne,le.meshPerAttribute);_.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Ne=0;Ne<W.locationSize;Ne++)f(W.location+Ne);n.bindBuffer(n.ARRAY_BUFFER,Ye);for(let Ne=0;Ne<W.locationSize;Ne++)E(W.location+Ne,_e/W.locationSize,X,ce,we*J,(Ee+_e/W.locationSize*Ne)*J,de)}else{if(ae.isInstancedBufferAttribute){for(let le=0;le<W.locationSize;le++)u(W.location+le,ae.meshPerAttribute);_.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let le=0;le<W.locationSize;le++)f(W.location+le);n.bindBuffer(n.ARRAY_BUFFER,Ye);for(let le=0;le<W.locationSize;le++)E(W.location+le,_e/W.locationSize,X,ce,_e*J,_e/W.locationSize*le*J,de)}}else if(V!==void 0){let ce=V[Q];if(ce!==void 0)switch(ce.length){case 2:n.vertexAttrib2fv(W.location,ce);break;case 3:n.vertexAttrib3fv(W.location,ce);break;case 4:n.vertexAttrib4fv(W.location,ce);break;default:n.vertexAttrib1fv(W.location,ce)}}}}A()}function I(){D();for(let _ in i){let v=i[_];for(let F in v){let B=v[F];for(let k in B)h(B[k].object),delete B[k];delete v[F]}delete i[_]}}function R(_){if(i[_.id]===void 0)return;let v=i[_.id];for(let F in v){let B=v[F];for(let k in B)h(B[k].object),delete B[k];delete v[F]}delete i[_.id]}function b(_){for(let v in i){let F=i[v];if(F[_.id]===void 0)continue;let B=F[_.id];for(let k in B)h(B[k].object),delete B[k];delete F[_.id]}}function D(){z(),s=!0,o!==r&&(o=r,l(o.object))}function z(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:D,resetDefaultState:z,dispose:I,releaseStatesOfGeometry:R,releaseStatesOfProgram:b,initAttributes:S,enableAttribute:f,disableUnusedAttributes:A}}function cu(n,e,t){let i;function r(l){i=l}function o(l,h){n.drawArrays(i,l,h),t.update(h,i,1)}function s(l,h,p){p!==0&&(n.drawArraysInstanced(i,l,h,p),t.update(h,i,p))}function a(l,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,h,0,p);let m=0;for(let g=0;g<p;g++)m+=h[g];t.update(m,i,1)}function c(l,h,p,d){if(p===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<l.length;g++)s(l[g],h[g],d[g]);else{m.multiDrawArraysInstancedWEBGL(i,l,0,h,0,d,0,p);let g=0;for(let S=0;S<p;S++)g+=h[S];for(let S=0;S<d.length;S++)t.update(g,i,d[S])}}this.setMode=r,this.render=o,this.renderInstances=s,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function lu(n,e,t,i){let r;function o(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function s(b){return!(b!==dt&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){let D=b===hi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==St&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==bt&&!D)}function c(b){if(b==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let p=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(d===!0){let b=e.get("EXT_clip_control");b.clipControlEXT(b.LOWER_LEFT_EXT,b.ZERO_TO_ONE_EXT)}let m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=n.getParameter(n.MAX_TEXTURE_SIZE),f=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),u=n.getParameter(n.MAX_VERTEX_ATTRIBS),A=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),T=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),I=g>0,R=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:o,getMaxPrecision:c,textureFormatReadable:s,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:p,reverseDepthBuffer:d,maxTextures:m,maxVertexTextures:g,maxTextureSize:S,maxCubemapSize:f,maxAttributes:u,maxVertexUniforms:A,maxVaryings:E,maxFragmentUniforms:T,vertexTextures:I,maxSamples:R}}function uu(n){let e=this,t=null,i=0,r=!1,o=!1,s=new ci,a=new Le,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(p,d){let m=p.length!==0||d||i!==0||r;return r=d,i=p.length,m},this.beginShadows=function(){o=!0,h(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(p,d){t=h(p,d,0)},this.setState=function(p,d,m){let g=p.clippingPlanes,S=p.clipIntersection,f=p.clipShadows,u=n.get(p);if(!r||g===null||g.length===0||o&&!f)o?h(null):l();else{let A=o?0:i,E=A*4,T=u.clippingState||null;c.value=T,T=h(g,d,E,m);for(let I=0;I!==E;++I)T[I]=t[I];u.clippingState=T,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=A}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(p,d,m,g){let S=p!==null?p.length:0,f=null;if(S!==0){if(f=c.value,g!==!0||f===null){let u=m+S*4,A=d.matrixWorldInverse;a.getNormalMatrix(A),(f===null||f.length<u)&&(f=new Float32Array(u));for(let E=0,T=m;E!==S;++E,T+=4)s.copy(p[E]).applyMatrix4(A,a),s.normal.toArray(f,T),f[T+3]=s.constant}c.value=f,c.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,f}}function hu(n){let e=new WeakMap;function t(s,a){return a===ar?s.mapping=ei:a===cr&&(s.mapping=ui),s}function i(s){if(s&&s.isTexture){let a=s.mapping;if(a===ar||a===cr)if(e.has(s)){let c=e.get(s).texture;return t(c,s.mapping)}else{let c=s.image;if(c&&c.height>0){let l=new Yo(c.height);return l.fromEquirectangularTexture(n,s),e.set(s,l),s.addEventListener("dispose",r),t(l.texture,s.mapping)}else return null}}return s}function r(s){let a=s.target;a.removeEventListener("dispose",r);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function o(){e=new WeakMap}return{get:i,dispose:o}}var Yn=class extends Hn{constructor(e=-1,t=1,i=1,r=-1,o=.1,s=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=o,this.far=s,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,o,s){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,o=i-e,s=i+e,a=r+t,c=r-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;o+=l*this.view.offsetX,s=o+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(o,s,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};var Zn=4,fu=[.125,.215,.35,.446,.526,.582],nn=20,ks=new Yn,pu=new Pe,Hs=null,Ws=0,Xs=0,qs=!1,tn=(1+Math.sqrt(5))/2,Kn=1/tn,du=[new C(-tn,Kn,0),new C(tn,Kn,0),new C(-Kn,0,tn),new C(Kn,0,tn),new C(0,tn,-Kn),new C(0,tn,Kn),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)],ki=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){Hs=this._renderer.getRenderTarget(),Ws=this._renderer.getActiveCubeFace(),Xs=this._renderer.getActiveMipmapLevel(),qs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,i,r,o),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_u(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Hs,Ws,Xs),this._renderer.xr.enabled=qs,e.scissorTest=!1,Jo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ei||e.mapping===ui?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Hs=this._renderer.getRenderTarget(),Ws=this._renderer.getActiveCubeFace(),Xs=this._renderer.getActiveMipmapLevel(),qs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:vt,minFilter:vt,generateMipmaps:!1,type:hi,format:dt,colorSpace:Dt,depthBuffer:!1},r=mu(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=mu(e,t,i);let{_lodMax:o}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=hp(o)),this._blurMaterial=fp(o,e,t)}return r}_compileMaterial(e){let t=new se(this._lodPlanes[0],e);this._renderer.compile(t,ks)}_sceneToCubeUV(e,t,i,r){let a=new ot(90,1,t,i),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,p=h.autoClear,d=h.toneMapping;h.getClearColor(pu),h.toneMapping=qt,h.autoClear=!1;let m=new ai({name:"PMREM.Background",side:et,depthWrite:!1,depthTest:!1}),g=new se(new tt,m),S=!1,f=e.background;f?f.isColor&&(m.color.copy(f),e.background=null,S=!0):(m.color.copy(pu),S=!0);for(let u=0;u<6;u++){let A=u%3;A===0?(a.up.set(0,c[u],0),a.lookAt(l[u],0,0)):A===1?(a.up.set(0,0,c[u]),a.lookAt(0,l[u],0)):(a.up.set(0,c[u],0),a.lookAt(0,0,l[u]));let E=this._cubeSize;Jo(r,A*E,u>2?E:0,E,E),h.setRenderTarget(r),S&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=p,e.background=f}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===ei||e.mapping===ui;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=gu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_u());let o=r?this._cubemapMaterial:this._equirectMaterial,s=new se(this._lodPlanes[0],o),a=o.uniforms;a.envMap.value=e;let c=this._cubeSize;Jo(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(s,ks)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let o=1;o<r;o++){let s=Math.sqrt(this._sigmas[o]*this._sigmas[o]-this._sigmas[o-1]*this._sigmas[o-1]),a=du[(r-o-1)%du.length];this._blur(e,o-1,o,s,a)}t.autoClear=i}_blur(e,t,i,r,o){let s=this._pingPongRenderTarget;this._halfBlur(e,s,t,i,r,"latitudinal",o),this._halfBlur(s,e,i,i,r,"longitudinal",o)}_halfBlur(e,t,i,r,o,s,a){let c=this._renderer,l=this._blurMaterial;s!=="latitudinal"&&s!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,p=new se(this._lodPlanes[r],l),d=l.uniforms,m=this._sizeLods[i]-1,g=isFinite(o)?Math.PI/(2*m):2*Math.PI/(2*nn-1),S=o/g,f=isFinite(o)?1+Math.floor(h*S):nn;f>nn&&console.warn(`sigmaRadians, ${o}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${nn}`);let u=[],A=0;for(let b=0;b<nn;++b){let D=b/S,z=Math.exp(-D*D/2);u.push(z),b===0?A+=z:b<f&&(A+=2*z)}for(let b=0;b<u.length;b++)u[b]=u[b]/A;d.envMap.value=e.texture,d.samples.value=f,d.weights.value=u,d.latitudinal.value=s==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:E}=this;d.dTheta.value=g,d.mipInt.value=E-i;let T=this._sizeLods[r],I=3*T*(r>E-Zn?r-E+Zn:0),R=4*(this._cubeSize-T);Jo(t,I,R,3*T,2*T),c.setRenderTarget(t),c.render(p,ks)}};function hp(n){let e=[],t=[],i=[],r=n,o=n-Zn+1+fu.length;for(let s=0;s<o;s++){let a=Math.pow(2,r);t.push(a);let c=1/a;s>n-Zn?c=fu[s-n+Zn-1]:s===0&&(c=0),i.push(c);let l=1/(a-2),h=-l,p=1+l,d=[h,h,p,h,p,p,h,h,p,p,h,p],m=6,g=6,S=3,f=2,u=1,A=new Float32Array(S*g*m),E=new Float32Array(f*g*m),T=new Float32Array(u*g*m);for(let R=0;R<m;R++){let b=R%3*2/3-1,D=R>2?0:-1,z=[b,D,0,b+2/3,D,0,b+2/3,D+1,0,b,D,0,b+2/3,D+1,0,b,D+1,0];A.set(z,S*g*R),E.set(d,f*g*R);let _=[R,R,R,R,R,R];T.set(_,u*g*R)}let I=new _t;I.setAttribute("position",new wt(A,S)),I.setAttribute("uv",new wt(E,f)),I.setAttribute("faceIndex",new wt(T,u)),e.push(I),r>Zn&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function mu(n,e,t){let i=new Nt(n,e,t);return i.texture.mapping=Pi,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Jo(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function fp(n,e,t){let i=new Float32Array(nn),r=new C(0,1,0);return new Ct({name:"SphericalGaussianBlur",defines:{n:nn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Xt,depthTest:!1,depthWrite:!1})}function _u(){return new Ct({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Xt,depthTest:!1,depthWrite:!1})}function gu(){return new Ct({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Xt,depthTest:!1,depthWrite:!1})}function Ys(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function xu(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let c=a.mapping,l=c===ar||c===cr,h=c===ei||c===ui;if(l||h){let p=e.get(a),d=p!==void 0?p.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new ki(n)),p=l?t.fromEquirectangular(a,p):t.fromCubemap(a,p),p.texture.pmremVersion=a.pmremVersion,e.set(a,p),p.texture;if(p!==void 0)return p.texture;{let m=a.image;return l&&m&&m.height>0||h&&m&&r(m)?(t===null&&(t=new ki(n)),p=l?t.fromEquirectangular(a):t.fromCubemap(a),p.texture.pmremVersion=a.pmremVersion,e.set(a,p),a.addEventListener("dispose",o),p.texture):null}}}return a}function r(a){let c=0,l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function o(a){let c=a.target;c.removeEventListener("dispose",o);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function s(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:s}}function Mu(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let r=t(i);return r===null&&bn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function vu(n,e,t,i){let r={},o=new WeakMap;function s(p){let d=p.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);for(let g in d.morphAttributes){let S=d.morphAttributes[g];for(let f=0,u=S.length;f<u;f++)e.remove(S[f])}d.removeEventListener("dispose",s),delete r[d.id];let m=o.get(d);m&&(e.remove(m),o.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(p,d){return r[d.id]===!0||(d.addEventListener("dispose",s),r[d.id]=!0,t.memory.geometries++),d}function c(p){let d=p.attributes;for(let g in d)e.update(d[g],n.ARRAY_BUFFER);let m=p.morphAttributes;for(let g in m){let S=m[g];for(let f=0,u=S.length;f<u;f++)e.update(S[f],n.ARRAY_BUFFER)}}function l(p){let d=[],m=p.index,g=p.attributes.position,S=0;if(m!==null){let A=m.array;S=m.version;for(let E=0,T=A.length;E<T;E+=3){let I=A[E+0],R=A[E+1],b=A[E+2];d.push(I,R,R,b,b,I)}}else if(g!==void 0){let A=g.array;S=g.version;for(let E=0,T=A.length/3-1;E<T;E+=3){let I=E+0,R=E+1,b=E+2;d.push(I,R,R,b,b,I)}}else return;let f=new(yo(d)?zn:Gn)(d,1);f.version=S;let u=o.get(p);u&&e.remove(u),o.set(p,f)}function h(p){let d=o.get(p);if(d){let m=p.index;m!==null&&d.version<m.version&&l(p)}else l(p);return o.get(p)}return{get:a,update:c,getWireframeAttribute:h}}function Su(n,e,t){let i;function r(d){i=d}let o,s;function a(d){o=d.type,s=d.bytesPerElement}function c(d,m){n.drawElements(i,m,o,d*s),t.update(m,i,1)}function l(d,m,g){g!==0&&(n.drawElementsInstanced(i,m,o,d*s,g),t.update(m,i,g))}function h(d,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,o,d,0,g);let f=0;for(let u=0;u<g;u++)f+=m[u];t.update(f,i,1)}function p(d,m,g,S){if(g===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let u=0;u<d.length;u++)l(d[u]/s,m[u],S[u]);else{f.multiDrawElementsInstancedWEBGL(i,m,0,o,d,0,S,0,g);let u=0;for(let A=0;A<g;A++)u+=m[A];for(let A=0;A<S.length;A++)t.update(u,i,S[A])}}this.setMode=r,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=p}function Eu(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(o,s,a){switch(t.calls++,s){case n.TRIANGLES:t.triangles+=a*(o/3);break;case n.LINES:t.lines+=a*(o/2);break;case n.LINE_STRIP:t.lines+=a*(o-1);break;case n.LINE_LOOP:t.lines+=a*o;break;case n.POINTS:t.points+=a*o;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",s);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function yu(n,e,t){let i=new WeakMap,r=new De;function o(s,a,c){let l=s.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,p=h!==void 0?h.length:0,d=i.get(a);if(d===void 0||d.count!==p){let z=function(){b.dispose(),i.delete(a),a.removeEventListener("dispose",z)};d!==void 0&&d.texture.dispose();let m=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,S=a.morphAttributes.color!==void 0,f=a.morphAttributes.position||[],u=a.morphAttributes.normal||[],A=a.morphAttributes.color||[],E=0;m===!0&&(E=1),g===!0&&(E=2),S===!0&&(E=3);let T=a.attributes.position.count*E,I=1;T>e.maxTextureSize&&(I=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);let R=new Float32Array(T*I*4*p),b=new Cn(R,T,I,p);b.type=bt,b.needsUpdate=!0;let D=E*4;for(let _=0;_<p;_++){let v=f[_],F=u[_],B=A[_],k=T*I*4*_;for(let Z=0;Z<v.count;Z++){let V=Z*D;m===!0&&(r.fromBufferAttribute(v,Z),R[k+V+0]=r.x,R[k+V+1]=r.y,R[k+V+2]=r.z,R[k+V+3]=0),g===!0&&(r.fromBufferAttribute(F,Z),R[k+V+4]=r.x,R[k+V+5]=r.y,R[k+V+6]=r.z,R[k+V+7]=0),S===!0&&(r.fromBufferAttribute(B,Z),R[k+V+8]=r.x,R[k+V+9]=r.y,R[k+V+10]=r.z,R[k+V+11]=B.itemSize===4?r.w:1)}}d={count:p,texture:b,size:new ve(T,I)},i.set(a,d),a.addEventListener("dispose",z)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",s.morphTexture,t);else{let m=0;for(let S=0;S<l.length;S++)m+=l[S];let g=a.morphTargetsRelative?1:1-m;c.getUniforms().setValue(n,"morphTargetBaseInfluence",g),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:o}}function Tu(n,e,t,i){let r=new WeakMap;function o(c){let l=i.render.frame,h=c.geometry,p=e.get(c,h);if(r.get(p)!==l&&(e.update(p),r.set(p,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),r.get(c)!==l&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,l))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==l&&(d.update(),r.set(d,l))}return p}function s(){r=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:o,dispose:s}}var jn=class extends ht{constructor(e,t,i,r,o,s,a,c,l,h=fi){if(h!==fi&&h!==pi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===fi&&(i=Vt),i===void 0&&h===pi&&(i=ni),super(null,r,o,s,a,c,h,i,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Mt,this.minFilter=c!==void 0?c:Mt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}};var Uu=new ht,Au=new jn(1,1),Du=new Cn,Iu=new Ro,Fu=new qn,bu=[],Ru=[],wu=new Float32Array(16),Cu=new Float32Array(9),Pu=new Float32Array(4);function Jn(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,o=bu[r];if(o===void 0&&(o=new Float32Array(r),bu[r]=o),e!==0){i.toArray(o,0);for(let s=1,a=0;s!==e;++s)a+=t,n[s].toArray(o,a)}return o}function ft(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function pt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function $o(n,e){let t=Ru[e];t===void 0&&(t=new Int32Array(e),Ru[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function pp(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function dp(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;n.uniform2fv(this.addr,e),pt(t,e)}}function mp(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ft(t,e))return;n.uniform3fv(this.addr,e),pt(t,e)}}function _p(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;n.uniform4fv(this.addr,e),pt(t,e)}}function gp(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,i))return;Pu.set(i),n.uniformMatrix2fv(this.addr,!1,Pu),pt(t,i)}}function xp(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,i))return;Cu.set(i),n.uniformMatrix3fv(this.addr,!1,Cu),pt(t,i)}}function Mp(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,i))return;wu.set(i),n.uniformMatrix4fv(this.addr,!1,wu),pt(t,i)}}function vp(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Sp(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;n.uniform2iv(this.addr,e),pt(t,e)}}function Ep(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;n.uniform3iv(this.addr,e),pt(t,e)}}function yp(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;n.uniform4iv(this.addr,e),pt(t,e)}}function Tp(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Ap(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;n.uniform2uiv(this.addr,e),pt(t,e)}}function bp(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;n.uniform3uiv(this.addr,e),pt(t,e)}}function Rp(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;n.uniform4uiv(this.addr,e),pt(t,e)}}function wp(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let o;this.type===n.SAMPLER_2D_SHADOW?(Au.compareFunction=vo,o=Au):o=Uu,t.setTexture2D(e||o,r)}function Cp(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||Iu,r)}function Pp(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Fu,r)}function Lp(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Du,r)}function Up(n){switch(n){case 5126:return pp;case 35664:return dp;case 35665:return mp;case 35666:return _p;case 35674:return gp;case 35675:return xp;case 35676:return Mp;case 5124:case 35670:return vp;case 35667:case 35671:return Sp;case 35668:case 35672:return Ep;case 35669:case 35673:return yp;case 5125:return Tp;case 36294:return Ap;case 36295:return bp;case 36296:return Rp;case 35678:case 36198:case 36298:case 36306:case 35682:return wp;case 35679:case 36299:case 36307:return Cp;case 35680:case 36300:case 36308:case 36293:return Pp;case 36289:case 36303:case 36311:case 36292:return Lp}}function Dp(n,e){n.uniform1fv(this.addr,e)}function Ip(n,e){let t=Jn(e,this.size,2);n.uniform2fv(this.addr,t)}function Fp(n,e){let t=Jn(e,this.size,3);n.uniform3fv(this.addr,t)}function Np(n,e){let t=Jn(e,this.size,4);n.uniform4fv(this.addr,t)}function Bp(n,e){let t=Jn(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Op(n,e){let t=Jn(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Gp(n,e){let t=Jn(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function zp(n,e){n.uniform1iv(this.addr,e)}function Vp(n,e){n.uniform2iv(this.addr,e)}function kp(n,e){n.uniform3iv(this.addr,e)}function Hp(n,e){n.uniform4iv(this.addr,e)}function Wp(n,e){n.uniform1uiv(this.addr,e)}function Xp(n,e){n.uniform2uiv(this.addr,e)}function qp(n,e){n.uniform3uiv(this.addr,e)}function Yp(n,e){n.uniform4uiv(this.addr,e)}function Kp(n,e,t){let i=this.cache,r=e.length,o=$o(t,r);ft(i,o)||(n.uniform1iv(this.addr,o),pt(i,o));for(let s=0;s!==r;++s)t.setTexture2D(e[s]||Uu,o[s])}function Zp(n,e,t){let i=this.cache,r=e.length,o=$o(t,r);ft(i,o)||(n.uniform1iv(this.addr,o),pt(i,o));for(let s=0;s!==r;++s)t.setTexture3D(e[s]||Iu,o[s])}function jp(n,e,t){let i=this.cache,r=e.length,o=$o(t,r);ft(i,o)||(n.uniform1iv(this.addr,o),pt(i,o));for(let s=0;s!==r;++s)t.setTextureCube(e[s]||Fu,o[s])}function Jp(n,e,t){let i=this.cache,r=e.length,o=$o(t,r);ft(i,o)||(n.uniform1iv(this.addr,o),pt(i,o));for(let s=0;s!==r;++s)t.setTexture2DArray(e[s]||Du,o[s])}function $p(n){switch(n){case 5126:return Dp;case 35664:return Ip;case 35665:return Fp;case 35666:return Np;case 35674:return Bp;case 35675:return Op;case 35676:return Gp;case 5124:case 35670:return zp;case 35667:case 35671:return Vp;case 35668:case 35672:return kp;case 35669:case 35673:return Hp;case 5125:return Wp;case 36294:return Xp;case 36295:return qp;case 36296:return Yp;case 35678:case 36198:case 36298:case 36306:case 35682:return Kp;case 35679:case 36299:case 36307:return Zp;case 35680:case 36300:case 36308:case 36293:return jp;case 36289:case 36303:case 36311:case 36292:return Jp}}var Zs=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Up(t.type)}},js=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$p(t.type)}},Js=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let o=0,s=r.length;o!==s;++o){let a=r[o];a.setValue(e,t[a.id],i)}}},Ks=/(\w+)(\])?(\[|\.)?/g;function Lu(n,e){n.seq.push(e),n.map[e.id]=e}function Qp(n,e,t){let i=n.name,r=i.length;for(Ks.lastIndex=0;;){let o=Ks.exec(i),s=Ks.lastIndex,a=o[1],c=o[2]==="]",l=o[3];if(c&&(a=a|0),l===void 0||l==="["&&s+2===r){Lu(t,l===void 0?new Zs(a,n,e):new js(a,n,e));break}else{let p=t.map[a];p===void 0&&(p=new Js(a),Lu(t,p)),t=p}}}var Hi=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=e.getActiveUniform(t,r),s=e.getUniformLocation(t,o.name);Qp(o,s,this)}}setValue(e,t,i,r){let o=this.map[t];o!==void 0&&o.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let o=0,s=t.length;o!==s;++o){let a=t[o],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,o=e.length;r!==o;++r){let s=e[r];s.id in t&&i.push(s)}return i}};function $s(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var ed=37297,td=0;function id(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),o=Math.min(e+6,t.length);for(let s=r;s<o;s++){let a=s+1;i.push(`${a===e?">":" "} ${a}: ${t[s]}`)}return i.join(`
`)}function nd(n){let e=Ue.getPrimaries(Ue.workingColorSpace),t=Ue.getPrimaries(n),i;switch(e===t?i="":e===yn&&t===En?i="LinearDisplayP3ToLinearSRGB":e===En&&t===yn&&(i="LinearSRGBToLinearDisplayP3"),n){case Dt:case Yi:return[i,"LinearTransferOETF"];case Ut:case vn:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function Nu(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let s=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+id(n.getShaderSource(e),s)}else return r}function rd(n,e){let t=nd(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function od(n,e){let t;switch(e){case Na:t="Linear";break;case Ba:t="Reinhard";break;case Oa:t="Cineon";break;case Ga:t="ACESFilmic";break;case Va:t="AgX";break;case ka:t="Neutral";break;case za:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Qo=new C;function sd(){Ue.getLuminanceCoefficients(Qo);let n=Qo.x.toFixed(4),e=Qo.y.toFixed(4),t=Qo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ad(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Wr).join(`
`)}function cd(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function ld(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let o=n.getActiveAttrib(e,r),s=o.name,a=1;o.type===n.FLOAT_MAT2&&(a=2),o.type===n.FLOAT_MAT3&&(a=3),o.type===n.FLOAT_MAT4&&(a=4),t[s]={type:o.type,location:n.getAttribLocation(e,s),locationSize:a}}return t}function Wr(n){return n!==""}function Bu(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ou(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var ud=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qs(n){return n.replace(ud,fd)}var hd=new Map;function fd(n,e){let t=st[e];if(t===void 0){let i=hd.get(e);if(i!==void 0)t=st[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Qs(t)}var pd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gu(n){return n.replace(pd,dd)}function dd(n,e,t,i){let r="";for(let o=parseInt(e);o<parseInt(t);o++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+o+" ]").replace(/UNROLLED_LOOP_INDEX/g,o);return r}function zu(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function md(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===$r?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===ma?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Qt&&(e="SHADOWMAP_TYPE_VSM"),e}function _d(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ei:case ui:e="ENVMAP_TYPE_CUBE";break;case Pi:e="ENVMAP_TYPE_CUBE_UV";break}return e}function gd(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case ui:e="ENVMAP_MODE_REFRACTION";break}return e}function xd(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case so:e="ENVMAP_BLENDING_MULTIPLY";break;case Ia:e="ENVMAP_BLENDING_MIX";break;case Fa:e="ENVMAP_BLENDING_ADD";break}return e}function Md(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function Vu(n,e,t,i){let r=n.getContext(),o=t.defines,s=t.vertexShader,a=t.fragmentShader,c=md(t),l=_d(t),h=gd(t),p=xd(t),d=Md(t),m=ad(t),g=cd(o),S=r.createProgram(),f,u,A=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Wr).join(`
`),f.length>0&&(f+=`
`),u=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Wr).join(`
`),u.length>0&&(u+=`
`)):(f=[zu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Wr).join(`
`),u=[zu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+p:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==qt?"#define TONE_MAPPING":"",t.toneMapping!==qt?st.tonemapping_pars_fragment:"",t.toneMapping!==qt?od("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",st.colorspace_pars_fragment,rd("linearToOutputTexel",t.outputColorSpace),sd(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Wr).join(`
`)),s=Qs(s),s=Bu(s,t),s=Ou(s,t),a=Qs(a),a=Bu(a,t),a=Ou(a,t),s=Gu(s),a=Gu(a),t.isRawShaderMaterial!==!0&&(A=`#version 300 es
`,f=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,u=["#define varying in",t.glslVersion===Ss?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ss?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+u);let E=A+f+s,T=A+u+a,I=$s(r,r.VERTEX_SHADER,E),R=$s(r,r.FRAGMENT_SHADER,T);r.attachShader(S,I),r.attachShader(S,R),t.index0AttributeName!==void 0?r.bindAttribLocation(S,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(S,0,"position"),r.linkProgram(S);function b(v){if(n.debug.checkShaderErrors){let F=r.getProgramInfoLog(S).trim(),B=r.getShaderInfoLog(I).trim(),k=r.getShaderInfoLog(R).trim(),Z=!0,V=!0;if(r.getProgramParameter(S,r.LINK_STATUS)===!1)if(Z=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,S,I,R);else{let Q=Nu(r,I,"vertex"),W=Nu(r,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(S,r.VALIDATE_STATUS)+`

Material Name: `+v.name+`
Material Type: `+v.type+`

Program Info Log: `+F+`
`+Q+`
`+W)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(B===""||k==="")&&(V=!1);V&&(v.diagnostics={runnable:Z,programLog:F,vertexShader:{log:B,prefix:f},fragmentShader:{log:k,prefix:u}})}r.deleteShader(I),r.deleteShader(R),D=new Hi(r,S),z=ld(r,S)}let D;this.getUniforms=function(){return D===void 0&&b(this),D};let z;this.getAttributes=function(){return z===void 0&&b(this),z};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=r.getProgramParameter(S,ed)),_},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(S),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=td++,this.cacheKey=e,this.usedTimes=1,this.program=S,this.vertexShader=I,this.fragmentShader=R,this}var vd=0,es=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),o=this._getShaderStage(i),s=this._getShaderCacheForMaterial(e);return s.has(r)===!1&&(s.add(r),r.usedTimes++),s.has(o)===!1&&(s.add(o),o.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new ea(e),t.set(e,i)),i}},ea=class{constructor(e){this.id=vd++,this.code=e,this.usedTimes=0}};function ku(n,e,t,i,r,o,s){let a=new In,c=new es,l=new Set,h=[],p=r.logarithmicDepthBuffer,d=r.reverseDepthBuffer,m=r.vertexTextures,g=r.precision,S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(_){return l.add(_),_===0?"uv":`uv${_}`}function u(_,v,F,B,k){let Z=B.fog,V=k.geometry,Q=_.isMeshStandardMaterial?B.environment:null,W=(_.isMeshStandardMaterial?t:e).get(_.envMap||Q),ae=W&&W.mapping===Pi?W.image.height:null,ce=S[_.type];_.precision!==null&&(g=r.getMaxPrecision(_.precision),g!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",g,"instead."));let _e=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,ke=_e!==void 0?_e.length:0,Ye=0;V.morphAttributes.position!==void 0&&(Ye=1),V.morphAttributes.normal!==void 0&&(Ye=2),V.morphAttributes.color!==void 0&&(Ye=3);let X,J,de,le;if(ce){let Lt=jt[ce];X=Lt.vertexShader,J=Lt.fragmentShader}else X=_.vertexShader,J=_.fragmentShader,c.update(_),de=c.getVertexShaderID(_),le=c.getFragmentShaderID(_);let we=n.getRenderTarget(),Ee=k.isInstancedMesh===!0,Ne=k.isBatchedMesh===!0,Ze=!!_.map,Be=!!_.matcap,w=!!W,Bt=!!_.aoMap,Ie=!!_.lightMap,ze=!!_.bumpMap,Te=!!_.normalMap,$e=!!_.displacementMap,Re=!!_.emissiveMap,y=!!_.metalnessMap,x=!!_.roughnessMap,N=_.anisotropy>0,Y=_.clearcoat>0,j=_.dispersion>0,q=_.iridescence>0,ge=_.sheen>0,te=_.transmission>0,ue=N&&!!_.anisotropyMap,Ve=Y&&!!_.clearcoatMap,$=Y&&!!_.clearcoatNormalMap,he=Y&&!!_.clearcoatRoughnessMap,Ae=q&&!!_.iridescenceMap,be=q&&!!_.iridescenceThicknessMap,fe=ge&&!!_.sheenColorMap,Fe=ge&&!!_.sheenRoughnessMap,Ce=!!_.specularMap,je=!!_.specularColorMap,P=!!_.specularIntensityMap,re=te&&!!_.transmissionMap,H=te&&!!_.thicknessMap,K=!!_.gradientMap,ie=!!_.alphaMap,oe=_.alphaTest>0,Oe=!!_.alphaHash,lt=!!_.extensions,Pt=qt;_.toneMapped&&(we===null||we.isXRRenderTarget===!0)&&(Pt=n.toneMapping);let He={shaderID:ce,shaderType:_.type,shaderName:_.name,vertexShader:X,fragmentShader:J,defines:_.defines,customVertexShaderID:de,customFragmentShaderID:le,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:g,batching:Ne,batchingColor:Ne&&k._colorsTexture!==null,instancing:Ee,instancingColor:Ee&&k.instanceColor!==null,instancingMorph:Ee&&k.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:we===null?n.outputColorSpace:we.isXRRenderTarget===!0?we.texture.colorSpace:Dt,alphaToCoverage:!!_.alphaToCoverage,map:Ze,matcap:Be,envMap:w,envMapMode:w&&W.mapping,envMapCubeUVHeight:ae,aoMap:Bt,lightMap:Ie,bumpMap:ze,normalMap:Te,displacementMap:m&&$e,emissiveMap:Re,normalMapObjectSpace:Te&&_.normalMapType===qa,normalMapTangentSpace:Te&&_.normalMapType===Mo,metalnessMap:y,roughnessMap:x,anisotropy:N,anisotropyMap:ue,clearcoat:Y,clearcoatMap:Ve,clearcoatNormalMap:$,clearcoatRoughnessMap:he,dispersion:j,iridescence:q,iridescenceMap:Ae,iridescenceThicknessMap:be,sheen:ge,sheenColorMap:fe,sheenRoughnessMap:Fe,specularMap:Ce,specularColorMap:je,specularIntensityMap:P,transmission:te,transmissionMap:re,thicknessMap:H,gradientMap:K,opaque:_.transparent===!1&&_.blending===xi&&_.alphaToCoverage===!1,alphaMap:ie,alphaTest:oe,alphaHash:Oe,combine:_.combine,mapUv:Ze&&f(_.map.channel),aoMapUv:Bt&&f(_.aoMap.channel),lightMapUv:Ie&&f(_.lightMap.channel),bumpMapUv:ze&&f(_.bumpMap.channel),normalMapUv:Te&&f(_.normalMap.channel),displacementMapUv:$e&&f(_.displacementMap.channel),emissiveMapUv:Re&&f(_.emissiveMap.channel),metalnessMapUv:y&&f(_.metalnessMap.channel),roughnessMapUv:x&&f(_.roughnessMap.channel),anisotropyMapUv:ue&&f(_.anisotropyMap.channel),clearcoatMapUv:Ve&&f(_.clearcoatMap.channel),clearcoatNormalMapUv:$&&f(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:he&&f(_.clearcoatRoughnessMap.channel),iridescenceMapUv:Ae&&f(_.iridescenceMap.channel),iridescenceThicknessMapUv:be&&f(_.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&f(_.sheenColorMap.channel),sheenRoughnessMapUv:Fe&&f(_.sheenRoughnessMap.channel),specularMapUv:Ce&&f(_.specularMap.channel),specularColorMapUv:je&&f(_.specularColorMap.channel),specularIntensityMapUv:P&&f(_.specularIntensityMap.channel),transmissionMapUv:re&&f(_.transmissionMap.channel),thicknessMapUv:H&&f(_.thicknessMap.channel),alphaMapUv:ie&&f(_.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(Te||N),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!V.attributes.uv&&(Ze||ie),fog:!!Z,useFog:_.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:d,skinning:k.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:ke,morphTextureStride:Ye,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:n.shadowMap.enabled&&F.length>0,shadowMapType:n.shadowMap.type,toneMapping:Pt,decodeVideoTexture:Ze&&_.map.isVideoTexture===!0&&Ue.getTransfer(_.map.colorSpace)===qe,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===At,flipSided:_.side===et,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:lt&&_.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(lt&&_.extensions.multiDraw===!0||Ne)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return He.vertexUv1s=l.has(1),He.vertexUv2s=l.has(2),He.vertexUv3s=l.has(3),l.clear(),He}function A(_){let v=[];if(_.shaderID?v.push(_.shaderID):(v.push(_.customVertexShaderID),v.push(_.customFragmentShaderID)),_.defines!==void 0)for(let F in _.defines)v.push(F),v.push(_.defines[F]);return _.isRawShaderMaterial===!1&&(E(v,_),T(v,_),v.push(n.outputColorSpace)),v.push(_.customProgramCacheKey),v.join()}function E(_,v){_.push(v.precision),_.push(v.outputColorSpace),_.push(v.envMapMode),_.push(v.envMapCubeUVHeight),_.push(v.mapUv),_.push(v.alphaMapUv),_.push(v.lightMapUv),_.push(v.aoMapUv),_.push(v.bumpMapUv),_.push(v.normalMapUv),_.push(v.displacementMapUv),_.push(v.emissiveMapUv),_.push(v.metalnessMapUv),_.push(v.roughnessMapUv),_.push(v.anisotropyMapUv),_.push(v.clearcoatMapUv),_.push(v.clearcoatNormalMapUv),_.push(v.clearcoatRoughnessMapUv),_.push(v.iridescenceMapUv),_.push(v.iridescenceThicknessMapUv),_.push(v.sheenColorMapUv),_.push(v.sheenRoughnessMapUv),_.push(v.specularMapUv),_.push(v.specularColorMapUv),_.push(v.specularIntensityMapUv),_.push(v.transmissionMapUv),_.push(v.thicknessMapUv),_.push(v.combine),_.push(v.fogExp2),_.push(v.sizeAttenuation),_.push(v.morphTargetsCount),_.push(v.morphAttributeCount),_.push(v.numDirLights),_.push(v.numPointLights),_.push(v.numSpotLights),_.push(v.numSpotLightMaps),_.push(v.numHemiLights),_.push(v.numRectAreaLights),_.push(v.numDirLightShadows),_.push(v.numPointLightShadows),_.push(v.numSpotLightShadows),_.push(v.numSpotLightShadowsWithMaps),_.push(v.numLightProbes),_.push(v.shadowMapType),_.push(v.toneMapping),_.push(v.numClippingPlanes),_.push(v.numClipIntersection),_.push(v.depthPacking)}function T(_,v){a.disableAll(),v.supportsVertexTextures&&a.enable(0),v.instancing&&a.enable(1),v.instancingColor&&a.enable(2),v.instancingMorph&&a.enable(3),v.matcap&&a.enable(4),v.envMap&&a.enable(5),v.normalMapObjectSpace&&a.enable(6),v.normalMapTangentSpace&&a.enable(7),v.clearcoat&&a.enable(8),v.iridescence&&a.enable(9),v.alphaTest&&a.enable(10),v.vertexColors&&a.enable(11),v.vertexAlphas&&a.enable(12),v.vertexUv1s&&a.enable(13),v.vertexUv2s&&a.enable(14),v.vertexUv3s&&a.enable(15),v.vertexTangents&&a.enable(16),v.anisotropy&&a.enable(17),v.alphaHash&&a.enable(18),v.batching&&a.enable(19),v.dispersion&&a.enable(20),v.batchingColor&&a.enable(21),_.push(a.mask),a.disableAll(),v.fog&&a.enable(0),v.useFog&&a.enable(1),v.flatShading&&a.enable(2),v.logarithmicDepthBuffer&&a.enable(3),v.reverseDepthBuffer&&a.enable(4),v.skinning&&a.enable(5),v.morphTargets&&a.enable(6),v.morphNormals&&a.enable(7),v.morphColors&&a.enable(8),v.premultipliedAlpha&&a.enable(9),v.shadowMapEnabled&&a.enable(10),v.doubleSided&&a.enable(11),v.flipSided&&a.enable(12),v.useDepthPacking&&a.enable(13),v.dithering&&a.enable(14),v.transmission&&a.enable(15),v.sheen&&a.enable(16),v.opaque&&a.enable(17),v.pointsUvs&&a.enable(18),v.decodeVideoTexture&&a.enable(19),v.alphaToCoverage&&a.enable(20),_.push(a.mask)}function I(_){let v=S[_.type],F;if(v){let B=jt[v];F=Ec.clone(B.uniforms)}else F=_.uniforms;return F}function R(_,v){let F;for(let B=0,k=h.length;B<k;B++){let Z=h[B];if(Z.cacheKey===v){F=Z,++F.usedTimes;break}}return F===void 0&&(F=new Vu(n,v,_,o),h.push(F)),F}function b(_){if(--_.usedTimes===0){let v=h.indexOf(_);h[v]=h[h.length-1],h.pop(),_.destroy()}}function D(_){c.remove(_)}function z(){c.dispose()}return{getParameters:u,getProgramCacheKey:A,getUniforms:I,acquireProgram:R,releaseProgram:b,releaseShaderCache:D,programs:h,dispose:z}}function Hu(){let n=new WeakMap;function e(s){return n.has(s)}function t(s){let a=n.get(s);return a===void 0&&(a={},n.set(s,a)),a}function i(s){n.delete(s)}function r(s,a,c){n.get(s)[a]=c}function o(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:o}}function Sd(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Wu(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Xu(){let n=[],e=0,t=[],i=[],r=[];function o(){e=0,t.length=0,i.length=0,r.length=0}function s(p,d,m,g,S,f){let u=n[e];return u===void 0?(u={id:p.id,object:p,geometry:d,material:m,groupOrder:g,renderOrder:p.renderOrder,z:S,group:f},n[e]=u):(u.id=p.id,u.object=p,u.geometry=d,u.material=m,u.groupOrder=g,u.renderOrder=p.renderOrder,u.z=S,u.group=f),e++,u}function a(p,d,m,g,S,f){let u=s(p,d,m,g,S,f);m.transmission>0?i.push(u):m.transparent===!0?r.push(u):t.push(u)}function c(p,d,m,g,S,f){let u=s(p,d,m,g,S,f);m.transmission>0?i.unshift(u):m.transparent===!0?r.unshift(u):t.unshift(u)}function l(p,d){t.length>1&&t.sort(p||Sd),i.length>1&&i.sort(d||Wu),r.length>1&&r.sort(d||Wu)}function h(){for(let p=e,d=n.length;p<d;p++){let m=n[p];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:r,init:o,push:a,unshift:c,finish:h,sort:l}}function qu(){let n=new WeakMap;function e(i,r){let o=n.get(i),s;return o===void 0?(s=new Xu,n.set(i,[s])):r>=o.length?(s=new Xu,o.push(s)):s=o[r],s}function t(){n=new WeakMap}return{get:e,dispose:t}}function Ed(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new Pe};break;case"SpotLight":t={position:new C,direction:new C,color:new Pe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new Pe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new Pe,groundColor:new Pe};break;case"RectAreaLight":t={color:new Pe,position:new C,halfWidth:new C,halfHeight:new C};break}return n[e.id]=t,t}}}function yd(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var Td=0;function Ad(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Yu(n){let e=new Ed,t=yd(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new C);let r=new C,o=new Ge,s=new Ge;function a(l){let h=0,p=0,d=0;for(let z=0;z<9;z++)i.probe[z].set(0,0,0);let m=0,g=0,S=0,f=0,u=0,A=0,E=0,T=0,I=0,R=0,b=0;l.sort(Ad);for(let z=0,_=l.length;z<_;z++){let v=l[z],F=v.color,B=v.intensity,k=v.distance,Z=v.shadow&&v.shadow.map?v.shadow.map.texture:null;if(v.isAmbientLight)h+=F.r*B,p+=F.g*B,d+=F.b*B;else if(v.isLightProbe){for(let V=0;V<9;V++)i.probe[V].addScaledVector(v.sh.coefficients[V],B);b++}else if(v.isDirectionalLight){let V=e.get(v);if(V.color.copy(v.color).multiplyScalar(v.intensity),v.castShadow){let Q=v.shadow,W=t.get(v);W.shadowIntensity=Q.intensity,W.shadowBias=Q.bias,W.shadowNormalBias=Q.normalBias,W.shadowRadius=Q.radius,W.shadowMapSize=Q.mapSize,i.directionalShadow[m]=W,i.directionalShadowMap[m]=Z,i.directionalShadowMatrix[m]=v.shadow.matrix,A++}i.directional[m]=V,m++}else if(v.isSpotLight){let V=e.get(v);V.position.setFromMatrixPosition(v.matrixWorld),V.color.copy(F).multiplyScalar(B),V.distance=k,V.coneCos=Math.cos(v.angle),V.penumbraCos=Math.cos(v.angle*(1-v.penumbra)),V.decay=v.decay,i.spot[S]=V;let Q=v.shadow;if(v.map&&(i.spotLightMap[I]=v.map,I++,Q.updateMatrices(v),v.castShadow&&R++),i.spotLightMatrix[S]=Q.matrix,v.castShadow){let W=t.get(v);W.shadowIntensity=Q.intensity,W.shadowBias=Q.bias,W.shadowNormalBias=Q.normalBias,W.shadowRadius=Q.radius,W.shadowMapSize=Q.mapSize,i.spotShadow[S]=W,i.spotShadowMap[S]=Z,T++}S++}else if(v.isRectAreaLight){let V=e.get(v);V.color.copy(F).multiplyScalar(B),V.halfWidth.set(v.width*.5,0,0),V.halfHeight.set(0,v.height*.5,0),i.rectArea[f]=V,f++}else if(v.isPointLight){let V=e.get(v);if(V.color.copy(v.color).multiplyScalar(v.intensity),V.distance=v.distance,V.decay=v.decay,v.castShadow){let Q=v.shadow,W=t.get(v);W.shadowIntensity=Q.intensity,W.shadowBias=Q.bias,W.shadowNormalBias=Q.normalBias,W.shadowRadius=Q.radius,W.shadowMapSize=Q.mapSize,W.shadowCameraNear=Q.camera.near,W.shadowCameraFar=Q.camera.far,i.pointShadow[g]=W,i.pointShadowMap[g]=Z,i.pointShadowMatrix[g]=v.shadow.matrix,E++}i.point[g]=V,g++}else if(v.isHemisphereLight){let V=e.get(v);V.skyColor.copy(v.color).multiplyScalar(B),V.groundColor.copy(v.groundColor).multiplyScalar(B),i.hemi[u]=V,u++}}f>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Je.LTC_FLOAT_1,i.rectAreaLTC2=Je.LTC_FLOAT_2):(i.rectAreaLTC1=Je.LTC_HALF_1,i.rectAreaLTC2=Je.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=p,i.ambient[2]=d;let D=i.hash;(D.directionalLength!==m||D.pointLength!==g||D.spotLength!==S||D.rectAreaLength!==f||D.hemiLength!==u||D.numDirectionalShadows!==A||D.numPointShadows!==E||D.numSpotShadows!==T||D.numSpotMaps!==I||D.numLightProbes!==b)&&(i.directional.length=m,i.spot.length=S,i.rectArea.length=f,i.point.length=g,i.hemi.length=u,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=T,i.spotShadowMap.length=T,i.directionalShadowMatrix.length=A,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=T+I-R,i.spotLightMap.length=I,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=b,D.directionalLength=m,D.pointLength=g,D.spotLength=S,D.rectAreaLength=f,D.hemiLength=u,D.numDirectionalShadows=A,D.numPointShadows=E,D.numSpotShadows=T,D.numSpotMaps=I,D.numLightProbes=b,i.version=Td++)}function c(l,h){let p=0,d=0,m=0,g=0,S=0,f=h.matrixWorldInverse;for(let u=0,A=l.length;u<A;u++){let E=l[u];if(E.isDirectionalLight){let T=i.directional[p];T.direction.setFromMatrixPosition(E.matrixWorld),r.setFromMatrixPosition(E.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(f),p++}else if(E.isSpotLight){let T=i.spot[m];T.position.setFromMatrixPosition(E.matrixWorld),T.position.applyMatrix4(f),T.direction.setFromMatrixPosition(E.matrixWorld),r.setFromMatrixPosition(E.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(f),m++}else if(E.isRectAreaLight){let T=i.rectArea[g];T.position.setFromMatrixPosition(E.matrixWorld),T.position.applyMatrix4(f),s.identity(),o.copy(E.matrixWorld),o.premultiply(f),s.extractRotation(o),T.halfWidth.set(E.width*.5,0,0),T.halfHeight.set(0,E.height*.5,0),T.halfWidth.applyMatrix4(s),T.halfHeight.applyMatrix4(s),g++}else if(E.isPointLight){let T=i.point[d];T.position.setFromMatrixPosition(E.matrixWorld),T.position.applyMatrix4(f),d++}else if(E.isHemisphereLight){let T=i.hemi[S];T.direction.setFromMatrixPosition(E.matrixWorld),T.direction.transformDirection(f),S++}}}return{setup:a,setupView:c,state:i}}function Ku(n){let e=new Yu(n),t=[],i=[];function r(h){l.camera=h,t.length=0,i.length=0}function o(h){t.push(h)}function s(h){i.push(h)}function a(){e.setup(t)}function c(h){e.setupView(t,h)}let l={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:l,setupLights:a,setupLightsView:c,pushLight:o,pushShadow:s}}function Zu(n){let e=new WeakMap;function t(r,o=0){let s=e.get(r),a;return s===void 0?(a=new Ku(n),e.set(r,[a])):o>=s.length?(a=new Ku(n),s.push(a)):a=s[o],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var ts=class extends Kt{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wa,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}};var is=class extends Kt{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};var ju=`
void main() {

	gl_Position = vec4( position, 1.0 );

}
`,Ju=`
uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;

#include <packing>

void main() {

	const float samples = float( VSM_SAMPLES );

	float mean = 0.0;
	float squared_mean = 0.0;

	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {

		float uvOffset = uvStart + i * uvStride;

		#ifdef HORIZONTAL_PASS

			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;

		#else

			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;

		#endif

	}

	mean = mean / samples;
	squared_mean = squared_mean / samples;

	float std_dev = sqrt( squared_mean - mean * mean );

	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );

}
`;function $u(n,e,t){let i=new zi,r=new ve,o=new ve,s=new De,a=new ts({depthPacking:Xa}),c=new is,l={},h=t.maxTextureSize,p={[zt]:et,[et]:zt,[At]:At},d=new Ct({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ve},radius:{value:4}},vertexShader:ju,fragmentShader:Ju}),m=d.clone();m.defines.HORIZONTAL_PASS=1;let g=new _t;g.setAttribute("position",new wt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let S=new se(g,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=$r;let u=this.type;this.render=function(R,b,D){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||R.length===0)return;let z=n.getRenderTarget(),_=n.getActiveCubeFace(),v=n.getActiveMipmapLevel(),F=n.state;F.setBlending(Xt),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let B=u!==Qt&&this.type===Qt,k=u===Qt&&this.type!==Qt;for(let Z=0,V=R.length;Z<V;Z++){let Q=R[Z],W=Q.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;r.copy(W.mapSize);let ae=W.getFrameExtents();if(r.multiply(ae),o.copy(W.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(o.x=Math.floor(h/ae.x),r.x=o.x*ae.x,W.mapSize.x=o.x),r.y>h&&(o.y=Math.floor(h/ae.y),r.y=o.y*ae.y,W.mapSize.y=o.y)),W.map===null||B===!0||k===!0){let _e=this.type!==Qt?{minFilter:Mt,magFilter:Mt}:{};W.map!==null&&W.map.dispose(),W.map=new Nt(r.x,r.y,_e),W.map.texture.name=Q.name+".shadowMap",W.camera.updateProjectionMatrix()}n.setRenderTarget(W.map),n.clear();let ce=W.getViewportCount();for(let _e=0;_e<ce;_e++){let ke=W.getViewport(_e);s.set(o.x*ke.x,o.y*ke.y,o.x*ke.z,o.y*ke.w),F.viewport(s),W.updateMatrices(Q,_e),i=W.getFrustum(),T(b,D,W.camera,Q,this.type)}W.isPointLightShadow!==!0&&this.type===Qt&&A(W,D),W.needsUpdate=!1}u=this.type,f.needsUpdate=!1,n.setRenderTarget(z,_,v)};function A(R,b){let D=e.update(S);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,m.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,m.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Nt(r.x,r.y)),d.uniforms.shadow_pass.value=R.map.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,n.setRenderTarget(R.mapPass),n.clear(),n.renderBufferDirect(b,null,D,d,S,null),m.uniforms.shadow_pass.value=R.mapPass.texture,m.uniforms.resolution.value=R.mapSize,m.uniforms.radius.value=R.radius,n.setRenderTarget(R.map),n.clear(),n.renderBufferDirect(b,null,D,m,S,null)}function E(R,b,D,z){let _=null,v=D.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(v!==void 0)_=v;else if(_=D.isPointLight===!0?c:a,n.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0){let F=_.uuid,B=b.uuid,k=l[F];k===void 0&&(k={},l[F]=k);let Z=k[B];Z===void 0&&(Z=_.clone(),k[B]=Z,b.addEventListener("dispose",I)),_=Z}if(_.visible=b.visible,_.wireframe=b.wireframe,z===Qt?_.side=b.shadowSide!==null?b.shadowSide:b.side:_.side=b.shadowSide!==null?b.shadowSide:p[b.side],_.alphaMap=b.alphaMap,_.alphaTest=b.alphaTest,_.map=b.map,_.clipShadows=b.clipShadows,_.clippingPlanes=b.clippingPlanes,_.clipIntersection=b.clipIntersection,_.displacementMap=b.displacementMap,_.displacementScale=b.displacementScale,_.displacementBias=b.displacementBias,_.wireframeLinewidth=b.wireframeLinewidth,_.linewidth=b.linewidth,D.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let F=n.properties.get(_);F.light=D}return _}function T(R,b,D,z,_){if(R.visible===!1)return;if(R.layers.test(b.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&_===Qt)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,R.matrixWorld);let B=e.update(R),k=R.material;if(Array.isArray(k)){let Z=B.groups;for(let V=0,Q=Z.length;V<Q;V++){let W=Z[V],ae=k[W.materialIndex];if(ae&&ae.visible){let ce=E(R,ae,z,_);R.onBeforeShadow(n,R,b,D,B,ce,W),n.renderBufferDirect(D,null,B,ce,R,W),R.onAfterShadow(n,R,b,D,B,ce,W)}}}else if(k.visible){let Z=E(R,k,z,_);R.onBeforeShadow(n,R,b,D,B,Z,null),n.renderBufferDirect(D,null,B,Z,R,null),R.onAfterShadow(n,R,b,D,B,Z,null)}}let F=R.children;for(let B=0,k=F.length;B<k;B++)T(F[B],b,D,z,_)}function I(R){R.target.removeEventListener("dispose",I);for(let D in l){let z=l[D],_=R.target.uuid;_ in z&&(z[_].dispose(),delete z[_])}}}var Rd={[Qr]:eo,[to]:ro,[io]:oo,[Ci]:no,[eo]:Qr,[ro]:to,[oo]:io,[no]:Ci};function Qu(n){function e(){let P=!1,re=new De,H=null,K=new De(0,0,0,0);return{setMask:function(ie){H!==ie&&!P&&(n.colorMask(ie,ie,ie,ie),H=ie)},setLocked:function(ie){P=ie},setClear:function(ie,oe,Oe,lt,Pt){Pt===!0&&(ie*=lt,oe*=lt,Oe*=lt),re.set(ie,oe,Oe,lt),K.equals(re)===!1&&(n.clearColor(ie,oe,Oe,lt),K.copy(re))},reset:function(){P=!1,H=null,K.set(-1,0,0,0)}}}function t(){let P=!1,re=!1,H=null,K=null,ie=null;return{setReversed:function(oe){re=oe},setTest:function(oe){oe?de(n.DEPTH_TEST):le(n.DEPTH_TEST)},setMask:function(oe){H!==oe&&!P&&(n.depthMask(oe),H=oe)},setFunc:function(oe){if(re&&(oe=Rd[oe]),K!==oe){switch(oe){case Qr:n.depthFunc(n.NEVER);break;case eo:n.depthFunc(n.ALWAYS);break;case to:n.depthFunc(n.LESS);break;case Ci:n.depthFunc(n.LEQUAL);break;case io:n.depthFunc(n.EQUAL);break;case no:n.depthFunc(n.GEQUAL);break;case ro:n.depthFunc(n.GREATER);break;case oo:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}K=oe}},setLocked:function(oe){P=oe},setClear:function(oe){ie!==oe&&(n.clearDepth(oe),ie=oe)},reset:function(){P=!1,H=null,K=null,ie=null}}}function i(){let P=!1,re=null,H=null,K=null,ie=null,oe=null,Oe=null,lt=null,Pt=null;return{setTest:function(He){P||(He?de(n.STENCIL_TEST):le(n.STENCIL_TEST))},setMask:function(He){re!==He&&!P&&(n.stencilMask(He),re=He)},setFunc:function(He,Lt,gi){(H!==He||K!==Lt||ie!==gi)&&(n.stencilFunc(He,Lt,gi),H=He,K=Lt,ie=gi)},setOp:function(He,Lt,gi){(oe!==He||Oe!==Lt||lt!==gi)&&(n.stencilOp(He,Lt,gi),oe=He,Oe=Lt,lt=gi)},setLocked:function(He){P=He},setClear:function(He){Pt!==He&&(n.clearStencil(He),Pt=He)},reset:function(){P=!1,re=null,H=null,K=null,ie=null,oe=null,Oe=null,lt=null,Pt=null}}}let r=new e,o=new t,s=new i,a=new WeakMap,c=new WeakMap,l={},h={},p=new WeakMap,d=[],m=null,g=!1,S=null,f=null,u=null,A=null,E=null,T=null,I=null,R=new Pe(0,0,0),b=0,D=!1,z=null,_=null,v=null,F=null,B=null,k=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,V=0,Q=n.getParameter(n.VERSION);Q.indexOf("WebGL")!==-1?(V=parseFloat(/^WebGL (\d)/.exec(Q)[1]),Z=V>=1):Q.indexOf("OpenGL ES")!==-1&&(V=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),Z=V>=2);let W=null,ae={},ce=n.getParameter(n.SCISSOR_BOX),_e=n.getParameter(n.VIEWPORT),ke=new De().fromArray(ce),Ye=new De().fromArray(_e);function X(P,re,H,K){let ie=new Uint8Array(4),oe=n.createTexture();n.bindTexture(P,oe),n.texParameteri(P,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(P,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Oe=0;Oe<H;Oe++)P===n.TEXTURE_3D||P===n.TEXTURE_2D_ARRAY?n.texImage3D(re,0,n.RGBA,1,1,K,0,n.RGBA,n.UNSIGNED_BYTE,ie):n.texImage2D(re+Oe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ie);return oe}let J={};J[n.TEXTURE_2D]=X(n.TEXTURE_2D,n.TEXTURE_2D,1),J[n.TEXTURE_CUBE_MAP]=X(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[n.TEXTURE_2D_ARRAY]=X(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),J[n.TEXTURE_3D]=X(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),s.setClear(0),de(n.DEPTH_TEST),o.setFunc(Ci),Ie(!1),ze(ds),de(n.CULL_FACE),w(Xt);function de(P){l[P]!==!0&&(n.enable(P),l[P]=!0)}function le(P){l[P]!==!1&&(n.disable(P),l[P]=!1)}function we(P,re){return h[P]!==re?(n.bindFramebuffer(P,re),h[P]=re,P===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=re),P===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=re),!0):!1}function Ee(P,re){let H=d,K=!1;if(P){H=p.get(re),H===void 0&&(H=[],p.set(re,H));let ie=P.textures;if(H.length!==ie.length||H[0]!==n.COLOR_ATTACHMENT0){for(let oe=0,Oe=ie.length;oe<Oe;oe++)H[oe]=n.COLOR_ATTACHMENT0+oe;H.length=ie.length,K=!0}}else H[0]!==n.BACK&&(H[0]=n.BACK,K=!0);K&&n.drawBuffers(H)}function Ne(P){return m!==P?(n.useProgram(P),m=P,!0):!1}let Ze={[Mi]:n.FUNC_ADD,[ga]:n.FUNC_SUBTRACT,[xa]:n.FUNC_REVERSE_SUBTRACT};Ze[Ma]=n.MIN,Ze[va]=n.MAX;let Be={[Sa]:n.ZERO,[Ea]:n.ONE,[ya]:n.SRC_COLOR,[or]:n.SRC_ALPHA,[Ca]:n.SRC_ALPHA_SATURATE,[Ra]:n.DST_COLOR,[Aa]:n.DST_ALPHA,[Ta]:n.ONE_MINUS_SRC_COLOR,[sr]:n.ONE_MINUS_SRC_ALPHA,[wa]:n.ONE_MINUS_DST_COLOR,[ba]:n.ONE_MINUS_DST_ALPHA,[Pa]:n.CONSTANT_COLOR,[La]:n.ONE_MINUS_CONSTANT_COLOR,[Ua]:n.CONSTANT_ALPHA,[Da]:n.ONE_MINUS_CONSTANT_ALPHA};function w(P,re,H,K,ie,oe,Oe,lt,Pt,He){if(P===Xt){g===!0&&(le(n.BLEND),g=!1);return}if(g===!1&&(de(n.BLEND),g=!0),P!==_a){if(P!==S||He!==D){if((f!==Mi||E!==Mi)&&(n.blendEquation(n.FUNC_ADD),f=Mi,E=Mi),He)switch(P){case xi:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ms:n.blendFunc(n.ONE,n.ONE);break;case _s:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case gs:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}else switch(P){case xi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ms:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case _s:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case gs:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}u=null,A=null,T=null,I=null,R.set(0,0,0),b=0,S=P,D=He}return}ie=ie||re,oe=oe||H,Oe=Oe||K,(re!==f||ie!==E)&&(n.blendEquationSeparate(Ze[re],Ze[ie]),f=re,E=ie),(H!==u||K!==A||oe!==T||Oe!==I)&&(n.blendFuncSeparate(Be[H],Be[K],Be[oe],Be[Oe]),u=H,A=K,T=oe,I=Oe),(lt.equals(R)===!1||Pt!==b)&&(n.blendColor(lt.r,lt.g,lt.b,Pt),R.copy(lt),b=Pt),S=P,D=!1}function Bt(P,re){P.side===At?le(n.CULL_FACE):de(n.CULL_FACE);let H=P.side===et;re&&(H=!H),Ie(H),P.blending===xi&&P.transparent===!1?w(Xt):w(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),o.setFunc(P.depthFunc),o.setTest(P.depthTest),o.setMask(P.depthWrite),r.setMask(P.colorWrite);let K=P.stencilWrite;s.setTest(K),K&&(s.setMask(P.stencilWriteMask),s.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),s.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),$e(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?de(n.SAMPLE_ALPHA_TO_COVERAGE):le(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(P){z!==P&&(P?n.frontFace(n.CW):n.frontFace(n.CCW),z=P)}function ze(P){P!==pa?(de(n.CULL_FACE),P!==_&&(P===ds?n.cullFace(n.BACK):P===da?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):le(n.CULL_FACE),_=P}function Te(P){P!==v&&(Z&&n.lineWidth(P),v=P)}function $e(P,re,H){P?(de(n.POLYGON_OFFSET_FILL),(F!==re||B!==H)&&(n.polygonOffset(re,H),F=re,B=H)):le(n.POLYGON_OFFSET_FILL)}function Re(P){P?de(n.SCISSOR_TEST):le(n.SCISSOR_TEST)}function y(P){P===void 0&&(P=n.TEXTURE0+k-1),W!==P&&(n.activeTexture(P),W=P)}function x(P,re,H){H===void 0&&(W===null?H=n.TEXTURE0+k-1:H=W);let K=ae[H];K===void 0&&(K={type:void 0,texture:void 0},ae[H]=K),(K.type!==P||K.texture!==re)&&(W!==H&&(n.activeTexture(H),W=H),n.bindTexture(P,re||J[P]),K.type=P,K.texture=re)}function N(){let P=ae[W];P!==void 0&&P.type!==void 0&&(n.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function Y(){try{n.compressedTexImage2D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function j(){try{n.compressedTexImage3D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function q(){try{n.texSubImage2D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ge(){try{n.texSubImage3D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function te(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ue(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Ve(){try{n.texStorage2D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function $(){try{n.texStorage3D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function he(){try{n.texImage2D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Ae(){try{n.texImage3D.apply(n,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function be(P){ke.equals(P)===!1&&(n.scissor(P.x,P.y,P.z,P.w),ke.copy(P))}function fe(P){Ye.equals(P)===!1&&(n.viewport(P.x,P.y,P.z,P.w),Ye.copy(P))}function Fe(P,re){let H=c.get(re);H===void 0&&(H=new WeakMap,c.set(re,H));let K=H.get(P);K===void 0&&(K=n.getUniformBlockIndex(re,P.name),H.set(P,K))}function Ce(P,re){let K=c.get(re).get(P);a.get(re)!==K&&(n.uniformBlockBinding(re,K,P.__bindingPointIndex),a.set(re,K))}function je(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),l={},W=null,ae={},h={},p=new WeakMap,d=[],m=null,g=!1,S=null,f=null,u=null,A=null,E=null,T=null,I=null,R=new Pe(0,0,0),b=0,D=!1,z=null,_=null,v=null,F=null,B=null,ke.set(0,0,n.canvas.width,n.canvas.height),Ye.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),s.reset()}return{buffers:{color:r,depth:o,stencil:s},enable:de,disable:le,bindFramebuffer:we,drawBuffers:Ee,useProgram:Ne,setBlending:w,setMaterial:Bt,setFlipSided:Ie,setCullFace:ze,setLineWidth:Te,setPolygonOffset:$e,setScissorTest:Re,activeTexture:y,bindTexture:x,unbindTexture:N,compressedTexImage2D:Y,compressedTexImage3D:j,texImage2D:he,texImage3D:Ae,updateUBOMapping:Fe,uniformBlockBinding:Ce,texStorage2D:Ve,texStorage3D:$,texSubImage2D:q,texSubImage3D:ge,compressedTexSubImage2D:te,compressedTexSubImage3D:ue,scissor:be,viewport:fe,reset:je}}function ta(n,e,t,i){let r=wd(i);switch(t){case ho:return n*e;case po:return n*e;case mo:return n*e*2;case _o:return n*e/r.components*r.byteLength;case fn:return n*e/r.components*r.byteLength;case go:return n*e*2/r.components*r.byteLength;case pn:return n*e*2/r.components*r.byteLength;case fo:return n*e*3/r.components*r.byteLength;case dt:return n*e*4/r.components*r.byteLength;case dn:return n*e*4/r.components*r.byteLength;case mn:case _n:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case gn:case xn:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case pr:case mr:return Math.max(n,16)*Math.max(e,8)/4;case fr:case dr:return Math.max(n,8)*Math.max(e,8)/2;case _r:case gr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case xr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Mr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case vr:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Sr:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Er:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case yr:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Tr:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Ar:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case br:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Rr:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case wr:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Cr:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Pr:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Lr:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Ur:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Mn:case Dr:case Ir:return Math.ceil(n/4)*Math.ceil(e/4)*16;case xo:case Fr:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Nr:case Br:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function wd(n){switch(n){case St:case co:return{byteLength:1,components:1};case vi:case lo:case hi:return{byteLength:2,components:1};case un:case hn:return{byteLength:2,components:4};case Vt:case ln:case bt:return{byteLength:4,components:1};case uo:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function eh(n,e,t,i,r,o,s){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ve,h=new WeakMap,p,d=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(y,x){return m?new OffscreenCanvas(y,x):An("canvas")}function S(y,x,N){let Y=1,j=Re(y);if((j.width>N||j.height>N)&&(Y=N/Math.max(j.width,j.height)),Y<1)if(typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&y instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&y instanceof ImageBitmap||typeof VideoFrame<"u"&&y instanceof VideoFrame){let q=Math.floor(Y*j.width),ge=Math.floor(Y*j.height);p===void 0&&(p=g(q,ge));let te=x?g(q,ge):p;return te.width=q,te.height=ge,te.getContext("2d").drawImage(y,0,0,q,ge),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+q+"x"+ge+")."),te}else return"data"in y&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),y;return y}function f(y){return y.generateMipmaps&&y.minFilter!==Mt&&y.minFilter!==vt}function u(y){n.generateMipmap(y)}function A(y,x,N,Y,j=!1){if(y!==null){if(n[y]!==void 0)return n[y];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+y+"'")}let q=x;if(x===n.RED&&(N===n.FLOAT&&(q=n.R32F),N===n.HALF_FLOAT&&(q=n.R16F),N===n.UNSIGNED_BYTE&&(q=n.R8)),x===n.RED_INTEGER&&(N===n.UNSIGNED_BYTE&&(q=n.R8UI),N===n.UNSIGNED_SHORT&&(q=n.R16UI),N===n.UNSIGNED_INT&&(q=n.R32UI),N===n.BYTE&&(q=n.R8I),N===n.SHORT&&(q=n.R16I),N===n.INT&&(q=n.R32I)),x===n.RG&&(N===n.FLOAT&&(q=n.RG32F),N===n.HALF_FLOAT&&(q=n.RG16F),N===n.UNSIGNED_BYTE&&(q=n.RG8)),x===n.RG_INTEGER&&(N===n.UNSIGNED_BYTE&&(q=n.RG8UI),N===n.UNSIGNED_SHORT&&(q=n.RG16UI),N===n.UNSIGNED_INT&&(q=n.RG32UI),N===n.BYTE&&(q=n.RG8I),N===n.SHORT&&(q=n.RG16I),N===n.INT&&(q=n.RG32I)),x===n.RGB_INTEGER&&(N===n.UNSIGNED_BYTE&&(q=n.RGB8UI),N===n.UNSIGNED_SHORT&&(q=n.RGB16UI),N===n.UNSIGNED_INT&&(q=n.RGB32UI),N===n.BYTE&&(q=n.RGB8I),N===n.SHORT&&(q=n.RGB16I),N===n.INT&&(q=n.RGB32I)),x===n.RGBA_INTEGER&&(N===n.UNSIGNED_BYTE&&(q=n.RGBA8UI),N===n.UNSIGNED_SHORT&&(q=n.RGBA16UI),N===n.UNSIGNED_INT&&(q=n.RGBA32UI),N===n.BYTE&&(q=n.RGBA8I),N===n.SHORT&&(q=n.RGBA16I),N===n.INT&&(q=n.RGBA32I)),x===n.RGB&&N===n.UNSIGNED_INT_5_9_9_9_REV&&(q=n.RGB9_E5),x===n.RGBA){let ge=j?Sn:Ue.getTransfer(Y);N===n.FLOAT&&(q=n.RGBA32F),N===n.HALF_FLOAT&&(q=n.RGBA16F),N===n.UNSIGNED_BYTE&&(q=ge===qe?n.SRGB8_ALPHA8:n.RGBA8),N===n.UNSIGNED_SHORT_4_4_4_4&&(q=n.RGBA4),N===n.UNSIGNED_SHORT_5_5_5_1&&(q=n.RGB5_A1)}return(q===n.R16F||q===n.R32F||q===n.RG16F||q===n.RG32F||q===n.RGBA16F||q===n.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function E(y,x){let N;return y?x===null||x===Vt||x===ni?N=n.DEPTH24_STENCIL8:x===bt?N=n.DEPTH32F_STENCIL8:x===vi&&(N=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Vt||x===ni?N=n.DEPTH_COMPONENT24:x===bt?N=n.DEPTH_COMPONENT32F:x===vi&&(N=n.DEPTH_COMPONENT16),N}function T(y,x){return f(y)===!0||y.isFramebufferTexture&&y.minFilter!==Mt&&y.minFilter!==vt?Math.log2(Math.max(x.width,x.height))+1:y.mipmaps!==void 0&&y.mipmaps.length>0?y.mipmaps.length:y.isCompressedTexture&&Array.isArray(y.image)?x.mipmaps.length:1}function I(y){let x=y.target;x.removeEventListener("dispose",I),b(x),x.isVideoTexture&&h.delete(x)}function R(y){let x=y.target;x.removeEventListener("dispose",R),z(x)}function b(y){let x=i.get(y);if(x.__webglInit===void 0)return;let N=y.source,Y=d.get(N);if(Y){let j=Y[x.__cacheKey];j.usedTimes--,j.usedTimes===0&&D(y),Object.keys(Y).length===0&&d.delete(N)}i.remove(y)}function D(y){let x=i.get(y);n.deleteTexture(x.__webglTexture);let N=y.source,Y=d.get(N);delete Y[x.__cacheKey],s.memory.textures--}function z(y){let x=i.get(y);if(y.depthTexture&&y.depthTexture.dispose(),y.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(x.__webglFramebuffer[Y]))for(let j=0;j<x.__webglFramebuffer[Y].length;j++)n.deleteFramebuffer(x.__webglFramebuffer[Y][j]);else n.deleteFramebuffer(x.__webglFramebuffer[Y]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[Y])}else{if(Array.isArray(x.__webglFramebuffer))for(let Y=0;Y<x.__webglFramebuffer.length;Y++)n.deleteFramebuffer(x.__webglFramebuffer[Y]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let Y=0;Y<x.__webglColorRenderbuffer.length;Y++)x.__webglColorRenderbuffer[Y]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[Y]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let N=y.textures;for(let Y=0,j=N.length;Y<j;Y++){let q=i.get(N[Y]);q.__webglTexture&&(n.deleteTexture(q.__webglTexture),s.memory.textures--),i.remove(N[Y])}i.remove(y)}let _=0;function v(){_=0}function F(){let y=_;return y>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+y+" texture units while this GPU supports only "+r.maxTextures),_+=1,y}function B(y){let x=[];return x.push(y.wrapS),x.push(y.wrapT),x.push(y.wrapR||0),x.push(y.magFilter),x.push(y.minFilter),x.push(y.anisotropy),x.push(y.internalFormat),x.push(y.format),x.push(y.type),x.push(y.generateMipmaps),x.push(y.premultiplyAlpha),x.push(y.flipY),x.push(y.unpackAlignment),x.push(y.colorSpace),x.join()}function k(y,x){let N=i.get(y);if(y.isVideoTexture&&Te(y),y.isRenderTargetTexture===!1&&y.version>0&&N.__version!==y.version){let Y=y.image;if(Y===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Ye(N,y,x);return}}t.bindTexture(n.TEXTURE_2D,N.__webglTexture,n.TEXTURE0+x)}function Z(y,x){let N=i.get(y);if(y.version>0&&N.__version!==y.version){Ye(N,y,x);return}t.bindTexture(n.TEXTURE_2D_ARRAY,N.__webglTexture,n.TEXTURE0+x)}function V(y,x){let N=i.get(y);if(y.version>0&&N.__version!==y.version){Ye(N,y,x);return}t.bindTexture(n.TEXTURE_3D,N.__webglTexture,n.TEXTURE0+x)}function Q(y,x){let N=i.get(y);if(y.version>0&&N.__version!==y.version){X(N,y,x);return}t.bindTexture(n.TEXTURE_CUBE_MAP,N.__webglTexture,n.TEXTURE0+x)}let W={[lr]:n.REPEAT,[ti]:n.CLAMP_TO_EDGE,[ur]:n.MIRRORED_REPEAT},ae={[Mt]:n.NEAREST,[Ha]:n.NEAREST_MIPMAP_NEAREST,[hr]:n.NEAREST_MIPMAP_LINEAR,[vt]:n.LINEAR,[ao]:n.LINEAR_MIPMAP_NEAREST,[ii]:n.LINEAR_MIPMAP_LINEAR},ce={[Ya]:n.NEVER,[Qa]:n.ALWAYS,[Ka]:n.LESS,[vo]:n.LEQUAL,[Za]:n.EQUAL,[$a]:n.GEQUAL,[ja]:n.GREATER,[Ja]:n.NOTEQUAL};function _e(y,x){if(x.type===bt&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===vt||x.magFilter===ao||x.magFilter===hr||x.magFilter===ii||x.minFilter===vt||x.minFilter===ao||x.minFilter===hr||x.minFilter===ii)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(y,n.TEXTURE_WRAP_S,W[x.wrapS]),n.texParameteri(y,n.TEXTURE_WRAP_T,W[x.wrapT]),(y===n.TEXTURE_3D||y===n.TEXTURE_2D_ARRAY)&&n.texParameteri(y,n.TEXTURE_WRAP_R,W[x.wrapR]),n.texParameteri(y,n.TEXTURE_MAG_FILTER,ae[x.magFilter]),n.texParameteri(y,n.TEXTURE_MIN_FILTER,ae[x.minFilter]),x.compareFunction&&(n.texParameteri(y,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(y,n.TEXTURE_COMPARE_FUNC,ce[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Mt||x.minFilter!==hr&&x.minFilter!==ii||x.type===bt&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){let N=e.get("EXT_texture_filter_anisotropic");n.texParameterf(y,N.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function ke(y,x){let N=!1;y.__webglInit===void 0&&(y.__webglInit=!0,x.addEventListener("dispose",I));let Y=x.source,j=d.get(Y);j===void 0&&(j={},d.set(Y,j));let q=B(x);if(q!==y.__cacheKey){j[q]===void 0&&(j[q]={texture:n.createTexture(),usedTimes:0},s.memory.textures++,N=!0),j[q].usedTimes++;let ge=j[y.__cacheKey];ge!==void 0&&(j[y.__cacheKey].usedTimes--,ge.usedTimes===0&&D(x)),y.__cacheKey=q,y.__webglTexture=j[q].texture}return N}function Ye(y,x,N){let Y=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(Y=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(Y=n.TEXTURE_3D);let j=ke(y,x),q=x.source;t.bindTexture(Y,y.__webglTexture,n.TEXTURE0+N);let ge=i.get(q);if(q.version!==ge.__version||j===!0){t.activeTexture(n.TEXTURE0+N);let te=Ue.getPrimaries(Ue.workingColorSpace),ue=x.colorSpace===Yt?null:Ue.getPrimaries(x.colorSpace),Ve=x.colorSpace===Yt||te===ue?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ve);let $=S(x.image,!1,r.maxTextureSize);$=$e(x,$);let he=o.convert(x.format,x.colorSpace),Ae=o.convert(x.type),be=A(x.internalFormat,he,Ae,x.colorSpace,x.isVideoTexture);_e(Y,x);let fe,Fe=x.mipmaps,Ce=x.isVideoTexture!==!0,je=ge.__version===void 0||j===!0,P=q.dataReady,re=T(x,$);if(x.isDepthTexture)be=E(x.format===pi,x.type),je&&(Ce?t.texStorage2D(n.TEXTURE_2D,1,be,$.width,$.height):t.texImage2D(n.TEXTURE_2D,0,be,$.width,$.height,0,he,Ae,null));else if(x.isDataTexture)if(Fe.length>0){Ce&&je&&t.texStorage2D(n.TEXTURE_2D,re,be,Fe[0].width,Fe[0].height);for(let H=0,K=Fe.length;H<K;H++)fe=Fe[H],Ce?P&&t.texSubImage2D(n.TEXTURE_2D,H,0,0,fe.width,fe.height,he,Ae,fe.data):t.texImage2D(n.TEXTURE_2D,H,be,fe.width,fe.height,0,he,Ae,fe.data);x.generateMipmaps=!1}else Ce?(je&&t.texStorage2D(n.TEXTURE_2D,re,be,$.width,$.height),P&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,$.width,$.height,he,Ae,$.data)):t.texImage2D(n.TEXTURE_2D,0,be,$.width,$.height,0,he,Ae,$.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Ce&&je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,re,be,Fe[0].width,Fe[0].height,$.depth);for(let H=0,K=Fe.length;H<K;H++)if(fe=Fe[H],x.format!==dt)if(he!==null)if(Ce){if(P)if(x.layerUpdates.size>0){let ie=ta(fe.width,fe.height,x.format,x.type);for(let oe of x.layerUpdates){let Oe=fe.data.subarray(oe*ie/fe.data.BYTES_PER_ELEMENT,(oe+1)*ie/fe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,H,0,0,oe,fe.width,fe.height,1,he,Oe,0,0)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,H,0,0,0,fe.width,fe.height,$.depth,he,fe.data,0,0)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,H,be,fe.width,fe.height,$.depth,0,fe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ce?P&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,H,0,0,0,fe.width,fe.height,$.depth,he,Ae,fe.data):t.texImage3D(n.TEXTURE_2D_ARRAY,H,be,fe.width,fe.height,$.depth,0,he,Ae,fe.data)}else{Ce&&je&&t.texStorage2D(n.TEXTURE_2D,re,be,Fe[0].width,Fe[0].height);for(let H=0,K=Fe.length;H<K;H++)fe=Fe[H],x.format!==dt?he!==null?Ce?P&&t.compressedTexSubImage2D(n.TEXTURE_2D,H,0,0,fe.width,fe.height,he,fe.data):t.compressedTexImage2D(n.TEXTURE_2D,H,be,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ce?P&&t.texSubImage2D(n.TEXTURE_2D,H,0,0,fe.width,fe.height,he,Ae,fe.data):t.texImage2D(n.TEXTURE_2D,H,be,fe.width,fe.height,0,he,Ae,fe.data)}else if(x.isDataArrayTexture)if(Ce){if(je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,re,be,$.width,$.height,$.depth),P)if(x.layerUpdates.size>0){let H=ta($.width,$.height,x.format,x.type);for(let K of x.layerUpdates){let ie=$.data.subarray(K*H/$.data.BYTES_PER_ELEMENT,(K+1)*H/$.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,K,$.width,$.height,1,he,Ae,ie)}x.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,$.width,$.height,$.depth,he,Ae,$.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,be,$.width,$.height,$.depth,0,he,Ae,$.data);else if(x.isData3DTexture)Ce?(je&&t.texStorage3D(n.TEXTURE_3D,re,be,$.width,$.height,$.depth),P&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,$.width,$.height,$.depth,he,Ae,$.data)):t.texImage3D(n.TEXTURE_3D,0,be,$.width,$.height,$.depth,0,he,Ae,$.data);else if(x.isFramebufferTexture){if(je)if(Ce)t.texStorage2D(n.TEXTURE_2D,re,be,$.width,$.height);else{let H=$.width,K=$.height;for(let ie=0;ie<re;ie++)t.texImage2D(n.TEXTURE_2D,ie,be,H,K,0,he,Ae,null),H>>=1,K>>=1}}else if(Fe.length>0){if(Ce&&je){let H=Re(Fe[0]);t.texStorage2D(n.TEXTURE_2D,re,be,H.width,H.height)}for(let H=0,K=Fe.length;H<K;H++)fe=Fe[H],Ce?P&&t.texSubImage2D(n.TEXTURE_2D,H,0,0,he,Ae,fe):t.texImage2D(n.TEXTURE_2D,H,be,he,Ae,fe);x.generateMipmaps=!1}else if(Ce){if(je){let H=Re($);t.texStorage2D(n.TEXTURE_2D,re,be,H.width,H.height)}P&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,he,Ae,$)}else t.texImage2D(n.TEXTURE_2D,0,be,he,Ae,$);f(x)&&u(Y),ge.__version=q.version,x.onUpdate&&x.onUpdate(x)}y.__version=x.version}function X(y,x,N){if(x.image.length!==6)return;let Y=ke(y,x),j=x.source;t.bindTexture(n.TEXTURE_CUBE_MAP,y.__webglTexture,n.TEXTURE0+N);let q=i.get(j);if(j.version!==q.__version||Y===!0){t.activeTexture(n.TEXTURE0+N);let ge=Ue.getPrimaries(Ue.workingColorSpace),te=x.colorSpace===Yt?null:Ue.getPrimaries(x.colorSpace),ue=x.colorSpace===Yt||ge===te?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ue);let Ve=x.isCompressedTexture||x.image[0].isCompressedTexture,$=x.image[0]&&x.image[0].isDataTexture,he=[];for(let K=0;K<6;K++)!Ve&&!$?he[K]=S(x.image[K],!0,r.maxCubemapSize):he[K]=$?x.image[K].image:x.image[K],he[K]=$e(x,he[K]);let Ae=he[0],be=o.convert(x.format,x.colorSpace),fe=o.convert(x.type),Fe=A(x.internalFormat,be,fe,x.colorSpace),Ce=x.isVideoTexture!==!0,je=q.__version===void 0||Y===!0,P=j.dataReady,re=T(x,Ae);_e(n.TEXTURE_CUBE_MAP,x);let H;if(Ve){Ce&&je&&t.texStorage2D(n.TEXTURE_CUBE_MAP,re,Fe,Ae.width,Ae.height);for(let K=0;K<6;K++){H=he[K].mipmaps;for(let ie=0;ie<H.length;ie++){let oe=H[ie];x.format!==dt?be!==null?Ce?P&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie,0,0,oe.width,oe.height,be,oe.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie,Fe,oe.width,oe.height,0,oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ce?P&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie,0,0,oe.width,oe.height,be,fe,oe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie,Fe,oe.width,oe.height,0,be,fe,oe.data)}}}else{if(H=x.mipmaps,Ce&&je){H.length>0&&re++;let K=Re(he[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,re,Fe,K.width,K.height)}for(let K=0;K<6;K++)if($){Ce?P&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,he[K].width,he[K].height,be,fe,he[K].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Fe,he[K].width,he[K].height,0,be,fe,he[K].data);for(let ie=0;ie<H.length;ie++){let Oe=H[ie].image[K].image;Ce?P&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie+1,0,0,Oe.width,Oe.height,be,fe,Oe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie+1,Fe,Oe.width,Oe.height,0,be,fe,Oe.data)}}else{Ce?P&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,be,fe,he[K]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Fe,be,fe,he[K]);for(let ie=0;ie<H.length;ie++){let oe=H[ie];Ce?P&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie+1,0,0,be,fe,oe.image[K]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,ie+1,Fe,be,fe,oe.image[K])}}}f(x)&&u(n.TEXTURE_CUBE_MAP),q.__version=j.version,x.onUpdate&&x.onUpdate(x)}y.__version=x.version}function J(y,x,N,Y,j,q){let ge=o.convert(N.format,N.colorSpace),te=o.convert(N.type),ue=A(N.internalFormat,ge,te,N.colorSpace);if(!i.get(x).__hasExternalTextures){let $=Math.max(1,x.width>>q),he=Math.max(1,x.height>>q);j===n.TEXTURE_3D||j===n.TEXTURE_2D_ARRAY?t.texImage3D(j,q,ue,$,he,x.depth,0,ge,te,null):t.texImage2D(j,q,ue,$,he,0,ge,te,null)}t.bindFramebuffer(n.FRAMEBUFFER,y),ze(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Y,j,i.get(N).__webglTexture,0,Ie(x)):(j===n.TEXTURE_2D||j>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Y,j,i.get(N).__webglTexture,q),t.bindFramebuffer(n.FRAMEBUFFER,null)}function de(y,x,N){if(n.bindRenderbuffer(n.RENDERBUFFER,y),x.depthBuffer){let Y=x.depthTexture,j=Y&&Y.isDepthTexture?Y.type:null,q=E(x.stencilBuffer,j),ge=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,te=Ie(x);ze(x)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,te,q,x.width,x.height):N?n.renderbufferStorageMultisample(n.RENDERBUFFER,te,q,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,q,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ge,n.RENDERBUFFER,y)}else{let Y=x.textures;for(let j=0;j<Y.length;j++){let q=Y[j],ge=o.convert(q.format,q.colorSpace),te=o.convert(q.type),ue=A(q.internalFormat,ge,te,q.colorSpace),Ve=Ie(x);N&&ze(x)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ve,ue,x.width,x.height):ze(x)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ve,ue,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,ue,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function le(y,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,y),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(x.depthTexture).__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),k(x.depthTexture,0);let Y=i.get(x.depthTexture).__webglTexture,j=Ie(x);if(x.depthTexture.format===fi)ze(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Y,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Y,0);else if(x.depthTexture.format===pi)ze(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Y,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Y,0);else throw new Error("Unknown depthTexture format")}function we(y){let x=i.get(y),N=y.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==y.depthTexture){let Y=y.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),Y){let j=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,Y.removeEventListener("dispose",j)};Y.addEventListener("dispose",j),x.__depthDisposeCallback=j}x.__boundDepthTexture=Y}if(y.depthTexture&&!x.__autoAllocateDepthBuffer){if(N)throw new Error("target.depthTexture not supported in Cube render targets");le(x.__webglFramebuffer,y)}else if(N){x.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[Y]),x.__webglDepthbuffer[Y]===void 0)x.__webglDepthbuffer[Y]=n.createRenderbuffer(),de(x.__webglDepthbuffer[Y],y,!1);else{let j=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,q=x.__webglDepthbuffer[Y];n.bindRenderbuffer(n.RENDERBUFFER,q),n.framebufferRenderbuffer(n.FRAMEBUFFER,j,n.RENDERBUFFER,q)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),de(x.__webglDepthbuffer,y,!1);else{let Y=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,j=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,j),n.framebufferRenderbuffer(n.FRAMEBUFFER,Y,n.RENDERBUFFER,j)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ee(y,x,N){let Y=i.get(y);x!==void 0&&J(Y.__webglFramebuffer,y,y.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),N!==void 0&&we(y)}function Ne(y){let x=y.texture,N=i.get(y),Y=i.get(x);y.addEventListener("dispose",R);let j=y.textures,q=y.isWebGLCubeRenderTarget===!0,ge=j.length>1;if(ge||(Y.__webglTexture===void 0&&(Y.__webglTexture=n.createTexture()),Y.__version=x.version,s.memory.textures++),q){N.__webglFramebuffer=[];for(let te=0;te<6;te++)if(x.mipmaps&&x.mipmaps.length>0){N.__webglFramebuffer[te]=[];for(let ue=0;ue<x.mipmaps.length;ue++)N.__webglFramebuffer[te][ue]=n.createFramebuffer()}else N.__webglFramebuffer[te]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){N.__webglFramebuffer=[];for(let te=0;te<x.mipmaps.length;te++)N.__webglFramebuffer[te]=n.createFramebuffer()}else N.__webglFramebuffer=n.createFramebuffer();if(ge)for(let te=0,ue=j.length;te<ue;te++){let Ve=i.get(j[te]);Ve.__webglTexture===void 0&&(Ve.__webglTexture=n.createTexture(),s.memory.textures++)}if(y.samples>0&&ze(y)===!1){N.__webglMultisampledFramebuffer=n.createFramebuffer(),N.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,N.__webglMultisampledFramebuffer);for(let te=0;te<j.length;te++){let ue=j[te];N.__webglColorRenderbuffer[te]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,N.__webglColorRenderbuffer[te]);let Ve=o.convert(ue.format,ue.colorSpace),$=o.convert(ue.type),he=A(ue.internalFormat,Ve,$,ue.colorSpace,y.isXRRenderTarget===!0),Ae=Ie(y);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ae,he,y.width,y.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+te,n.RENDERBUFFER,N.__webglColorRenderbuffer[te])}n.bindRenderbuffer(n.RENDERBUFFER,null),y.depthBuffer&&(N.__webglDepthRenderbuffer=n.createRenderbuffer(),de(N.__webglDepthRenderbuffer,y,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(q){t.bindTexture(n.TEXTURE_CUBE_MAP,Y.__webglTexture),_e(n.TEXTURE_CUBE_MAP,x);for(let te=0;te<6;te++)if(x.mipmaps&&x.mipmaps.length>0)for(let ue=0;ue<x.mipmaps.length;ue++)J(N.__webglFramebuffer[te][ue],y,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ue);else J(N.__webglFramebuffer[te],y,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0);f(x)&&u(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ge){for(let te=0,ue=j.length;te<ue;te++){let Ve=j[te],$=i.get(Ve);t.bindTexture(n.TEXTURE_2D,$.__webglTexture),_e(n.TEXTURE_2D,Ve),J(N.__webglFramebuffer,y,Ve,n.COLOR_ATTACHMENT0+te,n.TEXTURE_2D,0),f(Ve)&&u(n.TEXTURE_2D)}t.unbindTexture()}else{let te=n.TEXTURE_2D;if((y.isWebGL3DRenderTarget||y.isWebGLArrayRenderTarget)&&(te=y.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(te,Y.__webglTexture),_e(te,x),x.mipmaps&&x.mipmaps.length>0)for(let ue=0;ue<x.mipmaps.length;ue++)J(N.__webglFramebuffer[ue],y,x,n.COLOR_ATTACHMENT0,te,ue);else J(N.__webglFramebuffer,y,x,n.COLOR_ATTACHMENT0,te,0);f(x)&&u(te),t.unbindTexture()}y.depthBuffer&&we(y)}function Ze(y){let x=y.textures;for(let N=0,Y=x.length;N<Y;N++){let j=x[N];if(f(j)){let q=y.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,ge=i.get(j).__webglTexture;t.bindTexture(q,ge),u(q),t.unbindTexture()}}}let Be=[],w=[];function Bt(y){if(y.samples>0){if(ze(y)===!1){let x=y.textures,N=y.width,Y=y.height,j=n.COLOR_BUFFER_BIT,q=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ge=i.get(y),te=x.length>1;if(te)for(let ue=0;ue<x.length;ue++)t.bindFramebuffer(n.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ge.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let ue=0;ue<x.length;ue++){if(y.resolveDepthBuffer&&(y.depthBuffer&&(j|=n.DEPTH_BUFFER_BIT),y.stencilBuffer&&y.resolveStencilBuffer&&(j|=n.STENCIL_BUFFER_BIT)),te){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ge.__webglColorRenderbuffer[ue]);let Ve=i.get(x[ue]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ve,0)}n.blitFramebuffer(0,0,N,Y,0,0,N,Y,j,n.NEAREST),c===!0&&(Be.length=0,w.length=0,Be.push(n.COLOR_ATTACHMENT0+ue),y.depthBuffer&&y.resolveDepthBuffer===!1&&(Be.push(q),w.push(q),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,w)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Be))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),te)for(let ue=0;ue<x.length;ue++){t.bindFramebuffer(n.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.RENDERBUFFER,ge.__webglColorRenderbuffer[ue]);let Ve=i.get(x[ue]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ge.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.TEXTURE_2D,Ve,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(y.depthBuffer&&y.resolveDepthBuffer===!1&&c){let x=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function Ie(y){return Math.min(r.maxSamples,y.samples)}function ze(y){let x=i.get(y);return y.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Te(y){let x=s.render.frame;h.get(y)!==x&&(h.set(y,x),y.update())}function $e(y,x){let N=y.colorSpace,Y=y.format,j=y.type;return y.isCompressedTexture===!0||y.isVideoTexture===!0||N!==Dt&&N!==Yt&&(Ue.getTransfer(N)===qe?(Y!==dt||j!==St)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",N)),x}function Re(y){return typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement?(l.width=y.naturalWidth||y.width,l.height=y.naturalHeight||y.height):typeof VideoFrame<"u"&&y instanceof VideoFrame?(l.width=y.displayWidth,l.height=y.displayHeight):(l.width=y.width,l.height=y.height),l}this.allocateTextureUnit=F,this.resetTextureUnits=v,this.setTexture2D=k,this.setTexture2DArray=Z,this.setTexture3D=V,this.setTextureCube=Q,this.rebindTextures=Ee,this.setupRenderTarget=Ne,this.updateRenderTargetMipmap=Ze,this.updateMultisampleRenderTarget=Bt,this.setupDepthRenderbuffer=we,this.setupFrameBufferTexture=J,this.useMultisampledRTT=ze}function th(n,e){function t(i,r=Yt){let o,s=Ue.getTransfer(r);if(i===St)return n.UNSIGNED_BYTE;if(i===un)return n.UNSIGNED_SHORT_4_4_4_4;if(i===hn)return n.UNSIGNED_SHORT_5_5_5_1;if(i===uo)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===co)return n.BYTE;if(i===lo)return n.SHORT;if(i===vi)return n.UNSIGNED_SHORT;if(i===ln)return n.INT;if(i===Vt)return n.UNSIGNED_INT;if(i===bt)return n.FLOAT;if(i===hi)return n.HALF_FLOAT;if(i===ho)return n.ALPHA;if(i===fo)return n.RGB;if(i===dt)return n.RGBA;if(i===po)return n.LUMINANCE;if(i===mo)return n.LUMINANCE_ALPHA;if(i===fi)return n.DEPTH_COMPONENT;if(i===pi)return n.DEPTH_STENCIL;if(i===_o)return n.RED;if(i===fn)return n.RED_INTEGER;if(i===go)return n.RG;if(i===pn)return n.RG_INTEGER;if(i===dn)return n.RGBA_INTEGER;if(i===mn||i===_n||i===gn||i===xn)if(s===qe)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(i===mn)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===_n)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===gn)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===xn)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(i===mn)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===_n)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===gn)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===xn)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===fr||i===pr||i===dr||i===mr)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(i===fr)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===pr)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===dr)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===mr)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===_r||i===gr||i===xr)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(i===_r||i===gr)return s===qe?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(i===xr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Mr||i===vr||i===Sr||i===Er||i===yr||i===Tr||i===Ar||i===br||i===Rr||i===wr||i===Cr||i===Pr||i===Lr||i===Ur)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(i===Mr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===vr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Sr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Er)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===yr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Tr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ar)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===br)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Rr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===wr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Cr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Pr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Lr)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ur)return s===qe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Mn||i===Dr||i===Ir)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(i===Mn)return s===qe?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Dr)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ir)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===xo||i===Fr||i===Nr||i===Br)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(i===Mn)return o.COMPRESSED_RED_RGTC1_EXT;if(i===Fr)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Nr)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Br)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ni?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var ns=class extends ot{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}};var gt=class extends rt{constructor(){super(),this.isGroup=!0,this.type="Group"}};var Cd={type:"move"},$n=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,o=null,s=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){s=!0;for(let S of e.hand.values()){let f=t.getJointPose(S,i),u=this._getHandJoint(l,S);f!==null&&(u.matrix.fromArray(f.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=f.radius),u.visible=f!==null}let h=l.joints["index-finger-tip"],p=l.joints["thumb-tip"],d=h.position.distanceTo(p.position),m=.02,g=.005;l.inputState.pinching&&d>m+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=m-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(o=t.getPose(e.gripSpace,i),o!==null&&(c.matrix.fromArray(o.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,o.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(o.linearVelocity)):c.hasLinearVelocity=!1,o.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(o.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&o!==null&&(r=o),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Cd)))}return a!==null&&(a.visible=r!==null),c!==null&&(c.visible=o!==null),l!==null&&(l.visible=s!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new gt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}};var Pd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ld=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,rs=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){let r=new ht,o=e.properties.get(r);o.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Ct({vertexShader:Pd,fragmentShader:Ld,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new se(new Vi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}};var os=class extends Ft{constructor(e,t){super();let i=this,r=null,o=1,s=null,a="local-floor",c=1,l=null,h=null,p=null,d=null,m=null,g=null,S=new rs,f=t.getContextAttributes(),u=null,A=null,E=[],T=[],I=new ve,R=null,b=new ot;b.layers.enable(1),b.viewport=new De;let D=new ot;D.layers.enable(2),D.viewport=new De;let z=[b,D],_=new ns;_.layers.enable(1),_.layers.enable(2);let v=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let J=E[X];return J===void 0&&(J=new $n,E[X]=J),J.getTargetRaySpace()},this.getControllerGrip=function(X){let J=E[X];return J===void 0&&(J=new $n,E[X]=J),J.getGripSpace()},this.getHand=function(X){let J=E[X];return J===void 0&&(J=new $n,E[X]=J),J.getHandSpace()};function B(X){let J=T.indexOf(X.inputSource);if(J===-1)return;let de=E[J];de!==void 0&&(de.update(X.inputSource,X.frame,l||s),de.dispatchEvent({type:X.type,data:X.inputSource}))}function k(){r.removeEventListener("select",B),r.removeEventListener("selectstart",B),r.removeEventListener("selectend",B),r.removeEventListener("squeeze",B),r.removeEventListener("squeezestart",B),r.removeEventListener("squeezeend",B),r.removeEventListener("end",k),r.removeEventListener("inputsourceschange",Z);for(let X=0;X<E.length;X++){let J=T[X];J!==null&&(T[X]=null,E[X].disconnect(J))}v=null,F=null,S.reset(),e.setRenderTarget(u),m=null,d=null,p=null,r=null,A=null,Ye.stop(),i.isPresenting=!1,e.setPixelRatio(R),e.setSize(I.width,I.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){o=X,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||s},this.setReferenceSpace=function(X){l=X},this.getBaseLayer=function(){return d!==null?d:m},this.getBinding=function(){return p},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(X){if(r=X,r!==null){if(u=e.getRenderTarget(),r.addEventListener("select",B),r.addEventListener("selectstart",B),r.addEventListener("selectend",B),r.addEventListener("squeeze",B),r.addEventListener("squeezestart",B),r.addEventListener("squeezeend",B),r.addEventListener("end",k),r.addEventListener("inputsourceschange",Z),f.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(I),r.renderState.layers===void 0){let J={antialias:f.antialias,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:o};m=new XRWebGLLayer(r,t,J),r.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),A=new Nt(m.framebufferWidth,m.framebufferHeight,{format:dt,type:St,colorSpace:e.outputColorSpace,stencilBuffer:f.stencil})}else{let J=null,de=null,le=null;f.depth&&(le=f.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,J=f.stencil?pi:fi,de=f.stencil?ni:Vt);let we={colorFormat:t.RGBA8,depthFormat:le,scaleFactor:o};p=new XRWebGLBinding(r,t),d=p.createProjectionLayer(we),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),A=new Nt(d.textureWidth,d.textureHeight,{format:dt,type:St,depthTexture:new jn(d.textureWidth,d.textureHeight,de,void 0,void 0,void 0,void 0,void 0,void 0,J),stencilBuffer:f.stencil,colorSpace:e.outputColorSpace,samples:f.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(c),l=null,s=await r.requestReferenceSpace(a),Ye.setContext(r),Ye.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function Z(X){for(let J=0;J<X.removed.length;J++){let de=X.removed[J],le=T.indexOf(de);le>=0&&(T[le]=null,E[le].disconnect(de))}for(let J=0;J<X.added.length;J++){let de=X.added[J],le=T.indexOf(de);if(le===-1){for(let Ee=0;Ee<E.length;Ee++)if(Ee>=T.length){T.push(de),le=Ee;break}else if(T[Ee]===null){T[Ee]=de,le=Ee;break}if(le===-1)break}let we=E[le];we&&we.connect(de)}}let V=new C,Q=new C;function W(X,J,de){V.setFromMatrixPosition(J.matrixWorld),Q.setFromMatrixPosition(de.matrixWorld);let le=V.distanceTo(Q),we=J.projectionMatrix.elements,Ee=de.projectionMatrix.elements,Ne=we[14]/(we[10]-1),Ze=we[14]/(we[10]+1),Be=(we[9]+1)/we[5],w=(we[9]-1)/we[5],Bt=(we[8]-1)/we[0],Ie=(Ee[8]+1)/Ee[0],ze=Ne*Bt,Te=Ne*Ie,$e=le/(-Bt+Ie),Re=$e*-Bt;if(J.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Re),X.translateZ($e),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),we[10]===-1)X.projectionMatrix.copy(J.projectionMatrix),X.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{let y=Ne+$e,x=Ze+$e,N=ze-Re,Y=Te+(le-Re),j=Be*Ze/x*y,q=w*Ze/x*y;X.projectionMatrix.makePerspective(N,Y,j,q,y,x),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function ae(X,J){J===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(J.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(r===null)return;let J=X.near,de=X.far;S.texture!==null&&(S.depthNear>0&&(J=S.depthNear),S.depthFar>0&&(de=S.depthFar)),_.near=D.near=b.near=J,_.far=D.far=b.far=de,(v!==_.near||F!==_.far)&&(r.updateRenderState({depthNear:_.near,depthFar:_.far}),v=_.near,F=_.far);let le=X.parent,we=_.cameras;ae(_,le);for(let Ee=0;Ee<we.length;Ee++)ae(we[Ee],le);we.length===2?W(_,b,D):_.projectionMatrix.copy(b.projectionMatrix),ce(X,_,le)};function ce(X,J,de){de===null?X.matrix.copy(J.matrixWorld):(X.matrix.copy(de.matrixWorld),X.matrix.invert(),X.matrix.multiply(J.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(J.projectionMatrix),X.projectionMatrixInverse.copy(J.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Or*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(d===null&&m===null))return c},this.setFoveation=function(X){c=X,d!==null&&(d.fixedFoveation=X),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=X)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(_)};let _e=null;function ke(X,J){if(h=J.getViewerPose(l||s),g=J,h!==null){let de=h.views;m!==null&&(e.setRenderTargetFramebuffer(A,m.framebuffer),e.setRenderTarget(A));let le=!1;de.length!==_.cameras.length&&(_.cameras.length=0,le=!0);for(let Ee=0;Ee<de.length;Ee++){let Ne=de[Ee],Ze=null;if(m!==null)Ze=m.getViewport(Ne);else{let w=p.getViewSubImage(d,Ne);Ze=w.viewport,Ee===0&&(e.setRenderTargetTextures(A,w.colorTexture,d.ignoreDepthValues?void 0:w.depthStencilTexture),e.setRenderTarget(A))}let Be=z[Ee];Be===void 0&&(Be=new ot,Be.layers.enable(Ee),Be.viewport=new De,z[Ee]=Be),Be.matrix.fromArray(Ne.transform.matrix),Be.matrix.decompose(Be.position,Be.quaternion,Be.scale),Be.projectionMatrix.fromArray(Ne.projectionMatrix),Be.projectionMatrixInverse.copy(Be.projectionMatrix).invert(),Be.viewport.set(Ze.x,Ze.y,Ze.width,Ze.height),Ee===0&&(_.matrix.copy(Be.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),le===!0&&_.cameras.push(Be)}let we=r.enabledFeatures;if(we&&we.includes("depth-sensing")){let Ee=p.getDepthInformation(de[0]);Ee&&Ee.isValid&&Ee.texture&&S.init(e,Ee,r.renderState)}}for(let de=0;de<E.length;de++){let le=T[de],we=E[de];le!==null&&we!==void 0&&we.update(le,J,l||s)}_e&&_e(X,J),J.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:J}),g=null}let Ye=new Zo;Ye.setAnimationLoop(ke),this.setAnimationLoop=function(X){_e=X},this.dispose=function(){}}};var rn=new yt,Ud=new Ge;function ih(n,e){function t(f,u){f.matrixAutoUpdate===!0&&f.updateMatrix(),u.value.copy(f.matrix)}function i(f,u){u.color.getRGB(f.fogColor.value,Xo(n)),u.isFog?(f.fogNear.value=u.near,f.fogFar.value=u.far):u.isFogExp2&&(f.fogDensity.value=u.density)}function r(f,u,A,E,T){u.isMeshBasicMaterial||u.isMeshLambertMaterial?o(f,u):u.isMeshToonMaterial?(o(f,u),p(f,u)):u.isMeshPhongMaterial?(o(f,u),h(f,u)):u.isMeshStandardMaterial?(o(f,u),d(f,u),u.isMeshPhysicalMaterial&&m(f,u,T)):u.isMeshMatcapMaterial?(o(f,u),g(f,u)):u.isMeshDepthMaterial?o(f,u):u.isMeshDistanceMaterial?(o(f,u),S(f,u)):u.isMeshNormalMaterial?o(f,u):u.isLineBasicMaterial?(s(f,u),u.isLineDashedMaterial&&a(f,u)):u.isPointsMaterial?c(f,u,A,E):u.isSpriteMaterial?l(f,u):u.isShadowMaterial?(f.color.value.copy(u.color),f.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function o(f,u){f.opacity.value=u.opacity,u.color&&f.diffuse.value.copy(u.color),u.emissive&&f.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(f.map.value=u.map,t(u.map,f.mapTransform)),u.alphaMap&&(f.alphaMap.value=u.alphaMap,t(u.alphaMap,f.alphaMapTransform)),u.bumpMap&&(f.bumpMap.value=u.bumpMap,t(u.bumpMap,f.bumpMapTransform),f.bumpScale.value=u.bumpScale,u.side===et&&(f.bumpScale.value*=-1)),u.normalMap&&(f.normalMap.value=u.normalMap,t(u.normalMap,f.normalMapTransform),f.normalScale.value.copy(u.normalScale),u.side===et&&f.normalScale.value.negate()),u.displacementMap&&(f.displacementMap.value=u.displacementMap,t(u.displacementMap,f.displacementMapTransform),f.displacementScale.value=u.displacementScale,f.displacementBias.value=u.displacementBias),u.emissiveMap&&(f.emissiveMap.value=u.emissiveMap,t(u.emissiveMap,f.emissiveMapTransform)),u.specularMap&&(f.specularMap.value=u.specularMap,t(u.specularMap,f.specularMapTransform)),u.alphaTest>0&&(f.alphaTest.value=u.alphaTest);let A=e.get(u),E=A.envMap,T=A.envMapRotation;E&&(f.envMap.value=E,rn.copy(T),rn.x*=-1,rn.y*=-1,rn.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(rn.y*=-1,rn.z*=-1),f.envMapRotation.value.setFromMatrix4(Ud.makeRotationFromEuler(rn)),f.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=u.reflectivity,f.ior.value=u.ior,f.refractionRatio.value=u.refractionRatio),u.lightMap&&(f.lightMap.value=u.lightMap,f.lightMapIntensity.value=u.lightMapIntensity,t(u.lightMap,f.lightMapTransform)),u.aoMap&&(f.aoMap.value=u.aoMap,f.aoMapIntensity.value=u.aoMapIntensity,t(u.aoMap,f.aoMapTransform))}function s(f,u){f.diffuse.value.copy(u.color),f.opacity.value=u.opacity,u.map&&(f.map.value=u.map,t(u.map,f.mapTransform))}function a(f,u){f.dashSize.value=u.dashSize,f.totalSize.value=u.dashSize+u.gapSize,f.scale.value=u.scale}function c(f,u,A,E){f.diffuse.value.copy(u.color),f.opacity.value=u.opacity,f.size.value=u.size*A,f.scale.value=E*.5,u.map&&(f.map.value=u.map,t(u.map,f.uvTransform)),u.alphaMap&&(f.alphaMap.value=u.alphaMap,t(u.alphaMap,f.alphaMapTransform)),u.alphaTest>0&&(f.alphaTest.value=u.alphaTest)}function l(f,u){f.diffuse.value.copy(u.color),f.opacity.value=u.opacity,f.rotation.value=u.rotation,u.map&&(f.map.value=u.map,t(u.map,f.mapTransform)),u.alphaMap&&(f.alphaMap.value=u.alphaMap,t(u.alphaMap,f.alphaMapTransform)),u.alphaTest>0&&(f.alphaTest.value=u.alphaTest)}function h(f,u){f.specular.value.copy(u.specular),f.shininess.value=Math.max(u.shininess,1e-4)}function p(f,u){u.gradientMap&&(f.gradientMap.value=u.gradientMap)}function d(f,u){f.metalness.value=u.metalness,u.metalnessMap&&(f.metalnessMap.value=u.metalnessMap,t(u.metalnessMap,f.metalnessMapTransform)),f.roughness.value=u.roughness,u.roughnessMap&&(f.roughnessMap.value=u.roughnessMap,t(u.roughnessMap,f.roughnessMapTransform)),u.envMap&&(f.envMapIntensity.value=u.envMapIntensity)}function m(f,u,A){f.ior.value=u.ior,u.sheen>0&&(f.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),f.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(f.sheenColorMap.value=u.sheenColorMap,t(u.sheenColorMap,f.sheenColorMapTransform)),u.sheenRoughnessMap&&(f.sheenRoughnessMap.value=u.sheenRoughnessMap,t(u.sheenRoughnessMap,f.sheenRoughnessMapTransform))),u.clearcoat>0&&(f.clearcoat.value=u.clearcoat,f.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(f.clearcoatMap.value=u.clearcoatMap,t(u.clearcoatMap,f.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,t(u.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(f.clearcoatNormalMap.value=u.clearcoatNormalMap,t(u.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===et&&f.clearcoatNormalScale.value.negate())),u.dispersion>0&&(f.dispersion.value=u.dispersion),u.iridescence>0&&(f.iridescence.value=u.iridescence,f.iridescenceIOR.value=u.iridescenceIOR,f.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(f.iridescenceMap.value=u.iridescenceMap,t(u.iridescenceMap,f.iridescenceMapTransform)),u.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=u.iridescenceThicknessMap,t(u.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),u.transmission>0&&(f.transmission.value=u.transmission,f.transmissionSamplerMap.value=A.texture,f.transmissionSamplerSize.value.set(A.width,A.height),u.transmissionMap&&(f.transmissionMap.value=u.transmissionMap,t(u.transmissionMap,f.transmissionMapTransform)),f.thickness.value=u.thickness,u.thicknessMap&&(f.thicknessMap.value=u.thicknessMap,t(u.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=u.attenuationDistance,f.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(f.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(f.anisotropyMap.value=u.anisotropyMap,t(u.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=u.specularIntensity,f.specularColor.value.copy(u.specularColor),u.specularColorMap&&(f.specularColorMap.value=u.specularColorMap,t(u.specularColorMap,f.specularColorMapTransform)),u.specularIntensityMap&&(f.specularIntensityMap.value=u.specularIntensityMap,t(u.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,u){u.matcap&&(f.matcap.value=u.matcap)}function S(f,u){let A=e.get(u).light;f.referencePosition.value.setFromMatrixPosition(A.matrixWorld),f.nearDistance.value=A.shadow.camera.near,f.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function nh(n,e,t,i){let r={},o={},s=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(A,E){let T=E.program;i.uniformBlockBinding(A,T)}function l(A,E){let T=r[A.id];T===void 0&&(g(A),T=h(A),r[A.id]=T,A.addEventListener("dispose",f));let I=E.program;i.updateUBOMapping(A,I);let R=e.render.frame;o[A.id]!==R&&(d(A),o[A.id]=R)}function h(A){let E=p();A.__bindingPointIndex=E;let T=n.createBuffer(),I=A.__size,R=A.usage;return n.bindBuffer(n.UNIFORM_BUFFER,T),n.bufferData(n.UNIFORM_BUFFER,I,R),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,T),T}function p(){for(let A=0;A<a;A++)if(s.indexOf(A)===-1)return s.push(A),A;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(A){let E=r[A.id],T=A.uniforms,I=A.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let R=0,b=T.length;R<b;R++){let D=Array.isArray(T[R])?T[R]:[T[R]];for(let z=0,_=D.length;z<_;z++){let v=D[z];if(m(v,R,z,I)===!0){let F=v.__offset,B=Array.isArray(v.value)?v.value:[v.value],k=0;for(let Z=0;Z<B.length;Z++){let V=B[Z],Q=S(V);typeof V=="number"||typeof V=="boolean"?(v.__data[0]=V,n.bufferSubData(n.UNIFORM_BUFFER,F+k,v.__data)):V.isMatrix3?(v.__data[0]=V.elements[0],v.__data[1]=V.elements[1],v.__data[2]=V.elements[2],v.__data[3]=0,v.__data[4]=V.elements[3],v.__data[5]=V.elements[4],v.__data[6]=V.elements[5],v.__data[7]=0,v.__data[8]=V.elements[6],v.__data[9]=V.elements[7],v.__data[10]=V.elements[8],v.__data[11]=0):(V.toArray(v.__data,k),k+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,F,v.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(A,E,T,I){let R=A.value,b=E+"_"+T;if(I[b]===void 0)return typeof R=="number"||typeof R=="boolean"?I[b]=R:I[b]=R.clone(),!0;{let D=I[b];if(typeof R=="number"||typeof R=="boolean"){if(D!==R)return I[b]=R,!0}else if(D.equals(R)===!1)return D.copy(R),!0}return!1}function g(A){let E=A.uniforms,T=0,I=16;for(let b=0,D=E.length;b<D;b++){let z=Array.isArray(E[b])?E[b]:[E[b]];for(let _=0,v=z.length;_<v;_++){let F=z[_],B=Array.isArray(F.value)?F.value:[F.value];for(let k=0,Z=B.length;k<Z;k++){let V=B[k],Q=S(V),W=T%I,ae=W%Q.boundary,ce=W+ae;T+=ae,ce!==0&&I-ce<Q.storage&&(T+=I-ce),F.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=T,T+=Q.storage}}}let R=T%I;return R>0&&(T+=I-R),A.__size=T,A.__cache={},this}function S(A){let E={boundary:0,storage:0};return typeof A=="number"||typeof A=="boolean"?(E.boundary=4,E.storage=4):A.isVector2?(E.boundary=8,E.storage=8):A.isVector3||A.isColor?(E.boundary=16,E.storage=12):A.isVector4?(E.boundary=16,E.storage=16):A.isMatrix3?(E.boundary=48,E.storage=48):A.isMatrix4?(E.boundary=64,E.storage=64):A.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",A),E}function f(A){let E=A.target;E.removeEventListener("dispose",f);let T=s.indexOf(E.__bindingPointIndex);s.splice(T,1),n.deleteBuffer(r[E.id]),delete r[E.id],delete o[E.id]}function u(){for(let A in r)n.deleteBuffer(r[A]);s=[],r={},o={}}return{bind:c,update:l,dispose:u}}var Xr=class{constructor(e={}){let{canvas:t=ic(),context:i=null,depth:r=!0,stencil:o=!1,alpha:s=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:p=!1}=e;this.isWebGLRenderer=!0;let d;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=i.getContextAttributes().alpha}else d=s;let m=new Uint32Array(4),g=new Int32Array(4),S=null,f=null,u=[],A=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ut,this.toneMapping=qt,this.toneMappingExposure=1;let E=this,T=!1,I=0,R=0,b=null,D=-1,z=null,_=new De,v=new De,F=null,B=new Pe(0),k=0,Z=t.width,V=t.height,Q=1,W=null,ae=null,ce=new De(0,0,Z,V),_e=new De(0,0,Z,V),ke=!1,Ye=new zi,X=!1,J=!1,de=new Ge,le=new Ge,we=new C,Ee=new De,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ze=!1;function Be(){return b===null?Q:1}let w=i;function Bt(M,L){return t.getContext(M,L)}try{let M={alpha:!0,depth:r,stencil:o,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${rr}`),t.addEventListener("webglcontextlost",K,!1),t.addEventListener("webglcontextrestored",ie,!1),t.addEventListener("webglcontextcreationerror",oe,!1),w===null){let L="webgl2";if(w=Bt(L,M),w===null)throw Bt(L)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let Ie,ze,Te,$e,Re,y,x,N,Y,j,q,ge,te,ue,Ve,$,he,Ae,be,fe,Fe,Ce,je,P;function re(){Ie=new Mu(w),Ie.init(),Ce=new th(w,Ie),ze=new lu(w,Ie,e,Ce),Te=new Qu(w),ze.reverseDepthBuffer&&Te.buffers.depth.setReversed(!0),$e=new Eu(w),Re=new Hu,y=new eh(w,Ie,Te,Re,ze,Ce,$e),x=new hu(E),N=new xu(E),Y=new Rc(w),je=new au(w,Y),j=new vu(w,Y,$e,je),q=new Tu(w,j,Y,$e),be=new yu(w,ze,y),$=new uu(Re),ge=new ku(E,x,N,Ie,ze,je,$),te=new ih(E,Re),ue=new qu,Ve=new Zu(Ie),Ae=new su(E,x,N,Te,q,d,c),he=new $u(E,q,ze),P=new nh(w,$e,ze,Te),fe=new cu(w,Ie,$e),Fe=new Su(w,Ie,$e),$e.programs=ge.programs,E.capabilities=ze,E.extensions=Ie,E.properties=Re,E.renderLists=ue,E.shadowMap=he,E.state=Te,E.info=$e}re();let H=new os(E,w);this.xr=H,this.getContext=function(){return w},this.getContextAttributes=function(){return w.getContextAttributes()},this.forceContextLoss=function(){let M=Ie.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=Ie.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(M){M!==void 0&&(Q=M,this.setSize(Z,V,!1))},this.getSize=function(M){return M.set(Z,V)},this.setSize=function(M,L,O=!0){if(H.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Z=M,V=L,t.width=Math.floor(M*Q),t.height=Math.floor(L*Q),O===!0&&(t.style.width=M+"px",t.style.height=L+"px"),this.setViewport(0,0,M,L)},this.getDrawingBufferSize=function(M){return M.set(Z*Q,V*Q).floor()},this.setDrawingBufferSize=function(M,L,O){Z=M,V=L,Q=O,t.width=Math.floor(M*O),t.height=Math.floor(L*O),this.setViewport(0,0,M,L)},this.getCurrentViewport=function(M){return M.copy(_)},this.getViewport=function(M){return M.copy(ce)},this.setViewport=function(M,L,O,G){M.isVector4?ce.set(M.x,M.y,M.z,M.w):ce.set(M,L,O,G),Te.viewport(_.copy(ce).multiplyScalar(Q).round())},this.getScissor=function(M){return M.copy(_e)},this.setScissor=function(M,L,O,G){M.isVector4?_e.set(M.x,M.y,M.z,M.w):_e.set(M,L,O,G),Te.scissor(v.copy(_e).multiplyScalar(Q).round())},this.getScissorTest=function(){return ke},this.setScissorTest=function(M){Te.setScissorTest(ke=M)},this.setOpaqueSort=function(M){W=M},this.setTransparentSort=function(M){ae=M},this.getClearColor=function(M){return M.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor.apply(Ae,arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha.apply(Ae,arguments)},this.clear=function(M=!0,L=!0,O=!0){let G=0;if(M){let U=!1;if(b!==null){let ee=b.texture.format;U=ee===dn||ee===pn||ee===fn}if(U){let ee=b.texture.type,ne=ee===St||ee===Vt||ee===vi||ee===ni||ee===un||ee===hn,pe=Ae.getClearColor(),me=Ae.getClearAlpha(),Se=pe.r,ye=pe.g,xe=pe.b;ne?(m[0]=Se,m[1]=ye,m[2]=xe,m[3]=me,w.clearBufferuiv(w.COLOR,0,m)):(g[0]=Se,g[1]=ye,g[2]=xe,g[3]=me,w.clearBufferiv(w.COLOR,0,g))}else G|=w.COLOR_BUFFER_BIT}L&&(G|=w.DEPTH_BUFFER_BIT,w.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),O&&(G|=w.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),w.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",K,!1),t.removeEventListener("webglcontextrestored",ie,!1),t.removeEventListener("webglcontextcreationerror",oe,!1),ue.dispose(),Ve.dispose(),Re.dispose(),x.dispose(),N.dispose(),q.dispose(),je.dispose(),P.dispose(),ge.dispose(),H.dispose(),H.removeEventListener("sessionstart",oa),H.removeEventListener("sessionend",sa),qi.stop()};function K(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function ie(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;let M=$e.autoReset,L=he.enabled,O=he.autoUpdate,G=he.needsUpdate,U=he.type;re(),$e.autoReset=M,he.enabled=L,he.autoUpdate=O,he.needsUpdate=G,he.type=U}function oe(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Oe(M){let L=M.target;L.removeEventListener("dispose",Oe),lt(L)}function lt(M){Pt(M),Re.remove(M)}function Pt(M){let L=Re.get(M).programs;L!==void 0&&(L.forEach(function(O){ge.releaseProgram(O)}),M.isShaderMaterial&&ge.releaseShaderCache(M))}this.renderBufferDirect=function(M,L,O,G,U,ee){L===null&&(L=Ne);let ne=U.isMesh&&U.matrixWorld.determinant()<0,pe=vh(M,L,O,G,U);Te.setMaterial(G,ne);let me=O.index,Se=1;if(G.wireframe===!0){if(me=j.getWireframeAttribute(O),me===void 0)return;Se=2}let ye=O.drawRange,xe=O.attributes.position,Ke=ye.start*Se,Qe=(ye.start+ye.count)*Se;ee!==null&&(Ke=Math.max(Ke,ee.start*Se),Qe=Math.min(Qe,(ee.start+ee.count)*Se)),me!==null?(Ke=Math.max(Ke,0),Qe=Math.min(Qe,me.count)):xe!=null&&(Ke=Math.max(Ke,0),Qe=Math.min(Qe,xe.count));let nt=Qe-Ke;if(nt<0||nt===1/0)return;je.setup(U,G,pe,O,me);let Ot,We=fe;if(me!==null&&(Ot=Y.get(me),We=Fe,We.setIndex(Ot)),U.isMesh)G.wireframe===!0?(Te.setLineWidth(G.wireframeLinewidth*Be()),We.setMode(w.LINES)):We.setMode(w.TRIANGLES);else if(U.isLine){let Me=G.linewidth;Me===void 0&&(Me=1),Te.setLineWidth(Me*Be()),U.isLineSegments?We.setMode(w.LINES):U.isLineLoop?We.setMode(w.LINE_LOOP):We.setMode(w.LINE_STRIP)}else U.isPoints?We.setMode(w.POINTS):U.isSprite&&We.setMode(w.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)We.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Ie.get("WEBGL_multi_draw"))We.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let Me=U._multiDrawStarts,xt=U._multiDrawCounts,Xe=U._multiDrawCount,$t=me?Y.get(me).bytesPerElement:1,cn=Re.get(G).currentProgram.getUniforms();for(let Gt=0;Gt<Xe;Gt++)cn.setValue(w,"_gl_DrawID",Gt),We.render(Me[Gt]/$t,xt[Gt])}else if(U.isInstancedMesh)We.renderInstances(Ke,nt,U.count);else if(O.isInstancedBufferGeometry){let Me=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,xt=Math.min(O.instanceCount,Me);We.renderInstances(Ke,nt,xt)}else We.render(Ke,nt)};function He(M,L,O){M.transparent===!0&&M.side===At&&M.forceSinglePass===!1?(M.side=et,M.needsUpdate=!0,Jr(M,L,O),M.side=zt,M.needsUpdate=!0,Jr(M,L,O),M.side=At):Jr(M,L,O)}this.compile=function(M,L,O=null){O===null&&(O=M),f=Ve.get(O),f.init(L),A.push(f),O.traverseVisible(function(U){U.isLight&&U.layers.test(L.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),M!==O&&M.traverseVisible(function(U){U.isLight&&U.layers.test(L.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),f.setupLights();let G=new Set;return M.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let ee=U.material;if(ee)if(Array.isArray(ee))for(let ne=0;ne<ee.length;ne++){let pe=ee[ne];He(pe,O,U),G.add(pe)}else He(ee,O,U),G.add(ee)}),A.pop(),f=null,G},this.compileAsync=function(M,L,O=null){let G=this.compile(M,L,O);return new Promise(U=>{function ee(){if(G.forEach(function(ne){Re.get(ne).currentProgram.isReady()&&G.delete(ne)}),G.size===0){U(M);return}setTimeout(ee,10)}Ie.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let Lt=null;function gi(M){Lt&&Lt(M)}function oa(){qi.stop()}function sa(){qi.start()}let qi=new Zo;qi.setAnimationLoop(gi),typeof self<"u"&&qi.setContext(self),this.setAnimationLoop=function(M){Lt=M,H.setAnimationLoop(M),M===null?qi.stop():qi.start()},H.addEventListener("sessionstart",oa),H.addEventListener("sessionend",sa),this.render=function(M,L){if(L!==void 0&&L.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),H.enabled===!0&&H.isPresenting===!0&&(H.cameraAutoUpdate===!0&&H.updateCamera(L),L=H.getCamera()),M.isScene===!0&&M.onBeforeRender(E,M,L,b),f=Ve.get(M,A.length),f.init(L),A.push(f),le.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Ye.setFromProjectionMatrix(le),J=this.localClippingEnabled,X=$.init(this.clippingPlanes,J),S=ue.get(M,u.length),S.init(),u.push(S),H.enabled===!0&&H.isPresenting===!0){let ee=E.xr.getDepthSensingMesh();ee!==null&&ls(ee,L,-1/0,E.sortObjects)}ls(M,L,0,E.sortObjects),S.finish(),E.sortObjects===!0&&S.sort(W,ae),Ze=H.enabled===!1||H.isPresenting===!1||H.hasDepthSensing()===!1,Ze&&Ae.addToRenderList(S,M),this.info.render.frame++,X===!0&&$.beginShadows();let O=f.state.shadowsArray;he.render(O,M,L),X===!0&&$.endShadows(),this.info.autoReset===!0&&this.info.reset();let G=S.opaque,U=S.transmissive;if(f.setupLights(),L.isArrayCamera){let ee=L.cameras;if(U.length>0)for(let ne=0,pe=ee.length;ne<pe;ne++){let me=ee[ne];ca(G,U,M,me)}Ze&&Ae.render(M);for(let ne=0,pe=ee.length;ne<pe;ne++){let me=ee[ne];aa(S,M,me,me.viewport)}}else U.length>0&&ca(G,U,M,L),Ze&&Ae.render(M),aa(S,M,L);b!==null&&(y.updateMultisampleRenderTarget(b),y.updateRenderTargetMipmap(b)),M.isScene===!0&&M.onAfterRender(E,M,L),je.resetDefaultState(),D=-1,z=null,A.pop(),A.length>0?(f=A[A.length-1],X===!0&&$.setGlobalState(E.clippingPlanes,f.state.camera)):f=null,u.pop(),u.length>0?S=u[u.length-1]:S=null};function ls(M,L,O,G){if(M.visible===!1)return;if(M.layers.test(L.layers)){if(M.isGroup)O=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(L);else if(M.isLight)f.pushLight(M),M.castShadow&&f.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Ye.intersectsSprite(M)){G&&Ee.setFromMatrixPosition(M.matrixWorld).applyMatrix4(le);let ne=q.update(M),pe=M.material;pe.visible&&S.push(M,ne,pe,O,Ee.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Ye.intersectsObject(M))){let ne=q.update(M),pe=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ee.copy(M.boundingSphere.center)):(ne.boundingSphere===null&&ne.computeBoundingSphere(),Ee.copy(ne.boundingSphere.center)),Ee.applyMatrix4(M.matrixWorld).applyMatrix4(le)),Array.isArray(pe)){let me=ne.groups;for(let Se=0,ye=me.length;Se<ye;Se++){let xe=me[Se],Ke=pe[xe.materialIndex];Ke&&Ke.visible&&S.push(M,ne,Ke,O,Ee.z,xe)}}else pe.visible&&S.push(M,ne,pe,O,Ee.z,null)}}let ee=M.children;for(let ne=0,pe=ee.length;ne<pe;ne++)ls(ee[ne],L,O,G)}function aa(M,L,O,G){let U=M.opaque,ee=M.transmissive,ne=M.transparent;f.setupLightsView(O),X===!0&&$.setGlobalState(E.clippingPlanes,O),G&&Te.viewport(_.copy(G)),U.length>0&&jr(U,L,O),ee.length>0&&jr(ee,L,O),ne.length>0&&jr(ne,L,O),Te.buffers.depth.setTest(!0),Te.buffers.depth.setMask(!0),Te.buffers.color.setMask(!0),Te.setPolygonOffset(!1)}function ca(M,L,O,G){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[G.id]===void 0&&(f.state.transmissionRenderTarget[G.id]=new Nt(1,1,{generateMipmaps:!0,type:Ie.has("EXT_color_buffer_half_float")||Ie.has("EXT_color_buffer_float")?hi:St,minFilter:ii,samples:4,stencilBuffer:o,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ue.workingColorSpace}));let ee=f.state.transmissionRenderTarget[G.id],ne=G.viewport||_;ee.setSize(ne.z,ne.w);let pe=E.getRenderTarget();E.setRenderTarget(ee),E.getClearColor(B),k=E.getClearAlpha(),k<1&&E.setClearColor(16777215,.5),E.clear(),Ze&&Ae.render(O);let me=E.toneMapping;E.toneMapping=qt;let Se=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),f.setupLightsView(G),X===!0&&$.setGlobalState(E.clippingPlanes,G),jr(M,O,G),y.updateMultisampleRenderTarget(ee),y.updateRenderTargetMipmap(ee),Ie.has("WEBGL_multisampled_render_to_texture")===!1){let ye=!1;for(let xe=0,Ke=L.length;xe<Ke;xe++){let Qe=L[xe],nt=Qe.object,Ot=Qe.geometry,We=Qe.material,Me=Qe.group;if(We.side===At&&nt.layers.test(G.layers)){let xt=We.side;We.side=et,We.needsUpdate=!0,la(nt,O,G,Ot,We,Me),We.side=xt,We.needsUpdate=!0,ye=!0}}ye===!0&&(y.updateMultisampleRenderTarget(ee),y.updateRenderTargetMipmap(ee))}E.setRenderTarget(pe),E.setClearColor(B,k),Se!==void 0&&(G.viewport=Se),E.toneMapping=me}function jr(M,L,O){let G=L.isScene===!0?L.overrideMaterial:null;for(let U=0,ee=M.length;U<ee;U++){let ne=M[U],pe=ne.object,me=ne.geometry,Se=G===null?ne.material:G,ye=ne.group;pe.layers.test(O.layers)&&la(pe,L,O,me,Se,ye)}}function la(M,L,O,G,U,ee){M.onBeforeRender(E,L,O,G,U,ee),M.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),U.onBeforeRender(E,L,O,G,M,ee),U.transparent===!0&&U.side===At&&U.forceSinglePass===!1?(U.side=et,U.needsUpdate=!0,E.renderBufferDirect(O,L,G,U,M,ee),U.side=zt,U.needsUpdate=!0,E.renderBufferDirect(O,L,G,U,M,ee),U.side=At):E.renderBufferDirect(O,L,G,U,M,ee),M.onAfterRender(E,L,O,G,U,ee)}function Jr(M,L,O){L.isScene!==!0&&(L=Ne);let G=Re.get(M),U=f.state.lights,ee=f.state.shadowsArray,ne=U.state.version,pe=ge.getParameters(M,U.state,ee,L,O),me=ge.getProgramCacheKey(pe),Se=G.programs;G.environment=M.isMeshStandardMaterial?L.environment:null,G.fog=L.fog,G.envMap=(M.isMeshStandardMaterial?N:x).get(M.envMap||G.environment),G.envMapRotation=G.environment!==null&&M.envMap===null?L.environmentRotation:M.envMapRotation,Se===void 0&&(M.addEventListener("dispose",Oe),Se=new Map,G.programs=Se);let ye=Se.get(me);if(ye!==void 0){if(G.currentProgram===ye&&G.lightsStateVersion===ne)return ha(M,pe),ye}else pe.uniforms=ge.getUniforms(M),M.onBeforeCompile(pe,E),ye=ge.acquireProgram(pe,me),Se.set(me,ye),G.uniforms=pe.uniforms;let xe=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(xe.clippingPlanes=$.uniform),ha(M,pe),G.needsLights=Eh(M),G.lightsStateVersion=ne,G.needsLights&&(xe.ambientLightColor.value=U.state.ambient,xe.lightProbe.value=U.state.probe,xe.directionalLights.value=U.state.directional,xe.directionalLightShadows.value=U.state.directionalShadow,xe.spotLights.value=U.state.spot,xe.spotLightShadows.value=U.state.spotShadow,xe.rectAreaLights.value=U.state.rectArea,xe.ltc_1.value=U.state.rectAreaLTC1,xe.ltc_2.value=U.state.rectAreaLTC2,xe.pointLights.value=U.state.point,xe.pointLightShadows.value=U.state.pointShadow,xe.hemisphereLights.value=U.state.hemi,xe.directionalShadowMap.value=U.state.directionalShadowMap,xe.directionalShadowMatrix.value=U.state.directionalShadowMatrix,xe.spotShadowMap.value=U.state.spotShadowMap,xe.spotLightMatrix.value=U.state.spotLightMatrix,xe.spotLightMap.value=U.state.spotLightMap,xe.pointShadowMap.value=U.state.pointShadowMap,xe.pointShadowMatrix.value=U.state.pointShadowMatrix),G.currentProgram=ye,G.uniformsList=null,ye}function ua(M){if(M.uniformsList===null){let L=M.currentProgram.getUniforms();M.uniformsList=Hi.seqWithValue(L.seq,M.uniforms)}return M.uniformsList}function ha(M,L){let O=Re.get(M);O.outputColorSpace=L.outputColorSpace,O.batching=L.batching,O.batchingColor=L.batchingColor,O.instancing=L.instancing,O.instancingColor=L.instancingColor,O.instancingMorph=L.instancingMorph,O.skinning=L.skinning,O.morphTargets=L.morphTargets,O.morphNormals=L.morphNormals,O.morphColors=L.morphColors,O.morphTargetsCount=L.morphTargetsCount,O.numClippingPlanes=L.numClippingPlanes,O.numIntersection=L.numClipIntersection,O.vertexAlphas=L.vertexAlphas,O.vertexTangents=L.vertexTangents,O.toneMapping=L.toneMapping}function vh(M,L,O,G,U){L.isScene!==!0&&(L=Ne),y.resetTextureUnits();let ee=L.fog,ne=G.isMeshStandardMaterial?L.environment:null,pe=b===null?E.outputColorSpace:b.isXRRenderTarget===!0?b.texture.colorSpace:Dt,me=(G.isMeshStandardMaterial?N:x).get(G.envMap||ne),Se=G.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,ye=!!O.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),xe=!!O.morphAttributes.position,Ke=!!O.morphAttributes.normal,Qe=!!O.morphAttributes.color,nt=qt;G.toneMapped&&(b===null||b.isXRRenderTarget===!0)&&(nt=E.toneMapping);let Ot=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,We=Ot!==void 0?Ot.length:0,Me=Re.get(G),xt=f.state.lights;if(X===!0&&(J===!0||M!==z)){let Wt=M===z&&G.id===D;$.setState(G,M,Wt)}let Xe=!1;G.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==xt.state.version||Me.outputColorSpace!==pe||U.isBatchedMesh&&Me.batching===!1||!U.isBatchedMesh&&Me.batching===!0||U.isBatchedMesh&&Me.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Me.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Me.instancing===!1||!U.isInstancedMesh&&Me.instancing===!0||U.isSkinnedMesh&&Me.skinning===!1||!U.isSkinnedMesh&&Me.skinning===!0||U.isInstancedMesh&&Me.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Me.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Me.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Me.instancingMorph===!1&&U.morphTexture!==null||Me.envMap!==me||G.fog===!0&&Me.fog!==ee||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==$.numPlanes||Me.numIntersection!==$.numIntersection)||Me.vertexAlphas!==Se||Me.vertexTangents!==ye||Me.morphTargets!==xe||Me.morphNormals!==Ke||Me.morphColors!==Qe||Me.toneMapping!==nt||Me.morphTargetsCount!==We)&&(Xe=!0):(Xe=!0,Me.__version=G.version);let $t=Me.currentProgram;Xe===!0&&($t=Jr(G,L,U));let cn=!1,Gt=!1,us=!1,at=$t.getUniforms(),wi=Me.uniforms;if(Te.useProgram($t.program)&&(cn=!0,Gt=!0,us=!0),G.id!==D&&(D=G.id,Gt=!0),cn||z!==M){ze.reverseDepthBuffer?(de.copy(M.projectionMatrix),rc(de),oc(de),at.setValue(w,"projectionMatrix",de)):at.setValue(w,"projectionMatrix",M.projectionMatrix),at.setValue(w,"viewMatrix",M.matrixWorldInverse);let Wt=at.map.cameraPosition;Wt!==void 0&&Wt.setValue(w,we.setFromMatrixPosition(M.matrixWorld)),ze.logarithmicDepthBuffer&&at.setValue(w,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&at.setValue(w,"isOrthographic",M.isOrthographicCamera===!0),z!==M&&(z=M,Gt=!0,us=!0)}if(U.isSkinnedMesh){at.setOptional(w,U,"bindMatrix"),at.setOptional(w,U,"bindMatrixInverse");let Wt=U.skeleton;Wt&&(Wt.boneTexture===null&&Wt.computeBoneTexture(),at.setValue(w,"boneTexture",Wt.boneTexture,y))}U.isBatchedMesh&&(at.setOptional(w,U,"batchingTexture"),at.setValue(w,"batchingTexture",U._matricesTexture,y),at.setOptional(w,U,"batchingIdTexture"),at.setValue(w,"batchingIdTexture",U._indirectTexture,y),at.setOptional(w,U,"batchingColorTexture"),U._colorsTexture!==null&&at.setValue(w,"batchingColorTexture",U._colorsTexture,y));let hs=O.morphAttributes;if((hs.position!==void 0||hs.normal!==void 0||hs.color!==void 0)&&be.update(U,O,$t),(Gt||Me.receiveShadow!==U.receiveShadow)&&(Me.receiveShadow=U.receiveShadow,at.setValue(w,"receiveShadow",U.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(wi.envMap.value=me,wi.flipEnvMap.value=me.isCubeTexture&&me.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&L.environment!==null&&(wi.envMapIntensity.value=L.environmentIntensity),Gt&&(at.setValue(w,"toneMappingExposure",E.toneMappingExposure),Me.needsLights&&Sh(wi,us),ee&&G.fog===!0&&te.refreshFogUniforms(wi,ee),te.refreshMaterialUniforms(wi,G,Q,V,f.state.transmissionRenderTarget[M.id]),Hi.upload(w,ua(Me),wi,y)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Hi.upload(w,ua(Me),wi,y),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&at.setValue(w,"center",U.center),at.setValue(w,"modelViewMatrix",U.modelViewMatrix),at.setValue(w,"normalMatrix",U.normalMatrix),at.setValue(w,"modelMatrix",U.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let Wt=G.uniformsGroups;for(let fs=0,yh=Wt.length;fs<yh;fs++){let fa=Wt[fs];P.update(fa,$t),P.bind(fa,$t)}}return $t}function Sh(M,L){M.ambientLightColor.needsUpdate=L,M.lightProbe.needsUpdate=L,M.directionalLights.needsUpdate=L,M.directionalLightShadows.needsUpdate=L,M.pointLights.needsUpdate=L,M.pointLightShadows.needsUpdate=L,M.spotLights.needsUpdate=L,M.spotLightShadows.needsUpdate=L,M.rectAreaLights.needsUpdate=L,M.hemisphereLights.needsUpdate=L}function Eh(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return b},this.setRenderTargetTextures=function(M,L,O){Re.get(M.texture).__webglTexture=L,Re.get(M.depthTexture).__webglTexture=O;let G=Re.get(M);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=O===void 0,G.__autoAllocateDepthBuffer||Ie.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,L){let O=Re.get(M);O.__webglFramebuffer=L,O.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(M,L=0,O=0){b=M,I=L,R=O;let G=!0,U=null,ee=!1,ne=!1;if(M){let me=Re.get(M);if(me.__useDefaultFramebuffer!==void 0)Te.bindFramebuffer(w.FRAMEBUFFER,null),G=!1;else if(me.__webglFramebuffer===void 0)y.setupRenderTarget(M);else if(me.__hasExternalTextures)y.rebindTextures(M,Re.get(M.texture).__webglTexture,Re.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let xe=M.depthTexture;if(me.__boundDepthTexture!==xe){if(xe!==null&&Re.has(xe)&&(M.width!==xe.image.width||M.height!==xe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");y.setupDepthRenderbuffer(M)}}let Se=M.texture;(Se.isData3DTexture||Se.isDataArrayTexture||Se.isCompressedArrayTexture)&&(ne=!0);let ye=Re.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(ye[L])?U=ye[L][O]:U=ye[L],ee=!0):M.samples>0&&y.useMultisampledRTT(M)===!1?U=Re.get(M).__webglMultisampledFramebuffer:Array.isArray(ye)?U=ye[O]:U=ye,_.copy(M.viewport),v.copy(M.scissor),F=M.scissorTest}else _.copy(ce).multiplyScalar(Q).floor(),v.copy(_e).multiplyScalar(Q).floor(),F=ke;if(Te.bindFramebuffer(w.FRAMEBUFFER,U)&&G&&Te.drawBuffers(M,U),Te.viewport(_),Te.scissor(v),Te.setScissorTest(F),ee){let me=Re.get(M.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_CUBE_MAP_POSITIVE_X+L,me.__webglTexture,O)}else if(ne){let me=Re.get(M.texture),Se=L||0;w.framebufferTextureLayer(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,me.__webglTexture,O||0,Se)}D=-1},this.readRenderTargetPixels=function(M,L,O,G,U,ee,ne){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pe=Re.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ne!==void 0&&(pe=pe[ne]),pe){Te.bindFramebuffer(w.FRAMEBUFFER,pe);try{let me=M.texture,Se=me.format,ye=me.type;if(!ze.textureFormatReadable(Se)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ze.textureTypeReadable(ye)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=M.width-G&&O>=0&&O<=M.height-U&&w.readPixels(L,O,G,U,Ce.convert(Se),Ce.convert(ye),ee)}finally{let me=b!==null?Re.get(b).__webglFramebuffer:null;Te.bindFramebuffer(w.FRAMEBUFFER,me)}}},this.readRenderTargetPixelsAsync=async function(M,L,O,G,U,ee,ne){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pe=Re.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ne!==void 0&&(pe=pe[ne]),pe){let me=M.texture,Se=me.format,ye=me.type;if(!ze.textureFormatReadable(Se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ze.textureTypeReadable(ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(L>=0&&L<=M.width-G&&O>=0&&O<=M.height-U){Te.bindFramebuffer(w.FRAMEBUFFER,pe);let xe=w.createBuffer();w.bindBuffer(w.PIXEL_PACK_BUFFER,xe),w.bufferData(w.PIXEL_PACK_BUFFER,ee.byteLength,w.STREAM_READ),w.readPixels(L,O,G,U,Ce.convert(Se),Ce.convert(ye),0);let Ke=b!==null?Re.get(b).__webglFramebuffer:null;Te.bindFramebuffer(w.FRAMEBUFFER,Ke);let Qe=w.fenceSync(w.SYNC_GPU_COMMANDS_COMPLETE,0);return w.flush(),await nc(w,Qe,4),w.bindBuffer(w.PIXEL_PACK_BUFFER,xe),w.getBufferSubData(w.PIXEL_PACK_BUFFER,0,ee),w.deleteBuffer(xe),w.deleteSync(Qe),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,L=null,O=0){M.isTexture!==!0&&(bn("WebGLRenderer: copyFramebufferToTexture function signature has changed."),L=arguments[0]||null,M=arguments[1]);let G=Math.pow(2,-O),U=Math.floor(M.image.width*G),ee=Math.floor(M.image.height*G),ne=L!==null?L.x:0,pe=L!==null?L.y:0;y.setTexture2D(M,0),w.copyTexSubImage2D(w.TEXTURE_2D,O,0,0,ne,pe,U,ee),Te.unbindTexture()},this.copyTextureToTexture=function(M,L,O=null,G=null,U=0){M.isTexture!==!0&&(bn("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,M=arguments[1],L=arguments[2],U=arguments[3]||0,O=null);let ee,ne,pe,me,Se,ye;O!==null?(ee=O.max.x-O.min.x,ne=O.max.y-O.min.y,pe=O.min.x,me=O.min.y):(ee=M.image.width,ne=M.image.height,pe=0,me=0),G!==null?(Se=G.x,ye=G.y):(Se=0,ye=0);let xe=Ce.convert(L.format),Ke=Ce.convert(L.type);y.setTexture2D(L,0),w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,L.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,L.unpackAlignment);let Qe=w.getParameter(w.UNPACK_ROW_LENGTH),nt=w.getParameter(w.UNPACK_IMAGE_HEIGHT),Ot=w.getParameter(w.UNPACK_SKIP_PIXELS),We=w.getParameter(w.UNPACK_SKIP_ROWS),Me=w.getParameter(w.UNPACK_SKIP_IMAGES),xt=M.isCompressedTexture?M.mipmaps[U]:M.image;w.pixelStorei(w.UNPACK_ROW_LENGTH,xt.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,xt.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,pe),w.pixelStorei(w.UNPACK_SKIP_ROWS,me),M.isDataTexture?w.texSubImage2D(w.TEXTURE_2D,U,Se,ye,ee,ne,xe,Ke,xt.data):M.isCompressedTexture?w.compressedTexSubImage2D(w.TEXTURE_2D,U,Se,ye,xt.width,xt.height,xe,xt.data):w.texSubImage2D(w.TEXTURE_2D,U,Se,ye,ee,ne,xe,Ke,xt),w.pixelStorei(w.UNPACK_ROW_LENGTH,Qe),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,nt),w.pixelStorei(w.UNPACK_SKIP_PIXELS,Ot),w.pixelStorei(w.UNPACK_SKIP_ROWS,We),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Me),U===0&&L.generateMipmaps&&w.generateMipmap(w.TEXTURE_2D),Te.unbindTexture()},this.copyTextureToTexture3D=function(M,L,O=null,G=null,U=0){M.isTexture!==!0&&(bn("WebGLRenderer: copyTextureToTexture3D function signature has changed."),O=arguments[0]||null,G=arguments[1]||null,M=arguments[2],L=arguments[3],U=arguments[4]||0);let ee,ne,pe,me,Se,ye,xe,Ke,Qe,nt=M.isCompressedTexture?M.mipmaps[U]:M.image;O!==null?(ee=O.max.x-O.min.x,ne=O.max.y-O.min.y,pe=O.max.z-O.min.z,me=O.min.x,Se=O.min.y,ye=O.min.z):(ee=nt.width,ne=nt.height,pe=nt.depth,me=0,Se=0,ye=0),G!==null?(xe=G.x,Ke=G.y,Qe=G.z):(xe=0,Ke=0,Qe=0);let Ot=Ce.convert(L.format),We=Ce.convert(L.type),Me;if(L.isData3DTexture)y.setTexture3D(L,0),Me=w.TEXTURE_3D;else if(L.isDataArrayTexture||L.isCompressedArrayTexture)y.setTexture2DArray(L,0),Me=w.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,L.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,L.unpackAlignment);let xt=w.getParameter(w.UNPACK_ROW_LENGTH),Xe=w.getParameter(w.UNPACK_IMAGE_HEIGHT),$t=w.getParameter(w.UNPACK_SKIP_PIXELS),cn=w.getParameter(w.UNPACK_SKIP_ROWS),Gt=w.getParameter(w.UNPACK_SKIP_IMAGES);w.pixelStorei(w.UNPACK_ROW_LENGTH,nt.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,nt.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,me),w.pixelStorei(w.UNPACK_SKIP_ROWS,Se),w.pixelStorei(w.UNPACK_SKIP_IMAGES,ye),M.isDataTexture||M.isData3DTexture?w.texSubImage3D(Me,U,xe,Ke,Qe,ee,ne,pe,Ot,We,nt.data):L.isCompressedArrayTexture?w.compressedTexSubImage3D(Me,U,xe,Ke,Qe,ee,ne,pe,Ot,nt.data):w.texSubImage3D(Me,U,xe,Ke,Qe,ee,ne,pe,Ot,We,nt),w.pixelStorei(w.UNPACK_ROW_LENGTH,xt),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,Xe),w.pixelStorei(w.UNPACK_SKIP_PIXELS,$t),w.pixelStorei(w.UNPACK_SKIP_ROWS,cn),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Gt),U===0&&L.generateMipmaps&&w.generateMipmap(Me),Te.unbindTexture()},this.initRenderTarget=function(M){Re.get(M).__webglFramebuffer===void 0&&y.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?y.setTextureCube(M,0):M.isData3DTexture?y.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?y.setTexture2DArray(M,0):y.setTexture2D(M,0),Te.unbindTexture()},this.resetState=function(){I=0,R=0,b=null,Te.reset(),je.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return It}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===vn?"display-p3":"srgb",t.unpackColorSpace=Ue.workingColorSpace===Yi?"display-p3":"srgb"}};var on=class extends rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new yt,this.environmentIntensity=1,this.environmentRotation=new yt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var Jt=class n extends _t{constructor(e=1,t=1,i=1,r=32,o=1,s=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:o,openEnded:s,thetaStart:a,thetaLength:c};let l=this;r=Math.floor(r),o=Math.floor(o);let h=[],p=[],d=[],m=[],g=0,S=[],f=i/2,u=0;A(),s===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new it(p,3)),this.setAttribute("normal",new it(d,3)),this.setAttribute("uv",new it(m,2));function A(){let T=new C,I=new C,R=0,b=(t-e)/i;for(let D=0;D<=o;D++){let z=[],_=D/o,v=_*(t-e)+e;for(let F=0;F<=r;F++){let B=F/r,k=B*c+a,Z=Math.sin(k),V=Math.cos(k);I.x=v*Z,I.y=-_*i+f,I.z=v*V,p.push(I.x,I.y,I.z),T.set(Z,b,V).normalize(),d.push(T.x,T.y,T.z),m.push(B,1-_),z.push(g++)}S.push(z)}for(let D=0;D<r;D++)for(let z=0;z<o;z++){let _=S[z][D],v=S[z+1][D],F=S[z+1][D+1],B=S[z][D+1];e>0&&(h.push(_,v,B),R+=3),t>0&&(h.push(v,F,B),R+=3)}l.addGroup(u,R,0),u+=R}function E(T){let I=g,R=new ve,b=new C,D=0,z=T===!0?e:t,_=T===!0?1:-1;for(let F=1;F<=r;F++)p.push(0,f*_,0),d.push(0,_,0),m.push(.5,.5),g++;let v=g;for(let F=0;F<=r;F++){let k=F/r*c+a,Z=Math.cos(k),V=Math.sin(k);b.x=z*V,b.y=f*_,b.z=z*Z,p.push(b.x,b.y,b.z),d.push(0,_,0),R.x=Z*.5+.5,R.y=V*.5*_+.5,m.push(R.x,R.y),g++}for(let F=0;F<r;F++){let B=I+F,k=v+F;T===!0?h.push(k,k+1,B):h.push(k+1,k,B),D+=3}l.addGroup(u,D,T===!0?1:2),u+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Qn=class n extends Jt{constructor(e=1,t=1,i=32,r=1,o=!1,s=0,a=Math.PI*2){super(0,e,t,i,r,o,s,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:s,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var er=class n extends _t{constructor(e=1,t=32,i=16,r=0,o=Math.PI*2,s=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:o,thetaStart:s,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(s+a,Math.PI),l=0,h=[],p=new C,d=new C,m=[],g=[],S=[],f=[];for(let u=0;u<=i;u++){let A=[],E=u/i,T=0;u===0&&s===0?T=.5/t:u===i&&c===Math.PI&&(T=-.5/t);for(let I=0;I<=t;I++){let R=I/t;p.x=-e*Math.cos(r+R*o)*Math.sin(s+E*a),p.y=e*Math.cos(s+E*a),p.z=e*Math.sin(r+R*o)*Math.sin(s+E*a),g.push(p.x,p.y,p.z),d.copy(p).normalize(),S.push(d.x,d.y,d.z),f.push(R+T,1-E),A.push(l++)}h.push(A)}for(let u=0;u<i;u++)for(let A=0;A<t;A++){let E=h[u][A+1],T=h[u][A],I=h[u+1][A],R=h[u+1][A+1];(u!==0||s>0)&&m.push(E,T,R),(u!==i-1||c<Math.PI)&&m.push(T,I,R)}this.setIndex(m),this.setAttribute("position",new it(g,3)),this.setAttribute("normal",new it(S,3)),this.setAttribute("uv",new it(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var sn=class n extends _t{constructor(e=1,t=.4,i=12,r=48,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:o},i=Math.floor(i),r=Math.floor(r);let s=[],a=[],c=[],l=[],h=new C,p=new C,d=new C;for(let m=0;m<=i;m++)for(let g=0;g<=r;g++){let S=g/r*o,f=m/i*Math.PI*2;p.x=(e+t*Math.cos(f))*Math.cos(S),p.y=(e+t*Math.cos(f))*Math.sin(S),p.z=t*Math.sin(f),a.push(p.x,p.y,p.z),h.x=e*Math.cos(S),h.y=e*Math.sin(S),d.subVectors(p,h).normalize(),c.push(d.x,d.y,d.z),l.push(g/r),l.push(m/i)}for(let m=1;m<=i;m++)for(let g=1;g<=r;g++){let S=(r+1)*m+g-1,f=(r+1)*(m-1)+g-1,u=(r+1)*(m-1)+g,A=(r+1)*m+g;s.push(S,f,A),s.push(f,u,A)}this.setIndex(s),this.setAttribute("position",new it(a,3)),this.setAttribute("normal",new it(c,3)),this.setAttribute("uv",new it(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Wi=class extends Kt{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Pe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Pe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Mo,this.normalScale=new ve(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var li=class extends Wi{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ve(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ct(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Pe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Pe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Pe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Xi=class extends rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Pe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}};var ia=new Ge,rh=new C,oh=new C,tr=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ve(512,512),this.map=null,this.mapPass=null,this.matrix=new Ge,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new zi,this._frameExtents=new ve(1,1),this._viewportCount=1,this._viewports=[new De(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;rh.setFromMatrixPosition(e.matrixWorld),t.position.copy(rh),oh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(oh),t.updateMatrixWorld(),ia.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ia),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ia)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var sh=new Ge,qr=new C,na=new C,ss=class extends tr{constructor(){super(new ot(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ve(4,2),this._viewportCount=6,this._viewports=[new De(2,1,1,1),new De(0,1,1,1),new De(3,1,1,1),new De(1,1,1,1),new De(3,0,1,1),new De(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,r=this.matrix,o=e.distance||i.far;o!==i.far&&(i.far=o,i.updateProjectionMatrix()),qr.setFromMatrixPosition(e.matrixWorld),i.position.copy(qr),na.copy(i.position),na.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(na),i.updateMatrixWorld(),r.makeTranslation(-qr.x,-qr.y,-qr.z),sh.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(sh)}};var Yr=class extends Xi{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new ss}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}};var as=class extends tr{constructor(){super(new Yn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}};var ir=class extends Xi{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(rt.DEFAULT_UP),this.updateMatrix(),this.target=new rt,this.shadow=new as}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Kr=class extends Xi{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:rr}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=rr);function ah(){return{navy:new li({color:664896,roughness:.35,metalness:.12,clearcoat:.25,clearcoatRoughness:.15}),deepBlue:new li({color:863079,roughness:.3,metalness:.18,clearcoat:.2}),royalBlue:new li({color:1333721,roughness:.38,metalness:.1,clearcoat:.32,clearcoatRoughness:.18}),ivory:new li({color:16447731,roughness:.55,metalness:.04,clearcoat:.12}),paper:new li({color:16777215,roughness:.6,metalness:.02,clearcoat:.08}),brass:new li({color:11766591,roughness:.22,metalness:.88,clearcoat:.4,clearcoatRoughness:.12}),sky:new li({color:3900150,roughness:.3,metalness:.15,clearcoat:.25}),shadow:new ai({color:664896,transparent:!0,opacity:.14,depthWrite:!1,side:At})}}function ch(n){let e=new gt;e.name="sphereCore";let t=new er(1,48,48),i=new se(t,n.royalBlue);e.add(i);let r=new sn(1.52,.032,16,80),o=new se(r,n.brass);o.rotation.x=Math.PI*.35,o.rotation.y=Math.PI*.15,e.add(o);let s=new er(.12,24,24),a=new se(s,n.brass);return a.position.set(1.52*Math.cos(.8),.45,1.52*Math.sin(.8)),e.add(a),e}function lh(n){let e=new gt;e.name="graduationCap";let t=new Jt(.48,.58,.38,32),i=new se(t,n.navy);i.position.y=.19,e.add(i);let r=new tt(1.6,.045,1.6),o=new se(r,n.navy);o.position.y=.4,o.rotation.y=Math.PI*.25,e.add(o);let s=new Jt(.08,.08,.04,16),a=new se(s,n.brass);a.position.y=.435,e.add(a);let c=new Jt(.016,.016,.65,8),l=new se(c,n.brass);l.position.set(.42,.18,.42),l.rotation.z=-.35,e.add(l);let h=new Qn(.065,.18,16),p=new se(h,n.brass);return p.position.set(.56,-.15,.56),p.rotation.x=Math.PI,e.add(p),e}function uh(n){let e=new gt;e.name="academicBooks";let t=new se(new tt(1.6,.24,1.15),n.navy);t.position.set(-.35,.12,0);let i=new se(new tt(1.52,.18,1.08),n.ivory);i.position.set(-.32,.12,0),e.add(t,i);let r=new se(new tt(1.5,.22,1.1),n.royalBlue);r.position.set(-.32,.35,0),r.rotation.y=.12;let o=new se(new tt(1.42,.16,1.03),n.ivory);o.position.set(-.3,.35,0),o.rotation.y=.12,e.add(r,o);let s=new gt;s.position.set(.65,.48,.15),s.rotation.x=.25,s.rotation.y=-.2;let a=new se(new tt(.62,.06,.85),n.ivory);a.position.set(-.3,0,0),a.rotation.z=.14;let c=new se(new tt(.62,.06,.85),n.ivory);c.position.set(.3,0,0),c.rotation.z=-.14;let l=new se(new tt(.12,.08,.86),n.deepBlue);return l.position.set(0,-.04,0),s.add(a,c,l),e.add(s),e}function hh(n){let e=new gt;e.name="calendarSlab";let t=new se(new tt(1.3,1.5,.1),n.paper);e.add(t);let i=new se(new tt(1.3,.38,.12),n.royalBlue);i.position.set(0,.56,.01),e.add(i);let r=new sn(.09,.022,12,24),o=new se(r,n.brass);o.position.set(-.38,.78,0),o.rotation.y=Math.PI*.5;let s=new se(r,n.brass);s.position.set(.38,.78,0),s.rotation.y=Math.PI*.5,e.add(o,s);for(let a=0;a<3;a++)for(let c=0;c<4;c++){let l=new se(new Jt(.04,.04,.11,12),n.deepBlue);l.position.set(-.38+c*.25,.22-a*.24,.01),l.rotation.x=Math.PI*.5,e.add(l)}return e}function fh(n){let e=new gt;e.name="barPillars";let t=[{x:-.66,height:.65,mat:n.navy},{x:-.22,height:1.15,mat:n.deepBlue},{x:.22,height:1.65,mat:n.royalBlue},{x:.66,height:2.15,mat:n.sky}],i=[];return t.forEach(r=>{let o=new tt(.34,r.height,.34);o.translate(0,r.height/2,0);let s=new se(o,r.mat);s.position.set(r.x,0,0),s.userData.baseHeight=r.height,e.add(s),i.push(s)}),e.userData.pillars=i,e}function ph(n){let e=new gt;e.name="secureShield";let t=new tt(1.2,1.4,.12),i=new se(t,n.navy);e.add(i);let r=new Qn(.6,.65,4),o=new se(r,n.navy);o.position.set(0,-.92,0),o.rotation.y=Math.PI*.25,o.rotation.x=Math.PI,e.add(o);let s=new se(new tt(.24,.09,.16),n.ivory);s.position.set(-.16,-.06,.05),s.rotation.z=Math.PI*.25;let a=new se(new tt(.55,.09,.16),n.ivory);return a.position.set(.12,.06,.05),a.rotation.z=-Math.PI*.32,e.add(s,a),e}function dh(n){let e=new gt;e.name="speechBubble";let t=new se(new Jt(.75,.75,.16,32),n.royalBlue);t.rotation.x=Math.PI*.5,e.add(t);let i=new se(new Qn(.25,.5,16),n.royalBlue);i.position.set(-.45,-.65,0),i.rotation.z=Math.PI*.75,e.add(i);let r=new se(new Jt(.45,.45,.18,24),n.ivory);return r.rotation.x=Math.PI*.5,e.add(r),e}function mh(n){let e=new gt;e.name="noticesBell";let t=new se(new Jt(.25,.75,.95,32),n.brass);t.position.y=.45,e.add(t);let i=new se(new sn(.75,.08,16,48),n.brass);i.position.y=-.02,i.rotation.x=Math.PI*.5,e.add(i);let r=new se(new sn(.18,.04,12,24),n.brass);r.position.y=1.05,e.add(r);let o=new se(new er(.16,20,20),n.brass);return o.position.y=-.08,e.add(o),e}function _h(n){let e=new Vi(4.5,4.5),t=new se(e,n.shadow);return t.name="contactShadow",t.rotation.x=-Math.PI*.5,t.position.y=-1.6,t}var cs=class extends on{constructor(){super();let e=new tt;e.deleteAttribute("uv");let t=new Wi({side:et}),i=new Wi,r=new Yr(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let o=new se(e,t);o.position.set(-.757,13.219,.717),o.scale.set(31.713,28.305,28.591),this.add(o);let s=new se(e,i);s.position.set(-10.906,2.009,1.846),s.rotation.set(0,-.195,0),s.scale.set(2.328,7.905,4.651),this.add(s);let a=new se(e,i);a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),this.add(a);let c=new se(e,i);c.position.set(6.167,.857,7.803),c.rotation.set(0,.561,0),c.scale.set(3.927,6.285,3.687),this.add(c);let l=new se(e,i);l.position.set(-2.017,.018,6.124),l.rotation.set(0,.333,0),l.scale.set(2.002,4.566,2.064),this.add(l);let h=new se(e,i);h.position.set(2.291,-.756,-2.621),h.rotation.set(0,-.286,0),h.scale.set(1.546,1.552,1.496),this.add(h);let p=new se(e,i);p.position.set(-2.193,-.369,-5.547),p.rotation.set(0,.516,0),p.scale.set(3.875,3.487,2.986),this.add(p);let d=new se(e,nr(50));d.position.set(-16.116,14.37,8.208),d.scale.set(.1,2.428,2.739),this.add(d);let m=new se(e,nr(50));m.position.set(-16.109,18.021,-8.207),m.scale.set(.1,2.425,2.751),this.add(m);let g=new se(e,nr(17));g.position.set(14.904,12.198,-1.832),g.scale.set(.15,4.265,6.331),this.add(g);let S=new se(e,nr(43));S.position.set(-.462,8.89,14.52),S.scale.set(4.38,5.441,.088),this.add(S);let f=new se(e,nr(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let u=new se(e,nr(100));u.position.set(0,20,0),u.scale.set(1,.1,1),this.add(u)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function nr(n){let e=new ai;return e.color.setScalar(n),e}function gh(n){let e=new on,t=n.clientWidth/(n.clientHeight||1),i=new ot(38,t,.1,50);i.position.set(0,0,7.5);let r=new Xr({canvas:n,alpha:!0,antialias:!0,powerPreference:"high-performance",preserveDrawingBuffer:!1}),s=Math.min(window.devicePixelRatio||1,1.75);r.setPixelRatio(s),r.setSize(n.clientWidth,n.clientHeight,!1);let a=new ki(r);a.compileEquirectangularShader();let c=new cs,l=a.fromScene(c,.04).texture;e.environment=l,c.dispose(),a.dispose();let h=new ir(16447731,1.3);h.position.set(4,7,5),e.add(h);let p=new Kr(16513266,.55);e.add(p);let d=new ir(50943,.65);d.position.set(-5,2,-4),e.add(d);let m=[],g=performance.now(),S=0;function f(){let T=performance.now(),I=T-g;if(g=T,S++,I>0&&I<200&&(m.push(I),m.length>60&&m.shift()),S===180){let R=m.reduce((D,z)=>D+z,0)/(m.length||1),b=Math.round(1e3/R);console.info(`[CampusSphere 3D] Running at ~${b} FPS (avg frame time: ${R.toFixed(2)}ms)`)}}function u(T){T.preventDefault(),console.warn("[CampusSphere 3D] WebGL Context Lost"),n.parentElement&&n.parentElement.classList.remove("webgl-active")}function A(){console.info("[CampusSphere 3D] WebGL Context Restored"),n.parentElement&&n.parentElement.classList.add("webgl-active")}n.addEventListener("webglcontextlost",u,!1),n.addEventListener("webglcontextrestored",A,!1);function E(){n.removeEventListener("webglcontextlost",u),n.removeEventListener("webglcontextrestored",A),e.traverse(T=>{T.isMesh&&(T.geometry&&T.geometry.dispose(),T.material&&(Array.isArray(T.material)?T.material.forEach(I=>I.dispose()):T.material.dispose()))}),e.environment&&(e.environment.dispose(),e.environment=null),r.dispose(),r.forceContextLoss(),n.parentElement&&n.parentElement.classList.remove("webgl-active")}return{scene:e,camera:i,renderer:r,monitorPerformance:f,destroy:E}}function xh(n,e,t,i="home"){let{sphere:r,cap:o,books:s,calendar:a,pillars:c,shield:l,speech:h,bell:p,shadow:d}=n,m={x:0,y:0,targetX:0,targetY:0},g=Math.PI*(6/180),S=0,f=0,u=null,A=.5;function E(){if(i!=="home")return;let z=document.querySelector(".home-hero-copy")||document.querySelector(".hero-copy");if(z&&t){let v=z.getBoundingClientRect().right/window.innerWidth*2-1,F=2*Math.tan(e.fov*Math.PI/360)*e.position.z;A=v*F/2+.35}}function T(z){m.targetX=z.clientX/window.innerWidth*2-1,m.targetY=-(z.clientY/window.innerHeight)*2+1}function I(){let z=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);f=Math.min(1,Math.max(0,window.scrollY/z))}document.querySelectorAll(".feature-card").forEach((z,_)=>{z.setAttribute("data-3d-anchor",`feature-${_+1}`),z.addEventListener("mouseenter",()=>{u=_}),z.addEventListener("mouseleave",()=>{u===_&&(u=null)}),z.addEventListener("focusin",()=>{u=_}),z.addEventListener("focusout",()=>{u===_&&(u=null)})}),window.addEventListener("pointermove",T,{passive:!0}),window.addEventListener("scroll",I,{passive:!0}),window.addEventListener("resize",E,{passive:!0}),E();function b(z,_){if(m.x+=(m.targetX-m.x)*.06,m.y+=(m.targetY-m.y)*.06,S+=(f-S)*.08,i==="home"){let v=S;if(v<.22){let F=v/.22,B=Math.max(A+.4,1.85);r.position.set(B,.2-F*.4,0),r.scale.setScalar(1.05),r.rotation.y=z*.25,r.rotation.x=m.y*g,r.rotation.z=-m.x*g;let k=z*.45;o.position.set(B+Math.cos(k)*1.7,.8+Math.sin(k*.8)*.35,Math.sin(k)*1.1),o.rotation.y=z*.35,o.scale.setScalar(.72);let Z=k+Math.PI;s.position.set(B+Math.cos(Z)*1.8,-.6+Math.sin(Z*.8)*.3,Math.sin(Z)*1.2),s.rotation.y=-z*.25,s.scale.setScalar(.68),a.position.set(B+4,0,-5),c.position.set(B+4,-4,-5),l.position.set(B+4,0,-5),p.position.set(B+4,0,-5),h.position.set(B+4,0,-5),d&&(d.position.set(B,-1.8,0),d.scale.setScalar(1))}else if(v>=.22&&v<.52){let F=(v-.22)/.3;r.position.set(2.4,.8-F*.5,-1.5),r.scale.setScalar(.65),r.rotation.y=z*.2,s.position.set(-2.2,.4-F*.3,0),s.scale.setScalar(.78),s.rotation.y=u===0?z*.8:z*.2,o.position.set(2.1,.3-F*.3,0),o.scale.setScalar(.8),o.rotation.y=u===1?z*.8:z*.25,a.position.set(-2.1,-.6-F*.2,0),a.scale.setScalar(.75),a.rotation.y=u===2?z*.8:.15+Math.sin(z*.5)*.1,p.position.set(2.2,-.7-F*.2,0),p.scale.setScalar(.75),p.rotation.z=u===3?Math.sin(z*6)*.15:Math.sin(z*1.5)*.05,l.position.set(0,-5,-5),h.position.set(0,-5,-5),c.position.set(0,-5,-5),d&&d.position.set(0,-1.8,-1)}else if(v>=.52&&v<.75){let F=Math.min(1,Math.max(0,(v-.52)/.18));c.position.set(1.6,-1.4,0),c.scale.set(.9,.2+F*.8,.9),c.rotation.y=-.35+z*.1,r.position.set(-2.1,.6,-.8),r.scale.setScalar(.68),r.rotation.y=z*.2,o.position.set(-1.8,-.6,-.5),o.scale.setScalar(.65),o.rotation.y=z*.2,s.position.set(4,0,-5),a.position.set(4,0,-5),l.position.set(4,0,-5),p.position.set(4,0,-5),d&&(d.position.set(1.6,-1.45,0),d.scale.setScalar(.8))}else{let F=(v-.75)/.25;r.position.set(-2.2,-.4-F*.4,-.5),r.scale.setScalar(.55*(1-F*.4)),r.rotation.y=z*.15,o.position.set(2.3,-.5-F*.4,-.5),o.scale.setScalar(.55*(1-F*.4)),l.position.set(0,-.8-F*.5,0),l.scale.setScalar(.65*(1-F*.3)),l.rotation.y=Math.sin(z*.6)*.2,s.position.set(0,-6,-5),a.position.set(0,-6,-5),c.position.set(0,-6,-5),p.position.set(0,-6,-5),h.position.set(0,-6,-5),d&&(d.position.set(0,-2.2,0),d.scale.setScalar(.5*(1-F*.5)))}}else i==="courses"?(s.position.set(-.7,0,0),s.scale.setScalar(.95),s.rotation.y=-.3+m.x*g,s.rotation.x=m.y*g,o.position.set(.9,.25,0),o.scale.setScalar(.85),o.rotation.y=z*.3,r.position.set(0,10,0),a.position.set(0,10,0),c.position.set(0,10,0),l.position.set(0,10,0),p.position.set(0,10,0),h.position.set(0,10,0)):i==="about"?(r.position.set(-.75,0,0),r.scale.setScalar(.95),r.rotation.y=z*.25+m.x*g,r.rotation.x=m.y*g,l.position.set(.85,0,0),l.scale.setScalar(.92),l.rotation.y=-.2+Math.sin(z*.8)*.15,o.position.set(0,10,0),s.position.set(0,10,0),a.position.set(0,10,0),c.position.set(0,10,0),p.position.set(0,10,0),h.position.set(0,10,0)):i==="students"&&(o.position.set(-.65,.1,0),o.scale.setScalar(.95),o.rotation.y=z*.35+m.x*g,o.rotation.x=m.y*g,c.position.set(.85,-.65,0),c.scale.setScalar(.85),c.rotation.y=-.35,r.position.set(0,10,0),s.position.set(0,10,0),a.position.set(0,10,0),l.position.set(0,10,0),p.position.set(0,10,0),h.position.set(0,10,0))}function D(){window.removeEventListener("pointermove",T),window.removeEventListener("scroll",I),window.removeEventListener("resize",E)}return{update:b,destroy:D}}var an=null;function ra(){try{if(!document.createElement("canvas").getContext("webgl2"))return!1}catch{return!1}if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches||navigator.connection&&navigator.connection.saveData===!0)return!1;let n=window.innerWidth>=900,e=typeof navigator.hardwareConcurrency=="number"&&navigator.hardwareConcurrency>=6;return!(!n&&!e)}function Zr(){if(an)return an;let n=document.getElementById("campus3d")||document.getElementById("heroCanvas"),e=document.getElementById("heroStaticPoster")||document.querySelector(".hero-poster");if(!n)return null;if(!ra())return console.info("[CampusSphere 3D] Capability gate or preference: using static poster fallback."),n&&(n.style.display="none"),e&&(e.style.display="block"),document.body.classList.add("poster-fallback-active"),null;let t=n.getAttribute("data-3d-preset")||"home",i=gh(n),r=ah(),o=ch(r),s=lh(r),a=uh(r),c=hh(r),l=fh(r),h=ph(r),p=dh(r),d=mh(r),m=_h(r);i.scene.add(o,s,a,c,l,h,p,d,m);let g=xh({sphere:o,cap:s,books:a,calendar:c,pillars:l,shield:h,speech:p,bell:d,shadow:m},i.camera,n,t);window.__campusSphere3DActive=!0,n.style.display="block",e&&(e.style.display="none"),document.body.classList.add("webgl-active"),n.parentElement&&n.parentElement.classList.add("webgl-active");let S=!0,f=!document.hidden,u=null,A=performance.now(),E=A;function T(z){if(!window.__campusSphere3DActive||(u=requestAnimationFrame(T),!S||!f))return;let _=Math.min((z-A)/1e3,.1);A=z;let v=(z-E)/1e3;i.monitorPerformance(),g.update(v,_),i.renderer.render(i.scene,i.camera)}u=requestAnimationFrame(T);function I(){if(!n||!window.__campusSphere3DActive)return;let z=n.clientWidth||window.innerWidth,_=n.clientHeight||window.innerHeight;i.camera.aspect=z/(_||1),i.camera.updateProjectionMatrix(),i.renderer.setSize(z,_,!1)}window.addEventListener("resize",I,{passive:!0});let R=null;"IntersectionObserver"in window&&(R=new IntersectionObserver(z=>{z.forEach(_=>{S=_.isIntersecting})},{threshold:.05}),R.observe(n));function b(){f=!document.hidden}document.addEventListener("visibilitychange",b);function D(){window.__campusSphere3DActive=!1,u&&(cancelAnimationFrame(u),u=null),window.removeEventListener("resize",I),document.removeEventListener("visibilitychange",b),R&&(R.disconnect(),R=null),g.destroy(),i.destroy(),document.body.classList.remove("webgl-active"),n&&n.parentElement&&n.parentElement.classList.remove("webgl-active"),an=null,console.info("[CampusSphere 3D] Renderer destroyed and GPU memory released.")}return an={destroy:D,env:i,ch:g},window.CampusSphereDestroy3D=D,window.CampusSphereInit3D=Zr,an}function Dd(){if(an)an.destroy();else{window.__campusSphere3DActive=!1,document.body.classList.remove("webgl-active");let n=document.getElementById("campus3d")||document.getElementById("heroCanvas");n&&n.parentElement&&n.parentElement.classList.remove("webgl-active")}}function Id(){let n=window.openPortal;typeof n=="function"&&!window.__portalTeardownHooked&&(window.__portalTeardownHooked=!0,window.openPortal=function(...e){return typeof window.CampusSphereDestroy3D=="function"&&window.CampusSphereDestroy3D(),n.apply(this,e)}),window.addEventListener("campussphere:auth-login",()=>{typeof window.CampusSphereDestroy3D=="function"&&window.CampusSphereDestroy3D()})}function Mh(){Id(),"requestIdleCallback"in window?requestIdleCallback(()=>Zr()):setTimeout(Zr,100)}typeof window<"u"&&(window.CampusSphereInit3D=Zr,window.CampusSphereCanRun3D=ra,window.CampusSphereDestroy3D=Dd,document.readyState==="complete"?Mh():window.addEventListener("load",Mh,{once:!0}));return Ch(Fd);})();
