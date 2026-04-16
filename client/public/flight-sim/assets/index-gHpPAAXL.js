(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();const sh="182",Kp=0,Qh=1,$p=2,$a=1,Jp=2,Ar=3,Ti=0,gn=1,on=2,yi=0,zi=1,mn=2,eu=3,tu=4,Zp=5,as=100,Qp=101,em=102,tm=103,nm=104,im=200,sm=201,rm=202,am=203,Xl=204,ql=205,om=206,lm=207,cm=208,hm=209,um=210,dm=211,fm=212,pm=213,mm=214,Yl=0,jl=1,Kl=2,js=3,$l=4,Jl=5,Zl=6,Ql=7,rh=0,gm=1,_m=2,ii=0,tf=1,nf=2,sf=3,rf=4,af=5,of=6,lf=7,nu="attached",xm="detached",cf=300,ps=301,Ks=302,ec=303,tc=304,Co=306,$s=1e3,ti=1001,ho=1002,Ot=1003,hf=1004,Rr=1005,Et=1006,Ja=1007,_i=1008,Cn=1009,uf=1010,df=1011,zr=1012,ah=1013,ri=1014,Fn=1015,wi=1016,oh=1017,lh=1018,Vr=1020,ff=35902,pf=35899,mf=1021,gf=1022,Un=1023,Ei=1026,cs=1027,ch=1028,hh=1029,Js=1030,uh=1031,dh=1033,Za=33776,Qa=33777,eo=33778,to=33779,nc=35840,ic=35841,sc=35842,rc=35843,ac=36196,oc=37492,lc=37496,cc=37488,hc=37489,uc=37490,dc=37491,fc=37808,pc=37809,mc=37810,gc=37811,_c=37812,xc=37813,vc=37814,yc=37815,Mc=37816,Sc=37817,bc=37818,Tc=37819,wc=37820,Ec=37821,Cc=36492,Ac=36494,Rc=36495,Pc=36283,Ic=36284,Lc=36285,Nc=36286,fh=2200,_f=2201,vm=2202,Hr=2300,Gr=2301,Go=2302,Gs=2400,Ws=2401,uo=2402,ph=2500,ym=2501,Mm=0,xf=1,Dc=2,Sm=3200,mh=0,bm=1,Oi="",qt="srgb",cn="srgb-linear",fo="linear",ut="srgb",Ms=7680,iu=519,Tm=512,wm=513,Em=514,gh=515,Cm=516,Am=517,_h=518,Rm=519,Fc=35044,su="300 es",ni=2e3,po=2001;function vf(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Pm(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Wr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Im(){const s=Wr("canvas");return s.style.display="block",s}const ru={};function mo(...s){const e="THREE."+s.shift();console.log(e,...s)}function we(...s){const e="THREE."+s.shift();console.warn(e,...s)}function ke(...s){const e="THREE."+s.shift();console.error(e,...s)}function Xr(...s){const e=s.join(" ");e in ru||(ru[e]=!0,we(...s))}function Lm(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}class xs{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}}const $t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let au=1234567;const Nr=Math.PI/180,Zs=180/Math.PI;function Bn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return($t[s&255]+$t[s>>8&255]+$t[s>>16&255]+$t[s>>24&255]+"-"+$t[e&255]+$t[e>>8&255]+"-"+$t[e>>16&15|64]+$t[e>>24&255]+"-"+$t[t&63|128]+$t[t>>8&255]+"-"+$t[t>>16&255]+$t[t>>24&255]+$t[n&255]+$t[n>>8&255]+$t[n>>16&255]+$t[n>>24&255]).toLowerCase()}function Je(s,e,t){return Math.max(e,Math.min(t,s))}function xh(s,e){return(s%e+e)%e}function Nm(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function Dm(s,e,t){return s!==e?(t-s)/(e-s):0}function Dr(s,e,t){return(1-t)*s+t*e}function Fm(s,e,t,n){return Dr(s,e,1-Math.exp(-t*n))}function Um(s,e=1){return e-Math.abs(xh(s,e*2)-e)}function Om(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Bm(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function km(s,e){return s+Math.floor(Math.random()*(e-s+1))}function zm(s,e){return s+Math.random()*(e-s)}function Vm(s){return s*(.5-Math.random())}function Hm(s){s!==void 0&&(au=s);let e=au+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Gm(s){return s*Nr}function Wm(s){return s*Zs}function Xm(s){return(s&s-1)===0&&s!==0}function qm(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Ym(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function jm(s,e,t,n,i){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":s.set(o*h,l*u,l*d,o*c);break;case"YZY":s.set(l*d,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*d,o*h,o*c);break;case"XZX":s.set(o*h,l*m,l*f,o*c);break;case"YXY":s.set(l*f,o*h,l*m,o*c);break;case"ZYZ":s.set(l*m,l*f,o*h,o*c);break;default:we("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function qn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function ft(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Ft={DEG2RAD:Nr,RAD2DEG:Zs,generateUUID:Bn,clamp:Je,euclideanModulo:xh,mapLinear:Nm,inverseLerp:Dm,lerp:Dr,damp:Fm,pingpong:Um,smoothstep:Om,smootherstep:Bm,randInt:km,randFloat:zm,randFloatSpread:Vm,seededRandom:Hm,degToRad:Gm,radToDeg:Wm,isPowerOfTwo:Xm,ceilPowerOfTwo:qm,floorPowerOfTwo:Ym,setQuaternionFromProperEuler:jm,normalize:ft,denormalize:qn};class re{constructor(e=0,t=0){re.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Bt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3],d=r[a+0],f=r[a+1],m=r[a+2],_=r[a+3];if(o<=0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o>=1){e[t+0]=d,e[t+1]=f,e[t+2]=m,e[t+3]=_;return}if(u!==_||l!==d||c!==f||h!==m){let g=l*d+c*f+h*m+u*_;g<0&&(d=-d,f=-f,m=-m,_=-_,g=-g);let p=1-o;if(g<.9995){const T=Math.acos(g),S=Math.sin(T);p=Math.sin(p*T)/S,o=Math.sin(o*T)/S,l=l*p+d*o,c=c*p+f*o,h=h*p+m*o,u=u*p+_*o}else{l=l*p+d*o,c=c*p+f*o,h=h*p+m*o,u=u*p+_*o;const T=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=T,c*=T,h*=T,u*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],d=r[a+1],f=r[a+2],m=r[a+3];return e[t]=o*m+h*u+l*f-c*d,e[t+1]=l*m+h*d+c*u-o*f,e[t+2]=c*m+h*f+o*d-l*u,e[t+3]=h*m-o*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),d=l(n/2),f=l(i/2),m=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:we("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-i)*f}else if(n>o&&n>u){const f=2*Math.sqrt(1+n-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(r+c)/f}else if(o>u){const f=2*Math.sqrt(1+o-n-u);this._w=(r-c)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-o);this._w=(a-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Je(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let n=e._x,i=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,i=-i,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(e=0,t=0,n=0){I.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ou.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ou.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-r*i),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Wo.copy(this).projectOnVector(e),this.sub(Wo)}reflect(e){return this.sub(Wo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Wo=new I,ou=new Bt;class Ye{constructor(e,t,n,i,r,a,o,l,c){Ye.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,l,c)}set(e,t,n,i,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],m=n[8],_=i[0],g=i[3],p=i[6],T=i[1],S=i[4],y=i[7],w=i[2],P=i[5],C=i[8];return r[0]=a*_+o*T+l*w,r[3]=a*g+o*S+l*P,r[6]=a*p+o*y+l*C,r[1]=c*_+h*T+u*w,r[4]=c*g+h*S+u*P,r[7]=c*p+h*y+u*C,r[2]=d*_+f*T+m*w,r[5]=d*g+f*S+m*P,r[8]=d*p+f*y+m*C,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,f=c*r-a*l,m=t*u+n*d+i*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/m;return e[0]=u*_,e[1]=(i*c-h*n)*_,e[2]=(o*n-i*a)*_,e[3]=d*_,e[4]=(h*t-i*l)*_,e[5]=(i*r-o*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Xo.makeScale(e,t)),this}rotate(e){return this.premultiply(Xo.makeRotation(-e)),this}translate(e,t){return this.premultiply(Xo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Xo=new Ye,lu=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),cu=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Km(){const s={enabled:!0,workingColorSpace:cn,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ut&&(i.r=Mi(i.r),i.g=Mi(i.g),i.b=Mi(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ut&&(i.r=qs(i.r),i.g=qs(i.g),i.b=qs(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Oi?fo:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Xr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Xr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[cn]:{primaries:e,whitePoint:n,transfer:fo,toXYZ:lu,fromXYZ:cu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:qt},outputColorSpaceConfig:{drawingBufferColorSpace:qt}},[qt]:{primaries:e,whitePoint:n,transfer:ut,toXYZ:lu,fromXYZ:cu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:qt}}}),s}const nt=Km();function Mi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function qs(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Ss;class $m{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ss===void 0&&(Ss=Wr("canvas")),Ss.width=e.width,Ss.height=e.height;const i=Ss.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Ss}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Wr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=Mi(r[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Mi(t[n]/255)*255):t[n]=Mi(t[n]);return{data:t,width:e.width,height:e.height}}else return we("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Jm=0;class vh{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Jm++}),this.uuid=Bn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(qo(i[a].image)):r.push(qo(i[a]))}else r=qo(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function qo(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?$m.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(we("Texture: Unable to serialize Texture."),{})}let Zm=0;const Yo=new I;class kt extends xs{constructor(e=kt.DEFAULT_IMAGE,t=kt.DEFAULT_MAPPING,n=ti,i=ti,r=Et,a=_i,o=Un,l=Cn,c=kt.DEFAULT_ANISOTROPY,h=Oi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zm++}),this.uuid=Bn(),this.name="",this.source=new vh(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new re(0,0),this.repeat=new re(1,1),this.center=new re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Yo).x}get height(){return this.source.getSize(Yo).y}get depth(){return this.source.getSize(Yo).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){we(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){we(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==cf)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case $s:e.x=e.x-Math.floor(e.x);break;case ti:e.x=e.x<0?0:1;break;case ho:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case $s:e.y=e.y-Math.floor(e.y);break;case ti:e.y=e.y<0?0:1;break;case ho:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}kt.DEFAULT_IMAGE=null;kt.DEFAULT_MAPPING=cf;kt.DEFAULT_ANISOTROPY=1;class bt{constructor(e=0,t=0,n=0,i=1){bt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const S=(c+1)/2,y=(f+1)/2,w=(p+1)/2,P=(h+d)/4,C=(u+_)/4,L=(m+g)/4;return S>y&&S>w?S<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(S),i=P/n,r=C/n):y>w?y<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(y),n=P/i,r=L/i):w<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(w),n=C/r,i=L/r),this.set(n,i,r,t),this}let T=Math.sqrt((g-m)*(g-m)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(T)<.001&&(T=1),this.x=(g-m)/T,this.y=(u-_)/T,this.z=(d-h)/T,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this.w=Je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this.w=Je(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Qm extends xs{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Et,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t);const i={width:e,height:t,depth:n.depth},r=new kt(i);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Et,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new vh(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class si extends Qm{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class yf extends kt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class eg extends kt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _n{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Vn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Vn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Vn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Vn):Vn.fromBufferAttribute(r,a),Vn.applyMatrix4(e.matrixWorld),this.expandByPoint(Vn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),la.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),la.copy(n.boundingBox)),la.applyMatrix4(e.matrixWorld),this.union(la)}const i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vn),Vn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(dr),ca.subVectors(this.max,dr),bs.subVectors(e.a,dr),Ts.subVectors(e.b,dr),ws.subVectors(e.c,dr),Ci.subVectors(Ts,bs),Ai.subVectors(ws,Ts),ji.subVectors(bs,ws);let t=[0,-Ci.z,Ci.y,0,-Ai.z,Ai.y,0,-ji.z,ji.y,Ci.z,0,-Ci.x,Ai.z,0,-Ai.x,ji.z,0,-ji.x,-Ci.y,Ci.x,0,-Ai.y,Ai.x,0,-ji.y,ji.x,0];return!jo(t,bs,Ts,ws,ca)||(t=[1,0,0,0,1,0,0,0,1],!jo(t,bs,Ts,ws,ca))?!1:(ha.crossVectors(Ci,Ai),t=[ha.x,ha.y,ha.z],jo(t,bs,Ts,ws,ca))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ui[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ui[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ui[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ui[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ui[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ui[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ui[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ui[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ui),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const ui=[new I,new I,new I,new I,new I,new I,new I,new I],Vn=new I,la=new _n,bs=new I,Ts=new I,ws=new I,Ci=new I,Ai=new I,ji=new I,dr=new I,ca=new I,ha=new I,Ki=new I;function jo(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){Ki.fromArray(s,r);const o=i.x*Math.abs(Ki.x)+i.y*Math.abs(Ki.y)+i.z*Math.abs(Ki.z),l=e.dot(Ki),c=t.dot(Ki),h=n.dot(Ki);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const tg=new _n,fr=new I,Ko=new I;class oi{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):tg.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;fr.subVectors(e,this.center);const t=fr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(fr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ko.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(fr.copy(e.center).add(Ko)),this.expandByPoint(fr.copy(e.center).sub(Ko))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const di=new I,$o=new I,ua=new I,Ri=new I,Jo=new I,da=new I,Zo=new I;class Ao{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,di)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=di.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(di.copy(this.origin).addScaledVector(this.direction,t),di.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){$o.copy(e).add(t).multiplyScalar(.5),ua.copy(t).sub(e).normalize(),Ri.copy(this.origin).sub($o);const r=e.distanceTo(t)*.5,a=-this.direction.dot(ua),o=Ri.dot(this.direction),l=-Ri.dot(ua),c=Ri.lengthSq(),h=Math.abs(1-a*a);let u,d,f,m;if(h>0)if(u=a*l-o,d=a*o-l,m=r*h,u>=0)if(d>=-m)if(d<=m){const _=1/h;u*=_,d*=_,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy($o).addScaledVector(ua,d),f}intersectSphere(e,t){di.subVectors(e.center,this.origin);const n=di.dot(this.direction),i=di.dot(di)-n*n,r=e.radius*e.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,di)!==null}intersectTriangle(e,t,n,i,r){Jo.subVectors(t,e),da.subVectors(n,e),Zo.crossVectors(Jo,da);let a=this.direction.dot(Zo),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ri.subVectors(this.origin,e);const l=o*this.direction.dot(da.crossVectors(Ri,da));if(l<0)return null;const c=o*this.direction.dot(Jo.cross(Ri));if(c<0||l+c>a)return null;const h=-o*Ri.dot(Zo);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class He{constructor(e,t,n,i,r,a,o,l,c,h,u,d,f,m,_,g){He.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,l,c,h,u,d,f,m,_,g)}set(e,t,n,i,r,a,o,l,c,h,u,d,f,m,_,g){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new He().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,n=e.elements,i=1/Es.setFromMatrixColumn(e,0).length(),r=1/Es.setFromMatrixColumn(e,1).length(),a=1/Es.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=a*h,f=a*u,m=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+m*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=m+f*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*h,f=l*u,m=c*h,_=c*u;t[0]=d+_*o,t[4]=m*o-f,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-m,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*h,f=l*u,m=c*h,_=c*u;t[0]=d-_*o,t[4]=-a*u,t[8]=m+f*o,t[1]=f+m*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*h,f=a*u,m=o*h,_=o*u;t[0]=l*h,t[4]=m*c-f,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=f*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,f=a*c,m=o*l,_=o*c;t[0]=l*h,t[4]=_-d*u,t[8]=m*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*u+m,t[10]=d-_*u}else if(e.order==="XZY"){const d=a*l,f=a*c,m=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=a*h,t[9]=f*u-m,t[2]=m*u-f,t[6]=o*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ng,e,ig)}lookAt(e,t,n){const i=this.elements;return yn.subVectors(e,t),yn.lengthSq()===0&&(yn.z=1),yn.normalize(),Pi.crossVectors(n,yn),Pi.lengthSq()===0&&(Math.abs(n.z)===1?yn.x+=1e-4:yn.z+=1e-4,yn.normalize(),Pi.crossVectors(n,yn)),Pi.normalize(),fa.crossVectors(yn,Pi),i[0]=Pi.x,i[4]=fa.x,i[8]=yn.x,i[1]=Pi.y,i[5]=fa.y,i[9]=yn.y,i[2]=Pi.z,i[6]=fa.z,i[10]=yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],m=n[2],_=n[6],g=n[10],p=n[14],T=n[3],S=n[7],y=n[11],w=n[15],P=i[0],C=i[4],L=i[8],v=i[12],b=i[1],R=i[5],F=i[9],U=i[13],B=i[2],H=i[6],W=i[10],z=i[14],Z=i[3],oe=i[7],ce=i[11],de=i[15];return r[0]=a*P+o*b+l*B+c*Z,r[4]=a*C+o*R+l*H+c*oe,r[8]=a*L+o*F+l*W+c*ce,r[12]=a*v+o*U+l*z+c*de,r[1]=h*P+u*b+d*B+f*Z,r[5]=h*C+u*R+d*H+f*oe,r[9]=h*L+u*F+d*W+f*ce,r[13]=h*v+u*U+d*z+f*de,r[2]=m*P+_*b+g*B+p*Z,r[6]=m*C+_*R+g*H+p*oe,r[10]=m*L+_*F+g*W+p*ce,r[14]=m*v+_*U+g*z+p*de,r[3]=T*P+S*b+y*B+w*Z,r[7]=T*C+S*R+y*H+w*oe,r[11]=T*L+S*F+y*W+w*ce,r[15]=T*v+S*U+y*z+w*de,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],m=e[3],_=e[7],g=e[11],p=e[15],T=l*f-c*d,S=o*f-c*u,y=o*d-l*u,w=a*f-c*h,P=a*d-l*h,C=a*u-o*h;return t*(_*T-g*S+p*y)-n*(m*T-g*w+p*P)+i*(m*S-_*w+p*C)-r*(m*y-_*P+g*C)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],m=e[12],_=e[13],g=e[14],p=e[15],T=u*g*c-_*d*c+_*l*f-o*g*f-u*l*p+o*d*p,S=m*d*c-h*g*c-m*l*f+a*g*f+h*l*p-a*d*p,y=h*_*c-m*u*c+m*o*f-a*_*f-h*o*p+a*u*p,w=m*u*l-h*_*l-m*o*d+a*_*d+h*o*g-a*u*g,P=t*T+n*S+i*y+r*w;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/P;return e[0]=T*C,e[1]=(_*d*r-u*g*r-_*i*f+n*g*f+u*i*p-n*d*p)*C,e[2]=(o*g*r-_*l*r+_*i*c-n*g*c-o*i*p+n*l*p)*C,e[3]=(u*l*r-o*d*r-u*i*c+n*d*c+o*i*f-n*l*f)*C,e[4]=S*C,e[5]=(h*g*r-m*d*r+m*i*f-t*g*f-h*i*p+t*d*p)*C,e[6]=(m*l*r-a*g*r-m*i*c+t*g*c+a*i*p-t*l*p)*C,e[7]=(a*d*r-h*l*r+h*i*c-t*d*c-a*i*f+t*l*f)*C,e[8]=y*C,e[9]=(m*u*r-h*_*r-m*n*f+t*_*f+h*n*p-t*u*p)*C,e[10]=(a*_*r-m*o*r+m*n*c-t*_*c-a*n*p+t*o*p)*C,e[11]=(h*o*r-a*u*r-h*n*c+t*u*c+a*n*f-t*o*f)*C,e[12]=w*C,e[13]=(h*_*i-m*u*i+m*n*d-t*_*d-h*n*g+t*u*g)*C,e[14]=(m*o*i-a*_*i-m*n*l+t*_*l+a*n*g-t*o*g)*C,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*d+t*o*d)*C,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,f=r*h,m=r*u,_=a*h,g=a*u,p=o*u,T=l*c,S=l*h,y=l*u,w=n.x,P=n.y,C=n.z;return i[0]=(1-(_+p))*w,i[1]=(f+y)*w,i[2]=(m-S)*w,i[3]=0,i[4]=(f-y)*P,i[5]=(1-(d+p))*P,i[6]=(g+T)*P,i[7]=0,i[8]=(m+S)*C,i[9]=(g-T)*C,i[10]=(1-(d+_))*C,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;if(e.x=i[12],e.y=i[13],e.z=i[14],this.determinant()===0)return n.set(1,1,1),t.identity(),this;let r=Es.set(i[0],i[1],i[2]).length();const a=Es.set(i[4],i[5],i[6]).length(),o=Es.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),Hn.copy(this);const c=1/r,h=1/a,u=1/o;return Hn.elements[0]*=c,Hn.elements[1]*=c,Hn.elements[2]*=c,Hn.elements[4]*=h,Hn.elements[5]*=h,Hn.elements[6]*=h,Hn.elements[8]*=u,Hn.elements[9]*=u,Hn.elements[10]*=u,t.setFromRotationMatrix(Hn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,i,r,a,o=ni,l=!1){const c=this.elements,h=2*r/(t-e),u=2*r/(n-i),d=(t+e)/(t-e),f=(n+i)/(n-i);let m,_;if(l)m=r/(a-r),_=a*r/(a-r);else if(o===ni)m=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===po)m=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,a,o=ni,l=!1){const c=this.elements,h=2/(t-e),u=2/(n-i),d=-(t+e)/(t-e),f=-(n+i)/(n-i);let m,_;if(l)m=1/(a-r),_=a/(a-r);else if(o===ni)m=-2/(a-r),_=-(a+r)/(a-r);else if(o===po)m=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Es=new I,Hn=new He,ng=new I(0,0,0),ig=new I(1,1,1),Pi=new I,fa=new I,yn=new I,hu=new He,uu=new Bt;class Kt{constructor(e=0,t=0,n=0,i=Kt.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(Je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Je(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Je(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:we("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return hu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(hu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return uu.setFromEuler(this),this.setFromQuaternion(uu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Kt.DEFAULT_ORDER="XYZ";class Mf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let sg=0;const du=new I,Cs=new Bt,fi=new He,pa=new I,pr=new I,rg=new I,ag=new Bt,fu=new I(1,0,0),pu=new I(0,1,0),mu=new I(0,0,1),gu={type:"added"},og={type:"removed"},As={type:"childadded",child:null},Qo={type:"childremoved",child:null};class St extends xs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:sg++}),this.uuid=Bn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=St.DEFAULT_UP.clone();const e=new I,t=new Kt,n=new Bt,i=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new He},normalMatrix:{value:new Ye}}),this.matrix=new He,this.matrixWorld=new He,this.matrixAutoUpdate=St.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Mf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Cs.setFromAxisAngle(e,t),this.quaternion.multiply(Cs),this}rotateOnWorldAxis(e,t){return Cs.setFromAxisAngle(e,t),this.quaternion.premultiply(Cs),this}rotateX(e){return this.rotateOnAxis(fu,e)}rotateY(e){return this.rotateOnAxis(pu,e)}rotateZ(e){return this.rotateOnAxis(mu,e)}translateOnAxis(e,t){return du.copy(e).applyQuaternion(this.quaternion),this.position.add(du.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(fu,e)}translateY(e){return this.translateOnAxis(pu,e)}translateZ(e){return this.translateOnAxis(mu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(fi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?pa.copy(e):pa.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),pr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?fi.lookAt(pr,pa,this.up):fi.lookAt(pa,pr,this.up),this.quaternion.setFromRotationMatrix(fi),i&&(fi.extractRotation(i.matrixWorld),Cs.setFromRotationMatrix(fi),this.quaternion.premultiply(Cs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(gu),As.child=e,this.dispatchEvent(As),As.child=null):ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(og),Qo.child=e,this.dispatchEvent(Qo),Qo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),fi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),fi.multiply(e.parent.matrixWorld)),e.applyMatrix4(fi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(gu),As.child=e,this.dispatchEvent(As),As.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(pr,e,rg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(pr,ag,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}St.DEFAULT_UP=new I(0,1,0);St.DEFAULT_MATRIX_AUTO_UPDATE=!0;St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Gn=new I,pi=new I,el=new I,mi=new I,Rs=new I,Ps=new I,_u=new I,tl=new I,nl=new I,il=new I,sl=new bt,rl=new bt,al=new bt;class Dn{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Gn.subVectors(e,t),i.cross(Gn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Gn.subVectors(i,t),pi.subVectors(n,t),el.subVectors(e,t);const a=Gn.dot(Gn),o=Gn.dot(pi),l=Gn.dot(el),c=pi.dot(pi),h=pi.dot(el),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(c*l-o*h)*d,m=(a*h-o*l)*d;return r.set(1-f-m,m,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,mi)===null?!1:mi.x>=0&&mi.y>=0&&mi.x+mi.y<=1}static getInterpolation(e,t,n,i,r,a,o,l){return this.getBarycoord(e,t,n,i,mi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,mi.x),l.addScaledVector(a,mi.y),l.addScaledVector(o,mi.z),l)}static getInterpolatedAttribute(e,t,n,i,r,a){return sl.setScalar(0),rl.setScalar(0),al.setScalar(0),sl.fromBufferAttribute(e,t),rl.fromBufferAttribute(e,n),al.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(sl,r.x),a.addScaledVector(rl,r.y),a.addScaledVector(al,r.z),a}static isFrontFacing(e,t,n,i){return Gn.subVectors(n,t),pi.subVectors(e,t),Gn.cross(pi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Gn.subVectors(this.c,this.b),pi.subVectors(this.a,this.b),Gn.cross(pi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Dn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Dn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return Dn.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return Dn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Dn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let a,o;Rs.subVectors(i,n),Ps.subVectors(r,n),tl.subVectors(e,n);const l=Rs.dot(tl),c=Ps.dot(tl);if(l<=0&&c<=0)return t.copy(n);nl.subVectors(e,i);const h=Rs.dot(nl),u=Ps.dot(nl);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Rs,a);il.subVectors(e,r);const f=Rs.dot(il),m=Ps.dot(il);if(m>=0&&f<=m)return t.copy(r);const _=f*c-l*m;if(_<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(Ps,o);const g=h*m-f*u;if(g<=0&&u-h>=0&&f-m>=0)return _u.subVectors(r,i),o=(u-h)/(u-h+(f-m)),t.copy(i).addScaledVector(_u,o);const p=1/(g+_+d);return a=_*p,o=d*p,t.copy(n).addScaledVector(Rs,a).addScaledVector(Ps,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Sf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ii={h:0,s:0,l:0},ma={h:0,s:0,l:0};function ol(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Pe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=nt.workingColorSpace){return this.r=e,this.g=t,this.b=n,nt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=nt.workingColorSpace){if(e=xh(e,1),t=Je(t,0,1),n=Je(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ol(a,r,e+1/3),this.g=ol(a,r,e),this.b=ol(a,r,e-1/3)}return nt.colorSpaceToWorking(this,i),this}setStyle(e,t=qt){function n(r){r!==void 0&&parseFloat(r)<1&&we("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:we("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);we("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=qt){const n=Sf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):we("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Mi(e.r),this.g=Mi(e.g),this.b=Mi(e.b),this}copyLinearToSRGB(e){return this.r=qs(e.r),this.g=qs(e.g),this.b=qs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qt){return nt.workingToColorSpace(Jt.copy(this),e),Math.round(Je(Jt.r*255,0,255))*65536+Math.round(Je(Jt.g*255,0,255))*256+Math.round(Je(Jt.b*255,0,255))}getHexString(e=qt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.workingToColorSpace(Jt.copy(this),t);const n=Jt.r,i=Jt.g,r=Jt.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=nt.workingColorSpace){return nt.workingToColorSpace(Jt.copy(this),t),e.r=Jt.r,e.g=Jt.g,e.b=Jt.b,e}getStyle(e=qt){nt.workingToColorSpace(Jt.copy(this),e);const t=Jt.r,n=Jt.g,i=Jt.b;return e!==qt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Ii),this.setHSL(Ii.h+e,Ii.s+t,Ii.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ii),e.getHSL(ma);const n=Dr(Ii.h,ma.h,t),i=Dr(Ii.s,ma.s,t),r=Dr(Ii.l,ma.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Jt=new Pe;Pe.NAMES=Sf;let lg=0;class kn extends xs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:lg++}),this.uuid=Bn(),this.name="",this.type="Material",this.blending=zi,this.side=Ti,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Xl,this.blendDst=ql,this.blendEquation=as,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Pe(0,0,0),this.blendAlpha=0,this.depthFunc=js,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=iu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ms,this.stencilZFail=Ms,this.stencilZPass=Ms,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){we(`Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){we(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==zi&&(n.blending=this.blending),this.side!==Ti&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Xl&&(n.blendSrc=this.blendSrc),this.blendDst!==ql&&(n.blendDst=this.blendDst),this.blendEquation!==as&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==js&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==iu&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ms&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ms&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ms&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class On extends kn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Pe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kt,this.combine=rh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Lt=new I,ga=new re;let cg=0;class ln{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:cg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Fc,this.updateRanges=[],this.gpuType=Fn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ga.fromBufferAttribute(this,t),ga.applyMatrix3(e),this.setXY(t,ga.x,ga.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Lt.fromBufferAttribute(this,t),Lt.applyMatrix3(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Lt.fromBufferAttribute(this,t),Lt.applyMatrix4(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Lt.fromBufferAttribute(this,t),Lt.applyNormalMatrix(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Lt.fromBufferAttribute(this,t),Lt.transformDirection(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array),r=ft(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Fc&&(e.usage=this.usage),e}}class bf extends ln{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Tf extends ln{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class zt extends ln{constructor(e,t,n){super(new Float32Array(e),t,n)}}let hg=0;const Pn=new He,ll=new St,Is=new I,Mn=new _n,mr=new _n,Gt=new I;class en extends xs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hg++}),this.uuid=Bn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(vf(e)?Tf:bf)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Pn.makeRotationFromQuaternion(e),this.applyMatrix4(Pn),this}rotateX(e){return Pn.makeRotationX(e),this.applyMatrix4(Pn),this}rotateY(e){return Pn.makeRotationY(e),this.applyMatrix4(Pn),this}rotateZ(e){return Pn.makeRotationZ(e),this.applyMatrix4(Pn),this}translate(e,t,n){return Pn.makeTranslation(e,t,n),this.applyMatrix4(Pn),this}scale(e,t,n){return Pn.makeScale(e,t,n),this.applyMatrix4(Pn),this}lookAt(e){return ll.lookAt(e),ll.updateMatrix(),this.applyMatrix4(ll.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Is).negate(),this.translate(Is.x,Is.y,Is.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new zt(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&we("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new _n);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];Mn.setFromBufferAttribute(r),this.morphTargetsRelative?(Gt.addVectors(this.boundingBox.min,Mn.min),this.boundingBox.expandByPoint(Gt),Gt.addVectors(this.boundingBox.max,Mn.max),this.boundingBox.expandByPoint(Gt)):(this.boundingBox.expandByPoint(Mn.min),this.boundingBox.expandByPoint(Mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new oi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(Mn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];mr.setFromBufferAttribute(o),this.morphTargetsRelative?(Gt.addVectors(Mn.min,mr.min),Mn.expandByPoint(Gt),Gt.addVectors(Mn.max,mr.max),Mn.expandByPoint(Gt)):(Mn.expandByPoint(mr.min),Mn.expandByPoint(mr.max))}Mn.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)Gt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Gt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Gt.fromBufferAttribute(o,c),l&&(Is.fromBufferAttribute(e,c),Gt.add(Is)),i=Math.max(i,n.distanceToSquared(Gt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ln(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let L=0;L<n.count;L++)o[L]=new I,l[L]=new I;const c=new I,h=new I,u=new I,d=new re,f=new re,m=new re,_=new I,g=new I;function p(L,v,b){c.fromBufferAttribute(n,L),h.fromBufferAttribute(n,v),u.fromBufferAttribute(n,b),d.fromBufferAttribute(r,L),f.fromBufferAttribute(r,v),m.fromBufferAttribute(r,b),h.sub(c),u.sub(c),f.sub(d),m.sub(d);const R=1/(f.x*m.y-m.x*f.y);isFinite(R)&&(_.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(R),g.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(R),o[L].add(_),o[v].add(_),o[b].add(_),l[L].add(g),l[v].add(g),l[b].add(g))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let L=0,v=T.length;L<v;++L){const b=T[L],R=b.start,F=b.count;for(let U=R,B=R+F;U<B;U+=3)p(e.getX(U+0),e.getX(U+1),e.getX(U+2))}const S=new I,y=new I,w=new I,P=new I;function C(L){w.fromBufferAttribute(i,L),P.copy(w);const v=o[L];S.copy(v),S.sub(w.multiplyScalar(w.dot(v))).normalize(),y.crossVectors(P,v);const R=y.dot(l[L])<0?-1:1;a.setXYZW(L,S.x,S.y,S.z,R)}for(let L=0,v=T.length;L<v;++L){const b=T[L],R=b.start,F=b.count;for(let U=R,B=R+F;U<B;U+=3)C(e.getX(U+0)),C(e.getX(U+1)),C(e.getX(U+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ln(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new I,r=new I,a=new I,o=new I,l=new I,c=new I,h=new I,u=new I;if(e)for(let d=0,f=e.count;d<f;d+=3){const m=e.getX(d+0),_=e.getX(d+1),g=e.getX(d+2);i.fromBufferAttribute(t,m),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,g),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,g),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Gt.fromBufferAttribute(e,t),Gt.normalize(),e.setXYZ(t,Gt.x,Gt.y,Gt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h);let f=0,m=0;for(let _=0,g=l.length;_<g;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*h;for(let p=0;p<h;p++)d[m++]=c[f++]}return new ln(d,h,u)}if(this.index===null)return we("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new en,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(i[l]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const xu=new He,$i=new Ao,_a=new oi,vu=new I,xa=new I,va=new I,ya=new I,cl=new I,Ma=new I,yu=new I,Sa=new I;class lt extends St{constructor(e=new en,t=new On){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(r&&o){Ma.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(cl.fromBufferAttribute(u,e),a?Ma.addScaledVector(cl,h):Ma.addScaledVector(cl.sub(t),h))}t.add(Ma)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),_a.copy(n.boundingSphere),_a.applyMatrix4(r),$i.copy(e.ray).recast(e.near),!(_a.containsPoint($i.origin)===!1&&($i.intersectSphere(_a,vu)===null||$i.origin.distanceToSquared(vu)>(e.far-e.near)**2))&&(xu.copy(r).invert(),$i.copy(e.ray).applyMatrix4(xu),!(n.boundingBox!==null&&$i.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,$i)))}_computeIntersections(e,t,n){let i;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,_=d.length;m<_;m++){const g=d[m],p=a[g.materialIndex],T=Math.max(g.start,f.start),S=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let y=T,w=S;y<w;y+=3){const P=o.getX(y),C=o.getX(y+1),L=o.getX(y+2);i=ba(this,p,e,n,c,h,u,P,C,L),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){const T=o.getX(g),S=o.getX(g+1),y=o.getX(g+2);i=ba(this,a,e,n,c,h,u,T,S,y),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,_=d.length;m<_;m++){const g=d[m],p=a[g.materialIndex],T=Math.max(g.start,f.start),S=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let y=T,w=S;y<w;y+=3){const P=y,C=y+1,L=y+2;i=ba(this,p,e,n,c,h,u,P,C,L),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){const T=g,S=g+1,y=g+2;i=ba(this,a,e,n,c,h,u,T,S,y),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}}function ug(s,e,t,n,i,r,a,o){let l;if(e.side===gn?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,e.side===Ti,o),l===null)return null;Sa.copy(o),Sa.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(Sa);return c<t.near||c>t.far?null:{distance:c,point:Sa.clone(),object:s}}function ba(s,e,t,n,i,r,a,o,l,c){s.getVertexPosition(o,xa),s.getVertexPosition(l,va),s.getVertexPosition(c,ya);const h=ug(s,e,t,n,xa,va,ya,yu);if(h){const u=new I;Dn.getBarycoord(yu,xa,va,ya,u),i&&(h.uv=Dn.getInterpolatedAttribute(i,o,l,c,u,new re)),r&&(h.uv1=Dn.getInterpolatedAttribute(r,o,l,c,u,new re)),a&&(h.normal=Dn.getInterpolatedAttribute(a,o,l,c,u,new I),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new I,materialIndex:0};Dn.getNormal(xa,va,ya,d.normal),h.face=d,h.barycoord=u}return h}class Si extends en{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let d=0,f=0;m("z","y","x",-1,-1,n,t,e,a,r,0),m("z","y","x",1,-1,n,t,-e,a,r,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,r,4),m("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new zt(c,3)),this.setAttribute("normal",new zt(h,3)),this.setAttribute("uv",new zt(u,2));function m(_,g,p,T,S,y,w,P,C,L,v){const b=y/C,R=w/L,F=y/2,U=w/2,B=P/2,H=C+1,W=L+1;let z=0,Z=0;const oe=new I;for(let ce=0;ce<W;ce++){const de=ce*R-U;for(let Xe=0;Xe<H;Xe++){const Ge=Xe*b-F;oe[_]=Ge*T,oe[g]=de*S,oe[p]=B,c.push(oe.x,oe.y,oe.z),oe[_]=0,oe[g]=0,oe[p]=P>0?1:-1,h.push(oe.x,oe.y,oe.z),u.push(Xe/C),u.push(1-ce/L),z+=1}}for(let ce=0;ce<L;ce++)for(let de=0;de<C;de++){const Xe=d+de+H*ce,Ge=d+de+H*(ce+1),pt=d+(de+1)+H*(ce+1),mt=d+(de+1)+H*ce;l.push(Xe,Ge,mt),l.push(Ge,pt,mt),Z+=6}o.addGroup(f,Z,v),f+=Z,d+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Si(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Qs(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(we("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function sn(s){const e={};for(let t=0;t<s.length;t++){const n=Qs(s[t]);for(const i in n)e[i]=n[i]}return e}function dg(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function wf(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}const fg={clone:Qs,merge:sn};var pg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,mg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class zn extends kn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pg,this.fragmentShader=mg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Qs(e.uniforms),this.uniformsGroups=dg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Ef extends St{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new He,this.projectionMatrix=new He,this.projectionMatrixInverse=new He,this.coordinateSystem=ni,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Li=new I,Mu=new re,Su=new re;class an extends Ef{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Zs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Nr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Zs*2*Math.atan(Math.tan(Nr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Li.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Li.x,Li.y).multiplyScalar(-e/Li.z),Li.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Li.x,Li.y).multiplyScalar(-e/Li.z)}getViewSize(e,t){return this.getViewBounds(e,Mu,Su),t.subVectors(Su,Mu)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Nr*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ls=-90,Ns=1;class gg extends St{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new an(Ls,Ns,e,t);i.layers=this.layers,this.add(i);const r=new an(Ls,Ns,e,t);r.layers=this.layers,this.add(r);const a=new an(Ls,Ns,e,t);a.layers=this.layers,this.add(a);const o=new an(Ls,Ns,e,t);o.layers=this.layers,this.add(o);const l=new an(Ls,Ns,e,t);l.layers=this.layers,this.add(l);const c=new an(Ls,Ns,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===ni)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===po)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Cf extends kt{constructor(e=[],t=ps,n,i,r,a,o,l,c,h){super(e,t,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Af extends si{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Cf(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Si(5,5,5),r=new zn({name:"CubemapFromEquirect",uniforms:Qs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:gn,blending:yi});r.uniforms.tEquirect.value=t;const a=new lt(i,r),o=t.minFilter;return t.minFilter===_i&&(t.minFilter=Et),new gg(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}}class Wt extends St{constructor(){super(),this.isGroup=!0,this.type="Group"}}const _g={type:"move"};class hl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Wt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Wt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Wt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const _ of e.hand.values()){const g=t.getJointPose(_,n),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(_g)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Wt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class xg extends St{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kt,this.environmentIntensity=1,this.environmentRotation=new Kt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Rf{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Fc,this.updateRanges=[],this.version=0,this.uuid=Bn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const nn=new I;class qr{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.applyMatrix4(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.applyNormalMatrix(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.transformDirection(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=qn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=qn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=qn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=qn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array),r=ft(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){mo("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new ln(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new qr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){mo("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Bi extends kn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Pe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Ds;const gr=new I,Fs=new I,Us=new I,Os=new re,_r=new re,Pf=new He,Ta=new I,xr=new I,wa=new I,bu=new re,ul=new re,Tu=new re;class hs extends St{constructor(e=new Bi){if(super(),this.isSprite=!0,this.type="Sprite",Ds===void 0){Ds=new en;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Rf(t,5);Ds.setIndex([0,1,2,0,2,3]),Ds.setAttribute("position",new qr(n,3,0,!1)),Ds.setAttribute("uv",new qr(n,2,3,!1))}this.geometry=Ds,this.material=e,this.center=new re(.5,.5),this.count=1}raycast(e,t){e.camera===null&&ke('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Fs.setFromMatrixScale(this.matrixWorld),Pf.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Us.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Fs.multiplyScalar(-Us.z);const n=this.material.rotation;let i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));const a=this.center;Ea(Ta.set(-.5,-.5,0),Us,a,Fs,i,r),Ea(xr.set(.5,-.5,0),Us,a,Fs,i,r),Ea(wa.set(.5,.5,0),Us,a,Fs,i,r),bu.set(0,0),ul.set(1,0),Tu.set(1,1);let o=e.ray.intersectTriangle(Ta,xr,wa,!1,gr);if(o===null&&(Ea(xr.set(-.5,.5,0),Us,a,Fs,i,r),ul.set(0,1),o=e.ray.intersectTriangle(Ta,wa,xr,!1,gr),o===null))return;const l=e.ray.origin.distanceTo(gr);l<e.near||l>e.far||t.push({distance:l,point:gr.clone(),uv:Dn.getInterpolation(gr,Ta,xr,wa,bu,ul,Tu,new re),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Ea(s,e,t,n,i,r){Os.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(_r.x=r*Os.x-i*Os.y,_r.y=i*Os.x+r*Os.y):_r.copy(Os),s.copy(e),s.x+=_r.x,s.y+=_r.y,s.applyMatrix4(Pf)}const wu=new I,Eu=new bt,Cu=new bt,vg=new I,Au=new He,Ca=new I,dl=new oi,Ru=new He,fl=new Ao;class yg extends lt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=nu,this.bindMatrix=new He,this.bindMatrixInverse=new He,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new _n),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ca),this.boundingBox.expandByPoint(Ca)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new oi),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ca),this.boundingSphere.expandByPoint(Ca)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),dl.copy(this.boundingSphere),dl.applyMatrix4(i),e.ray.intersectsSphere(dl)!==!1&&(Ru.copy(i).invert(),fl.copy(e.ray).applyMatrix4(Ru),!(this.boundingBox!==null&&fl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,fl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new bt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===nu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===xm?this.bindMatrixInverse.copy(this.bindMatrix).invert():we("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;Eu.fromBufferAttribute(i.attributes.skinIndex,e),Cu.fromBufferAttribute(i.attributes.skinWeight,e),wu.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const a=Cu.getComponent(r);if(a!==0){const o=Eu.getComponent(r);Au.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(vg.copy(wu).applyMatrix4(Au),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class If extends St{constructor(){super(),this.isBone=!0,this.type="Bone"}}class yh extends kt{constructor(e=null,t=1,n=1,i,r,a,o,l,c=Ot,h=Ot,u,d){super(null,a,o,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Pu=new He,Mg=new He;class Mh{constructor(e=[],t=[]){this.uuid=Bn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){we("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new He)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new He;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:Mg;Pu.multiplyMatrices(o,t[r]),Pu.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Mh(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new yh(t,e,e,Un,Fn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let a=t[r];a===void 0&&(we("Skeleton: No bone found with UUID:",r),a=new If),this.bones.push(a),this.boneInverses.push(new He().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Uc extends ln{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Bs=new He,Iu=new He,Aa=[],Lu=new _n,Sg=new He,vr=new lt,yr=new oi;class bg extends lt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Uc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Sg)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new _n),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Bs),Lu.copy(e.boundingBox).applyMatrix4(Bs),this.boundingBox.union(Lu)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new oi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Bs),yr.copy(e.boundingSphere).applyMatrix4(Bs),this.boundingSphere.union(yr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(vr.geometry=this.geometry,vr.material=this.material,vr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),yr.copy(this.boundingSphere),yr.applyMatrix4(n),e.ray.intersectsSphere(yr)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Bs),Iu.multiplyMatrices(n,Bs),vr.matrixWorld=Iu,vr.raycast(e,Aa);for(let a=0,o=Aa.length;a<o;a++){const l=Aa[a];l.instanceId=r,l.object=this,t.push(l)}Aa.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Uc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new yh(new Float32Array(i*this.count),i,this.count,ch,Fn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const pl=new I,Tg=new I,wg=new Ye;class rs{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=pl.subVectors(n,t).cross(Tg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(pl),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||wg.getNormalMatrix(e),i=this.coplanarPoint(pl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ji=new oi,Eg=new re(.5,.5),Ra=new I;class Sh{constructor(e=new rs,t=new rs,n=new rs,i=new rs,r=new rs,a=new rs){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ni,n=!1){const i=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],m=r[8],_=r[9],g=r[10],p=r[11],T=r[12],S=r[13],y=r[14],w=r[15];if(i[0].setComponents(c-a,f-h,p-m,w-T).normalize(),i[1].setComponents(c+a,f+h,p+m,w+T).normalize(),i[2].setComponents(c+o,f+u,p+_,w+S).normalize(),i[3].setComponents(c-o,f-u,p-_,w-S).normalize(),n)i[4].setComponents(l,d,g,y).normalize(),i[5].setComponents(c-l,f-d,p-g,w-y).normalize();else if(i[4].setComponents(c-l,f-d,p-g,w-y).normalize(),t===ni)i[5].setComponents(c+l,f+d,p+g,w+y).normalize();else if(t===po)i[5].setComponents(l,d,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ji.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ji.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ji)}intersectsSprite(e){Ji.center.set(0,0,0);const t=Eg.distanceTo(e.center);return Ji.radius=.7071067811865476+t,Ji.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ji)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Ra.x=i.normal.x>0?e.max.x:e.min.x,Ra.y=i.normal.y>0?e.max.y:e.min.y,Ra.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Ra)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Lf extends kn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Pe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const go=new I,_o=new I,Nu=new He,Mr=new Ao,Pa=new oi,ml=new I,Du=new I;class bh extends St{constructor(e=new en,t=new Lf){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)go.fromBufferAttribute(t,i-1),_o.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=go.distanceTo(_o);e.setAttribute("lineDistance",new zt(n,1))}else we("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Pa.copy(n.boundingSphere),Pa.applyMatrix4(i),Pa.radius+=r,e.ray.intersectsSphere(Pa)===!1)return;Nu.copy(i).invert(),Mr.copy(e.ray).applyMatrix4(Nu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let _=f,g=m-1;_<g;_+=c){const p=h.getX(_),T=h.getX(_+1),S=Ia(this,e,Mr,l,p,T,_);S&&t.push(S)}if(this.isLineLoop){const _=h.getX(m-1),g=h.getX(f),p=Ia(this,e,Mr,l,_,g,m-1);p&&t.push(p)}}else{const f=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let _=f,g=m-1;_<g;_+=c){const p=Ia(this,e,Mr,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){const _=Ia(this,e,Mr,l,m-1,f,m-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Ia(s,e,t,n,i,r,a){const o=s.geometry.attributes.position;if(go.fromBufferAttribute(o,i),_o.fromBufferAttribute(o,r),t.distanceSqToSegment(go,_o,ml,Du)>n)return;ml.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(ml);if(!(c<e.near||c>e.far))return{distance:c,point:Du.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}const Fu=new I,Uu=new I;class Cg extends bh{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Fu.fromBufferAttribute(t,i),Uu.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Fu.distanceTo(Uu);e.setAttribute("lineDistance",new zt(n,1))}else we("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Ag extends bh{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Nf extends kn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Pe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Ou=new He,Oc=new Ao,La=new oi,Na=new I;class Rg extends St{constructor(e=new en,t=new Nf){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),La.copy(n.boundingSphere),La.applyMatrix4(i),La.radius+=r,e.ray.intersectsSphere(La)===!1)return;Ou.copy(i).invert(),Oc.copy(e.ray).applyMatrix4(Ou);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let m=d,_=f;m<_;m++){const g=c.getX(m);Na.fromBufferAttribute(u,g),Bu(Na,g,l,i,e,t,this)}}else{const d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let m=d,_=f;m<_;m++)Na.fromBufferAttribute(u,m),Bu(Na,m,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Bu(s,e,t,n,i,r,a){const o=Oc.distanceSqToPoint(s);if(o<t){const l=new I;Oc.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class Th extends kt{constructor(e,t,n,i,r,a,o,l,c){super(e,t,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Yr extends kt{constructor(e,t,n=ri,i,r,a,o=Ot,l=Ot,c,h=Ei,u=1){if(h!==Ei&&h!==cs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:u};super(d,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new vh(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Pg extends Yr{constructor(e,t=ri,n=ps,i,r,a=Ot,o=Ot,l,c=Ei){const h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,i,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Df extends kt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Gi extends en{constructor(e=1,t=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],f=[];let m=0;const _=[],g=n/2;let p=0;T(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new zt(u,3)),this.setAttribute("normal",new zt(d,3)),this.setAttribute("uv",new zt(f,2));function T(){const y=new I,w=new I;let P=0;const C=(t-e)/n;for(let L=0;L<=r;L++){const v=[],b=L/r,R=b*(t-e)+e;for(let F=0;F<=i;F++){const U=F/i,B=U*l+o,H=Math.sin(B),W=Math.cos(B);w.x=R*H,w.y=-b*n+g,w.z=R*W,u.push(w.x,w.y,w.z),y.set(H,C,W).normalize(),d.push(y.x,y.y,y.z),f.push(U,1-b),v.push(m++)}_.push(v)}for(let L=0;L<i;L++)for(let v=0;v<r;v++){const b=_[v][L],R=_[v+1][L],F=_[v+1][L+1],U=_[v][L+1];(e>0||v!==0)&&(h.push(b,R,U),P+=3),(t>0||v!==r-1)&&(h.push(R,F,U),P+=3)}c.addGroup(p,P,0),p+=P}function S(y){const w=m,P=new re,C=new I;let L=0;const v=y===!0?e:t,b=y===!0?1:-1;for(let F=1;F<=i;F++)u.push(0,g*b,0),d.push(0,b,0),f.push(.5,.5),m++;const R=m;for(let F=0;F<=i;F++){const B=F/i*l+o,H=Math.cos(B),W=Math.sin(B);C.x=v*W,C.y=g*b,C.z=v*H,u.push(C.x,C.y,C.z),d.push(0,b,0),P.x=H*.5+.5,P.y=W*.5*b+.5,f.push(P.x,P.y),m++}for(let F=0;F<i;F++){const U=w+F,B=R+F;y===!0?h.push(B,B+1,U):h.push(B+1,B,U),L+=3}c.addGroup(p,L,y===!0?1:2),p+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gi(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ms extends Gi{constructor(e=1,t=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new ms(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class li{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){we("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let i=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);const h=n[i],d=n[i+1]-h,f=(a-h)/d;return(i+f)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),l=t||(a.isVector2?new re:new I);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new I,i=[],r=[],a=[],o=new I,l=new He;for(let f=0;f<=e;f++){const m=f/e;i[f]=this.getTangentAt(m,new I)}r[0]=new I,a[0]=new I;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(i[f-1],i[f]),o.length()>Number.EPSILON){o.normalize();const m=Math.acos(Je(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(i[f],r[f])}if(t===!0){let f=Math.acos(Je(r[0].dot(r[e]),-1,1));f/=e,i[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(i[m],f*m)),a[m].crossVectors(i[m],r[m])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class wh extends li{constructor(e=0,t=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new re){const n=t,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Ig extends wh{constructor(e,t,n,i,r,a){super(e,t,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Eh(){let s=0,e=0,t=0,n=0;function i(r,a,o,l){s=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,f*=h,i(a,o,d,f)},calc:function(r){const a=r*r,o=a*r;return s+e*r+t*a+n*o}}}const Da=new I,gl=new Eh,_l=new Eh,xl=new Eh;class Lg extends li{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new I){const n=t,i=this.points,r=i.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%r]:(Da.subVectors(i[0],i[1]).add(i[0]),c=Da);const u=i[o%r],d=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(Da.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=Da),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let m=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(h),f);_<1e-4&&(_=1),m<1e-4&&(m=_),g<1e-4&&(g=_),gl.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,_,g),_l.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,_,g),xl.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,_,g)}else this.curveType==="catmullrom"&&(gl.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),_l.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),xl.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(gl.calc(l),_l.calc(l),xl.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new I().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function ku(s,e,t,n,i){const r=(n-e)*.5,a=(i-t)*.5,o=s*s,l=s*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*s+t}function Ng(s,e){const t=1-s;return t*t*e}function Dg(s,e){return 2*(1-s)*s*e}function Fg(s,e){return s*s*e}function Fr(s,e,t,n){return Ng(s,e)+Dg(s,t)+Fg(s,n)}function Ug(s,e){const t=1-s;return t*t*t*e}function Og(s,e){const t=1-s;return 3*t*t*s*e}function Bg(s,e){return 3*(1-s)*s*s*e}function kg(s,e){return s*s*s*e}function Ur(s,e,t,n,i){return Ug(s,e)+Og(s,t)+Bg(s,n)+kg(s,i)}class Ff extends li{constructor(e=new re,t=new re,n=new re,i=new re){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new re){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ur(e,i.x,r.x,a.x,o.x),Ur(e,i.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class zg extends li{constructor(e=new I,t=new I,n=new I,i=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new I){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ur(e,i.x,r.x,a.x,o.x),Ur(e,i.y,r.y,a.y,o.y),Ur(e,i.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Uf extends li{constructor(e=new re,t=new re){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new re){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new re){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Vg extends li{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Of extends li{constructor(e=new re,t=new re,n=new re){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new re){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(Fr(e,i.x,r.x,a.x),Fr(e,i.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Hg extends li{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(Fr(e,i.x,r.x,a.x),Fr(e,i.y,r.y,a.y),Fr(e,i.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Bf extends li{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new re){const n=t,i=this.points,r=(i.length-1)*e,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(ku(o,l.x,c.x,h.x,u.x),ku(o,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new re().fromArray(i))}return this}}var Bc=Object.freeze({__proto__:null,ArcCurve:Ig,CatmullRomCurve3:Lg,CubicBezierCurve:Ff,CubicBezierCurve3:zg,EllipseCurve:wh,LineCurve:Uf,LineCurve3:Vg,QuadraticBezierCurve:Of,QuadraticBezierCurve3:Hg,SplineCurve:Bf});class Gg extends li{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Bc[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const a=i[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const a=r[i],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(new Bc[i.type]().fromJSON(i))}return this}}class zu extends Gg{constructor(e){super(),this.type="Path",this.currentPoint=new re,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Uf(this.currentPoint.clone(),new re(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){const r=new Of(this.currentPoint.clone(),new re(e,t),new re(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,a){const o=new Ff(this.currentPoint.clone(),new re(e,t),new re(n,i),new re(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new Bf(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,i,r,a),this}absarc(e,t,n,i,r,a){return this.absellipse(e,t,n,n,i,r,a),this}ellipse(e,t,n,i,r,a,o,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,i,r,a,o,l),this}absellipse(e,t,n,i,r,a,o,l){const c=new wh(e,t,n,i,r,a,o,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class kf extends zu{constructor(e){super(e),this.uuid=Bn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(new zu().fromJSON(i))}return this}}function Wg(s,e,t=2){const n=e&&e.length,i=n?e[0]*t:s.length;let r=zf(s,0,i,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Kg(s,e,r,t)),s.length>80*t){o=s[0],l=s[1];let h=o,u=l;for(let d=t;d<i;d+=t){const f=s[d],m=s[d+1];f<o&&(o=f),m<l&&(l=m),f>h&&(h=f),m>u&&(u=m)}c=Math.max(h-o,u-l),c=c!==0?32767/c:0}return jr(r,a,t,o,l,c,0),a}function zf(s,e,t,n,i){let r;if(i===a0(s,e,t,n)>0)for(let a=e;a<t;a+=n)r=Vu(a/n|0,s[a],s[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Vu(a/n|0,s[a],s[a+1],r);return r&&er(r,r.next)&&($r(r),r=r.next),r}function gs(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(er(t,t.next)||wt(t.prev,t,t.next)===0)){if($r(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function jr(s,e,t,n,i,r,a){if(!s)return;!a&&r&&e0(s,n,i,r);let o=s;for(;s.prev!==s.next;){const l=s.prev,c=s.next;if(r?qg(s,n,i,r):Xg(s)){e.push(l.i,s.i,c.i),$r(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=Yg(gs(s),e),jr(s,e,t,n,i,r,2)):a===2&&jg(s,e,t,n,i,r):jr(gs(s),e,t,n,i,r,1);break}}}function Xg(s){const e=s.prev,t=s,n=s.next;if(wt(e,t,n)>=0)return!1;const i=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=Math.min(i,r,a),u=Math.min(o,l,c),d=Math.max(i,r,a),f=Math.max(o,l,c);let m=n.next;for(;m!==e;){if(m.x>=h&&m.x<=d&&m.y>=u&&m.y<=f&&Pr(i,o,r,l,a,c,m.x,m.y)&&wt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function qg(s,e,t,n){const i=s.prev,r=s,a=s.next;if(wt(i,r,a)>=0)return!1;const o=i.x,l=r.x,c=a.x,h=i.y,u=r.y,d=a.y,f=Math.min(o,l,c),m=Math.min(h,u,d),_=Math.max(o,l,c),g=Math.max(h,u,d),p=kc(f,m,e,t,n),T=kc(_,g,e,t,n);let S=s.prevZ,y=s.nextZ;for(;S&&S.z>=p&&y&&y.z<=T;){if(S.x>=f&&S.x<=_&&S.y>=m&&S.y<=g&&S!==i&&S!==a&&Pr(o,h,l,u,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0||(S=S.prevZ,y.x>=f&&y.x<=_&&y.y>=m&&y.y<=g&&y!==i&&y!==a&&Pr(o,h,l,u,c,d,y.x,y.y)&&wt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;S&&S.z>=p;){if(S.x>=f&&S.x<=_&&S.y>=m&&S.y<=g&&S!==i&&S!==a&&Pr(o,h,l,u,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;y&&y.z<=T;){if(y.x>=f&&y.x<=_&&y.y>=m&&y.y<=g&&y!==i&&y!==a&&Pr(o,h,l,u,c,d,y.x,y.y)&&wt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Yg(s,e){let t=s;do{const n=t.prev,i=t.next.next;!er(n,i)&&Hf(n,t,t.next,i)&&Kr(n,i)&&Kr(i,n)&&(e.push(n.i,t.i,i.i),$r(t),$r(t.next),t=s=i),t=t.next}while(t!==s);return gs(t)}function jg(s,e,t,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&i0(a,o)){let l=Gf(a,o);a=gs(a,a.next),l=gs(l,l.next),jr(a,e,t,n,i,r,0),jr(l,e,t,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function Kg(s,e,t,n){const i=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,l=r<a-1?e[r+1]*n:s.length,c=zf(s,o,l,n,!1);c===c.next&&(c.steiner=!0),i.push(n0(c))}i.sort($g);for(let r=0;r<i.length;r++)t=Jg(i[r],t);return t}function $g(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){const n=(s.next.y-s.y)/(s.next.x-s.x),i=(e.next.y-e.y)/(e.next.x-e.x);t=n-i}return t}function Jg(s,e){const t=Zg(s,e);if(!t)return e;const n=Gf(t,s);return gs(n,n.next),gs(t,t.next)}function Zg(s,e){let t=e;const n=s.x,i=s.y;let r=-1/0,a;if(er(s,t))return t;do{if(er(s,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){const u=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,a=t.x<t.next.x?t:t.next,u===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let h=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Vf(i<c?n:r,i,l,c,i<c?r:n,i,t.x,t.y)){const u=Math.abs(i-t.y)/(n-t.x);Kr(t,s)&&(u<h||u===h&&(t.x>a.x||t.x===a.x&&Qg(a,t)))&&(a=t,h=u)}t=t.next}while(t!==o);return a}function Qg(s,e){return wt(s.prev,s,e.prev)<0&&wt(e.next,s,s.next)<0}function e0(s,e,t,n){let i=s;do i.z===0&&(i.z=kc(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,t0(i)}function t0(s){let e,t=1;do{let n=s,i;s=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(i=n,n=n.nextZ,o--):(i=a,a=a.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=a}r.nextZ=null,t*=2}while(e>1);return s}function kc(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function n0(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function Vf(s,e,t,n,i,r,a,o){return(i-a)*(e-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(i-a)*(n-o)}function Pr(s,e,t,n,i,r,a,o){return!(s===a&&e===o)&&Vf(s,e,t,n,i,r,a,o)}function i0(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!s0(s,e)&&(Kr(s,e)&&Kr(e,s)&&r0(s,e)&&(wt(s.prev,s,e.prev)||wt(s,e.prev,e))||er(s,e)&&wt(s.prev,s,s.next)>0&&wt(e.prev,e,e.next)>0)}function wt(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function er(s,e){return s.x===e.x&&s.y===e.y}function Hf(s,e,t,n){const i=Ua(wt(s,e,t)),r=Ua(wt(s,e,n)),a=Ua(wt(t,n,s)),o=Ua(wt(t,n,e));return!!(i!==r&&a!==o||i===0&&Fa(s,t,e)||r===0&&Fa(s,n,e)||a===0&&Fa(t,s,n)||o===0&&Fa(t,e,n))}function Fa(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function Ua(s){return s>0?1:s<0?-1:0}function s0(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&Hf(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Kr(s,e){return wt(s.prev,s,s.next)<0?wt(s,e,s.next)>=0&&wt(s,s.prev,e)>=0:wt(s,e,s.prev)<0||wt(s,s.next,e)<0}function r0(s,e){let t=s,n=!1;const i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function Gf(s,e){const t=zc(s.i,s.x,s.y),n=zc(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Vu(s,e,t,n){const i=zc(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function $r(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function zc(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function a0(s,e,t,n){let i=0;for(let r=e,a=t-n;r<t;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}class o0{static triangulate(e,t,n=2){return Wg(e,t,n)}}class Xs{static area(e){const t=e.length;let n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return Xs.area(e)<0}static triangulateShape(e,t){const n=[],i=[],r=[];Hu(e),Gu(n,e);let a=e.length;t.forEach(Hu);for(let l=0;l<t.length;l++)i.push(a),a+=t[l].length,Gu(n,t[l]);const o=o0.triangulate(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function Hu(s){const e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function Gu(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}class Ch extends en{constructor(e=new kf([new re(.5,.5),new re(-.5,.5),new re(-.5,-.5),new re(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,i=[],r=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];a(c)}this.setAttribute("position",new zt(i,3)),this.setAttribute("uv",new zt(r,2)),this.computeVertexNormals();function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const p=t.extrudePath,T=t.UVGenerator!==void 0?t.UVGenerator:l0;let S,y=!1,w,P,C,L;if(p){S=p.getSpacedPoints(h),y=!0,d=!1;const J=p.isCatmullRomCurve3?p.closed:!1;w=p.computeFrenetFrames(h,J),P=new I,C=new I,L=new I}d||(g=0,f=0,m=0,_=0);const v=o.extractPoints(c);let b=v.shape;const R=v.holes;if(!Xs.isClockWise(b)){b=b.reverse();for(let J=0,ne=R.length;J<ne;J++){const Q=R[J];Xs.isClockWise(Q)&&(R[J]=Q.reverse())}}function U(J){const Q=10000000000000001e-36;let ge=J[0];for(let A=1;A<=J.length;A++){const De=A%J.length,ve=J[De],Be=ve.x-ge.x,ae=ve.y-ge.y,E=Be*Be+ae*ae,x=Math.max(Math.abs(ve.x),Math.abs(ve.y),Math.abs(ge.x),Math.abs(ge.y)),D=Q*x*x;if(E<=D){J.splice(De,1),A--;continue}ge=ve}}U(b),R.forEach(U);const B=R.length,H=b;for(let J=0;J<B;J++){const ne=R[J];b=b.concat(ne)}function W(J,ne,Q){return ne||ke("ExtrudeGeometry: vec does not exist"),J.clone().addScaledVector(ne,Q)}const z=b.length;function Z(J,ne,Q){let ge,A,De;const ve=J.x-ne.x,Be=J.y-ne.y,ae=Q.x-J.x,E=Q.y-J.y,x=ve*ve+Be*Be,D=ve*E-Be*ae;if(Math.abs(D)>Number.EPSILON){const X=Math.sqrt(x),K=Math.sqrt(ae*ae+E*E),q=ne.x-Be/X,Re=ne.y+ve/X,le=Q.x-E/K,Ce=Q.y+ae/K,ze=((le-q)*E-(Ce-Re)*ae)/(ve*E-Be*ae);ge=q+ve*ze-J.x,A=Re+Be*ze-J.y;const te=ge*ge+A*A;if(te<=2)return new re(ge,A);De=Math.sqrt(te/2)}else{let X=!1;ve>Number.EPSILON?ae>Number.EPSILON&&(X=!0):ve<-Number.EPSILON?ae<-Number.EPSILON&&(X=!0):Math.sign(Be)===Math.sign(E)&&(X=!0),X?(ge=-Be,A=ve,De=Math.sqrt(x)):(ge=ve,A=Be,De=Math.sqrt(x/2))}return new re(ge/De,A/De)}const oe=[];for(let J=0,ne=H.length,Q=ne-1,ge=J+1;J<ne;J++,Q++,ge++)Q===ne&&(Q=0),ge===ne&&(ge=0),oe[J]=Z(H[J],H[Q],H[ge]);const ce=[];let de,Xe=oe.concat();for(let J=0,ne=B;J<ne;J++){const Q=R[J];de=[];for(let ge=0,A=Q.length,De=A-1,ve=ge+1;ge<A;ge++,De++,ve++)De===A&&(De=0),ve===A&&(ve=0),de[ge]=Z(Q[ge],Q[De],Q[ve]);ce.push(de),Xe=Xe.concat(de)}let Ge;if(g===0)Ge=Xs.triangulateShape(H,R);else{const J=[],ne=[];for(let Q=0;Q<g;Q++){const ge=Q/g,A=f*Math.cos(ge*Math.PI/2),De=m*Math.sin(ge*Math.PI/2)+_;for(let ve=0,Be=H.length;ve<Be;ve++){const ae=W(H[ve],oe[ve],De);Oe(ae.x,ae.y,-A),ge===0&&J.push(ae)}for(let ve=0,Be=B;ve<Be;ve++){const ae=R[ve];de=ce[ve];const E=[];for(let x=0,D=ae.length;x<D;x++){const X=W(ae[x],de[x],De);Oe(X.x,X.y,-A),ge===0&&E.push(X)}ge===0&&ne.push(E)}}Ge=Xs.triangulateShape(J,ne)}const pt=Ge.length,mt=m+_;for(let J=0;J<z;J++){const ne=d?W(b[J],Xe[J],mt):b[J];y?(C.copy(w.normals[0]).multiplyScalar(ne.x),P.copy(w.binormals[0]).multiplyScalar(ne.y),L.copy(S[0]).add(C).add(P),Oe(L.x,L.y,L.z)):Oe(ne.x,ne.y,0)}for(let J=1;J<=h;J++)for(let ne=0;ne<z;ne++){const Q=d?W(b[ne],Xe[ne],mt):b[ne];y?(C.copy(w.normals[J]).multiplyScalar(Q.x),P.copy(w.binormals[J]).multiplyScalar(Q.y),L.copy(S[J]).add(C).add(P),Oe(L.x,L.y,L.z)):Oe(Q.x,Q.y,u/h*J)}for(let J=g-1;J>=0;J--){const ne=J/g,Q=f*Math.cos(ne*Math.PI/2),ge=m*Math.sin(ne*Math.PI/2)+_;for(let A=0,De=H.length;A<De;A++){const ve=W(H[A],oe[A],ge);Oe(ve.x,ve.y,u+Q)}for(let A=0,De=R.length;A<De;A++){const ve=R[A];de=ce[A];for(let Be=0,ae=ve.length;Be<ae;Be++){const E=W(ve[Be],de[Be],ge);y?Oe(E.x,E.y+S[h-1].y,S[h-1].x+Q):Oe(E.x,E.y,u+Q)}}}Y(),ee();function Y(){const J=i.length/3;if(d){let ne=0,Q=z*ne;for(let ge=0;ge<pt;ge++){const A=Ge[ge];Te(A[2]+Q,A[1]+Q,A[0]+Q)}ne=h+g*2,Q=z*ne;for(let ge=0;ge<pt;ge++){const A=Ge[ge];Te(A[0]+Q,A[1]+Q,A[2]+Q)}}else{for(let ne=0;ne<pt;ne++){const Q=Ge[ne];Te(Q[2],Q[1],Q[0])}for(let ne=0;ne<pt;ne++){const Q=Ge[ne];Te(Q[0]+z*h,Q[1]+z*h,Q[2]+z*h)}}n.addGroup(J,i.length/3-J,0)}function ee(){const J=i.length/3;let ne=0;Me(H,ne),ne+=H.length;for(let Q=0,ge=R.length;Q<ge;Q++){const A=R[Q];Me(A,ne),ne+=A.length}n.addGroup(J,i.length/3-J,1)}function Me(J,ne){let Q=J.length;for(;--Q>=0;){const ge=Q;let A=Q-1;A<0&&(A=J.length-1);for(let De=0,ve=h+g*2;De<ve;De++){const Be=z*De,ae=z*(De+1),E=ne+ge+Be,x=ne+A+Be,D=ne+A+ae,X=ne+ge+ae;it(E,x,D,X)}}}function Oe(J,ne,Q){l.push(J),l.push(ne),l.push(Q)}function Te(J,ne,Q){gt(J),gt(ne),gt(Q);const ge=i.length/3,A=T.generateTopUV(n,i,ge-3,ge-2,ge-1);qe(A[0]),qe(A[1]),qe(A[2])}function it(J,ne,Q,ge){gt(J),gt(ne),gt(ge),gt(ne),gt(Q),gt(ge);const A=i.length/3,De=T.generateSideWallUV(n,i,A-6,A-3,A-2,A-1);qe(De[0]),qe(De[1]),qe(De[3]),qe(De[1]),qe(De[2]),qe(De[3])}function gt(J){i.push(l[J*3+0]),i.push(l[J*3+1]),i.push(l[J*3+2])}function qe(J){r.push(J.x),r.push(J.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return c0(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,a=e.shapes.length;r<a;r++){const o=t[e.shapes[r]];n.push(o)}const i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new Bc[i.type]().fromJSON(i)),new Ch(n,e.options)}}const l0={generateTopUV:function(s,e,t,n,i){const r=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[i*3],h=e[i*3+1];return[new re(r,a),new re(o,l),new re(c,h)]},generateSideWallUV:function(s,e,t,n,i,r){const a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[i*3],f=e[i*3+1],m=e[i*3+2],_=e[r*3],g=e[r*3+1],p=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new re(a,1-l),new re(c,1-u),new re(d,1-m),new re(_,1-p)]:[new re(o,1-l),new re(h,1-u),new re(f,1-m),new re(g,1-p)]}};function c0(s,e,t){if(t.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){const r=s[n];t.shapes.push(r.uuid)}else t.shapes.push(s.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class ta extends en{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,d=t/l,f=[],m=[],_=[],g=[];for(let p=0;p<h;p++){const T=p*d-a;for(let S=0;S<c;S++){const y=S*u-r;m.push(y,-T,0),_.push(0,0,1),g.push(S/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let T=0;T<o;T++){const S=T+c*p,y=T+c*(p+1),w=T+1+c*(p+1),P=T+1+c*p;f.push(S,y,P),f.push(y,w,P)}this.setIndex(f),this.setAttribute("position",new zt(m,3)),this.setAttribute("normal",new zt(_,3)),this.setAttribute("uv",new zt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ta(e.width,e.height,e.widthSegments,e.heightSegments)}}class Ro extends en{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new I,d=new I,f=[],m=[],_=[],g=[];for(let p=0;p<=n;p++){const T=[],S=p/n;let y=0;p===0&&a===0?y=.5/t:p===n&&l===Math.PI&&(y=-.5/t);for(let w=0;w<=t;w++){const P=w/t;u.x=-e*Math.cos(i+P*r)*Math.sin(a+S*o),u.y=e*Math.cos(a+S*o),u.z=e*Math.sin(i+P*r)*Math.sin(a+S*o),m.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),g.push(P+y,1-S),T.push(c++)}h.push(T)}for(let p=0;p<n;p++)for(let T=0;T<t;T++){const S=h[p][T+1],y=h[p][T],w=h[p+1][T],P=h[p+1][T+1];(p!==0||a>0)&&f.push(S,y,P),(p!==n-1||l<Math.PI)&&f.push(y,w,P)}this.setIndex(f),this.setAttribute("position",new zt(m,3)),this.setAttribute("normal",new zt(_,3)),this.setAttribute("uv",new zt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ro(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class h0 extends zn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Vi extends kn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Pe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Pe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=mh,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class ci extends Vi{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new re(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Je(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Pe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Pe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Pe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class u0 extends kn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Pe(16777215),this.specular=new Pe(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Pe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=mh,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kt,this.combine=rh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class d0 extends kn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Sm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class f0 extends kn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Oa(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function p0(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Wu(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let l=0;l!==e;++l)i[a++]=s[o+l]}return i}function Wf(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)}class na{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class m0 extends na{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Gs,endingEnd:Gs}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,a=e+1,o=i[r],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ws:r=e,o=2*t-n;break;case uo:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ws:a=e,l=2*n-t;break;case uo:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(n-t)/(i-t),_=m*m,g=_*m,p=-d*g+2*d*_-d*m,T=(1+d)*g+(-1.5-2*d)*_+(-.5+d)*m+1,S=(-1-f)*g+(1.5+f)*_+.5*m,y=f*g-f*_;for(let w=0;w!==o;++w)r[w]=p*a[h+w]+T*a[c+w]+S*a[l+w]+y*a[u+w];return r}}class Xf extends na{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}}class g0 extends na{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class jn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Oa(t,this.TimeBufferType),this.values=Oa(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Oa(e.times,Array),values:Oa(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new g0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Xf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new m0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Hr:t=this.InterpolantFactoryMethodDiscrete;break;case Gr:t=this.InterpolantFactoryMethodLinear;break;case Go:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return we("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Hr;case this.InterpolantFactoryMethodLinear:return Gr;case this.InterpolantFactoryMethodSmooth:return Go}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(ke("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(ke("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){ke("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){ke("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&Pm(i))for(let o=0,l=i.length;o!==l;++o){const c=i[o];if(isNaN(c)){ke("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Go,r=e.length-1;let a=1;for(let o=1;o<r;++o){let l=!1;const c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(i)l=!0;else{const u=o*n,d=u-n,f=u+n;for(let m=0;m!==n;++m){const _=t[u+m];if(_!==t[d+m]||_!==t[f+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const u=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}jn.prototype.ValueTypeName="";jn.prototype.TimeBufferType=Float32Array;jn.prototype.ValueBufferType=Float32Array;jn.prototype.DefaultInterpolation=Gr;class sr extends jn{constructor(e,t,n){super(e,t,n)}}sr.prototype.ValueTypeName="bool";sr.prototype.ValueBufferType=Array;sr.prototype.DefaultInterpolation=Hr;sr.prototype.InterpolantFactoryMethodLinear=void 0;sr.prototype.InterpolantFactoryMethodSmooth=void 0;class qf extends jn{constructor(e,t,n,i){super(e,t,n,i)}}qf.prototype.ValueTypeName="color";class tr extends jn{constructor(e,t,n,i){super(e,t,n,i)}}tr.prototype.ValueTypeName="number";class _0 extends na{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t);let c=e*o;for(let h=c+o;c!==h;c+=4)Bt.slerpFlat(r,0,a,c-o,a,c,l);return r}}class nr extends jn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new _0(this.times,this.values,this.getValueSize(),e)}}nr.prototype.ValueTypeName="quaternion";nr.prototype.InterpolantFactoryMethodSmooth=void 0;class rr extends jn{constructor(e,t,n){super(e,t,n)}}rr.prototype.ValueTypeName="string";rr.prototype.ValueBufferType=Array;rr.prototype.DefaultInterpolation=Hr;rr.prototype.InterpolantFactoryMethodLinear=void 0;rr.prototype.InterpolantFactoryMethodSmooth=void 0;class ir extends jn{constructor(e,t,n,i){super(e,t,n,i)}}ir.prototype.ValueTypeName="vector";class Jr{constructor(e="",t=-1,n=[],i=ph){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Bn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(v0(n[a]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(jn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);const h=p0(l);l=Wu(l,1,h),c=Wu(c,1,h),!i&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new tr(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(we("AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return ke("AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,m,_){if(f.length!==0){const g=[],p=[];Wf(f,g,p,m),g.length!==0&&_.push(new u(d,g,p))}},i=[],r=e.name||"default",a=e.fps||30,o=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let _=0;_<d[m].morphTargets.length;_++)f[d[m].morphTargets[_]]=-1;for(const _ in f){const g=[],p=[];for(let T=0;T!==d[m].morphTargets.length;++T){const S=d[m];g.push(S.time),p.push(S.morphTarget===_?1:0)}i.push(new tr(".morphTargetInfluence["+_+"]",g,p))}l=f.length*a}else{const f=".bones["+t[u].name+"]";n(ir,f+".position",d,"pos",i),n(nr,f+".quaternion",d,"rot",i),n(ir,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,l,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function x0(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return tr;case"vector":case"vector2":case"vector3":case"vector4":return ir;case"color":return qf;case"quaternion":return nr;case"bool":case"boolean":return sr;case"string":return rr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function v0(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=x0(s.type);if(s.times===void 0){const t=[],n=[];Wf(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const xi={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class y0{constructor(e,t,n){const i=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const M0=new y0;class vs{constructor(e){this.manager=e!==void 0?e:M0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}vs.DEFAULT_MATERIAL_NAME="__DEFAULT";const gi={};class S0 extends Error{constructor(e,t){super(e),this.response=t}}class Ah extends vs{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=xi.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(gi[e]!==void 0){gi[e].push({onLoad:t,onProgress:n,onError:i});return}gi[e]=[],gi[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&we("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=gi[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,m=f!==0;let _=0;const g=new ReadableStream({start(p){T();function T(){u.read().then(({done:S,value:y})=>{if(S)p.close();else{_+=y.byteLength;const w=new ProgressEvent("progress",{lengthComputable:m,loaded:_,total:f});for(let P=0,C=h.length;P<C;P++){const L=h[P];L.onProgress&&L.onProgress(w)}p.enqueue(y),T()}},S=>{p.error(S)})}}});return new Response(g)}else throw new S0(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o==="")return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(m=>f.decode(m))}}}).then(c=>{xi.add(`file:${e}`,c);const h=gi[e];delete gi[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=gi[e];if(h===void 0)throw this.manager.itemError(e),c;delete gi[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const ks=new WeakMap;class b0 extends vs{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=xi.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=ks.get(a);u===void 0&&(u=[],ks.set(a,u)),u.push({onLoad:t,onError:i})}return a}const o=Wr("img");function l(){h(),t&&t(this);const u=ks.get(this)||[];for(let d=0;d<u.length;d++){const f=u[d];f.onLoad&&f.onLoad(this)}ks.delete(this),r.manager.itemEnd(e)}function c(u){h(),i&&i(u),xi.remove(`image:${e}`);const d=ks.get(this)||[];for(let f=0;f<d.length;f++){const m=d[f];m.onError&&m.onError(u)}ks.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),xi.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class T0 extends vs{constructor(e){super(e)}load(e,t,n,i){const r=new kt,a=new b0(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class Po extends St{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Pe(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const vl=new He,Xu=new I,qu=new I;class Rh{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new re(512,512),this.mapType=Cn,this.map=null,this.mapPass=null,this.matrix=new He,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Sh,this._frameExtents=new re(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Xu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Xu),qu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(qu),t.updateMatrixWorld(),vl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(vl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class w0 extends Rh{constructor(){super(new an(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Zs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class E0 extends Po{constructor(e,t,n=0,i=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.target=new St,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new w0}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class C0 extends Rh{constructor(){super(new an(90,1,.5,500)),this.isPointLightShadow=!0}}class Ph extends Po{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new C0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Io extends Ef{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class A0 extends Rh{constructor(){super(new Io(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Yf extends Po{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.target=new St,this.shadow=new A0}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class R0 extends Po{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Or{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const yl=new WeakMap;class P0 extends vs{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&we("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&we("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=xi.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{if(yl.has(a)===!0)i&&i(yl.get(a)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(c),r.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return xi.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),yl.set(l,c),xi.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});xi.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}let Ba;class jf{static getContext(){return Ba===void 0&&(Ba=new(window.AudioContext||window.webkitAudioContext)),Ba}static setContext(e){Ba=e}}class I0 extends vs{constructor(e){super(e)}load(e,t,n,i){const r=this,a=new Ah(this.manager);a.setResponseType("arraybuffer"),a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(l){try{const c=l.slice(0);jf.getContext().decodeAudioData(c,function(u){t(u)}).catch(o)}catch(c){o(c)}},n,i);function o(l){i?i(l):ke(l),r.manager.itemError(e)}}}class L0 extends an{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Kf{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}const Zi=new I,Ml=new Bt,N0=new I,Qi=new I,es=new I;class D0 extends St{constructor(){super(),this.type="AudioListener",this.context=jf.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._clock=new Kf}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(e){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=e,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}updateMatrixWorld(e){super.updateMatrixWorld(e);const t=this.context.listener;if(this.timeDelta=this._clock.getDelta(),this.matrixWorld.decompose(Zi,Ml,N0),Qi.set(0,0,-1).applyQuaternion(Ml),es.set(0,1,0).applyQuaternion(Ml),t.positionX){const n=this.context.currentTime+this.timeDelta;t.positionX.linearRampToValueAtTime(Zi.x,n),t.positionY.linearRampToValueAtTime(Zi.y,n),t.positionZ.linearRampToValueAtTime(Zi.z,n),t.forwardX.linearRampToValueAtTime(Qi.x,n),t.forwardY.linearRampToValueAtTime(Qi.y,n),t.forwardZ.linearRampToValueAtTime(Qi.z,n),t.upX.linearRampToValueAtTime(es.x,n),t.upY.linearRampToValueAtTime(es.y,n),t.upZ.linearRampToValueAtTime(es.z,n)}else t.setPosition(Zi.x,Zi.y,Zi.z),t.setOrientation(Qi.x,Qi.y,Qi.z,es.x,es.y,es.z)}}class Yu extends St{constructor(e){super(),this.type="Audio",this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){return this.buffer=e,this.sourceType="buffer",this.autoplay&&this.play(),this}play(e=0){if(this.isPlaying===!0){we("Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){we("Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+e;const t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){we("Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(e=0){if(this.hasPlaybackControl===!1){we("Audio: this Audio has no playback control.");return}return this._progress=0,this.source!==null&&(this.source.stop(this.context.currentTime+e),this.source.onended=null),this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected!==!1){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}}getFilters(){return this.filters}setFilters(e){return e||(e=[]),this._connected===!0?(this.disconnect(),this.filters=e.slice(),this.connect()):this.filters=e.slice(),this}setDetune(e){return this.detune=e,this.isPlaying===!0&&this.source.detune!==void 0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){we("Audio: this Audio has no playback control.");return}return this.playbackRate=e,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1,this._progress=0}getLoop(){return this.hasPlaybackControl===!1?(we("Audio: this Audio has no playback control."),!1):this.loop}setLoop(e){if(this.hasPlaybackControl===!1){we("Audio: this Audio has no playback control.");return}return this.loop=e,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}copy(e,t){return super.copy(e,t),e.sourceType!=="buffer"?(we("Audio: Audio source type cannot be copied."),this):(this.autoplay=e.autoplay,this.buffer=e.buffer,this.detune=e.detune,this.loop=e.loop,this.loopStart=e.loopStart,this.loopEnd=e.loopEnd,this.offset=e.offset,this.duration=e.duration,this.playbackRate=e.playbackRate,this.hasPlaybackControl=e.hasPlaybackControl,this.sourceType=e.sourceType,this.filters=e.filters.slice(),this)}clone(e){return new this.constructor(this.listener).copy(this,e)}}class F0{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,a;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,r=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[r+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,r,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,a=i;r!==a;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){Bt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){const a=this._workIndex*r;Bt.multiplyQuaternionsFlat(e,a,e,t,e,n),Bt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,r){const a=1-i;for(let o=0;o!==r;++o){const l=t+o;e[l]=e[l]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,r){for(let a=0;a!==r;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const Ih="\\[\\]\\.:\\/",U0=new RegExp("["+Ih+"]","g"),Lh="[^"+Ih+"]",O0="[^"+Ih.replace("\\.","")+"]",B0=/((?:WC+[\/:])*)/.source.replace("WC",Lh),k0=/(WCOD+)?/.source.replace("WCOD",O0),z0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Lh),V0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Lh),H0=new RegExp("^"+B0+k0+z0+V0+"$"),G0=["material","materials","bones","map"];class W0{constructor(e,t,n){const i=n||ot.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class ot{constructor(e,t,n){this.path=t,this.parsedPath=n||ot.parseTrackName(t),this.node=ot.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new ot.Composite(e,t,n):new ot(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(U0,"")}static parseTrackName(e){const t=H0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);G0.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=ot.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){we("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const a=e[i];if(a===void 0){const c=t.nodeName;ke("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ot.Composite=W0;ot.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ot.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ot.prototype.GetterByBindingType=[ot.prototype._getValue_direct,ot.prototype._getValue_array,ot.prototype._getValue_arrayElement,ot.prototype._getValue_toArray];ot.prototype.SetterByBindingTypeAndVersioning=[[ot.prototype._setValue_direct,ot.prototype._setValue_direct_setNeedsUpdate,ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_array,ot.prototype._setValue_array_setNeedsUpdate,ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_arrayElement,ot.prototype._setValue_arrayElement_setNeedsUpdate,ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_fromArray,ot.prototype._setValue_fromArray_setNeedsUpdate,ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class X0{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const r=t.tracks,a=r.length,o=new Array(a),l={endingStart:Gs,endingEnd:Gs};for(let c=0;c!==a;++c){const h=r[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=_f,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){const i=this._clip.duration,r=e._clip.duration,a=r/i,o=i/r;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,r=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const r=this._startTime;if(r!==null){const l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case ym:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case ph:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,r=this._loopCount;const a=n===vm;if(e===0)return r===-1?i:a&&(r&1)===1?t-i:i;if(n===fh){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,r+=Math.abs(o);const l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=Ws,i.endingEnd=Ws):(e?i.endingStart=this.zeroSlopeAtStart?Ws:Gs:i.endingStart=uo,t?i.endingEnd=this.zeroSlopeAtEnd?Ws:Gs:i.endingEnd=uo)}_scheduleFading(e,t,n){const i=this._mixer,r=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=t,o[1]=r+e,l[1]=n,this}}const q0=new Float32Array(1);class $f extends xs{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==r;++u){const d=i[u],f=d.name;let m=h[f];if(m!==void 0)++m.referenceCount,a[u]=m;else{if(m=a[u],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,l,f));continue}const _=t&&t._propertyBindings[u].binding.parsedPath;m=new F0(ot.create(n,f,_),d.ValueTypeName,d.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,l,f),a[u]=m}o[u].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,r=this._actionsByClip;let a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;const u=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,r=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Xf(new Float32Array(2),new Float32Array(2),1,q0),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){const i=t||this._root,r=i.uuid;let a=typeof e=="string"?Jr.findByName(i,e):e;const o=a!==null?a.uuid:e,l=this._actionsByClip[o];let c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=ph),l!==void 0){const u=l.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;const h=new X0(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,r),h}existingAction(e,t){const n=t||this._root,i=n.uuid,r=typeof e=="string"?Jr.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,a);const o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){const c=a[o];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(const a in r){const o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}function ju(s,e,t,n){const i=Y0(n);switch(t){case mf:return s*e;case ch:return s*e/i.components*i.byteLength;case hh:return s*e/i.components*i.byteLength;case Js:return s*e*2/i.components*i.byteLength;case uh:return s*e*2/i.components*i.byteLength;case gf:return s*e*3/i.components*i.byteLength;case Un:return s*e*4/i.components*i.byteLength;case dh:return s*e*4/i.components*i.byteLength;case Za:case Qa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case eo:case to:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case ic:case rc:return Math.max(s,16)*Math.max(e,8)/4;case nc:case sc:return Math.max(s,8)*Math.max(e,8)/2;case ac:case oc:case cc:case hc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case lc:case uc:case dc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case fc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case pc:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case mc:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case gc:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case _c:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case xc:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case vc:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case yc:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Mc:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Sc:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case bc:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Tc:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case wc:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Ec:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Cc:case Ac:case Rc:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Pc:case Ic:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Lc:case Nc:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Y0(s){switch(s){case Cn:case uf:return{byteLength:1,components:1};case zr:case df:case wi:return{byteLength:2,components:1};case oh:case lh:return{byteLength:2,components:4};case ri:case ah:case Fn:return{byteLength:4,components:1};case ff:case pf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:sh}}));typeof window<"u"&&(window.__THREE__?we("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=sh);function Jf(){let s=null,e=!1,t=null,n=null;function i(r,a){t(r,a),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function j0(s){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){const m=u[d],_=u[f];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){const _=u[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(s.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}var K0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,$0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,J0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Z0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Q0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,e_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,t_=`#ifdef USE_AOMAP
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
#endif`,n_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,i_=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,s_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,r_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,a_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,o_=`float G_BlinnPhong_Implicit( ) {
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
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,l_=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,c_=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,h_=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,u_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,d_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,f_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,p_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,m_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,g_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,__=`#if defined( USE_COLOR_ALPHA )
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
#endif`,x_=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
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
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,v_=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
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
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
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
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
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
			mip = - 2.0 * log2( 1.16 * roughness );		}
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
#endif`,y_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
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
#endif`,M_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,S_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,b_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,T_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,w_="gl_FragColor = linearToOutputTexel( gl_FragColor );",E_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,C_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
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
#endif`,A_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,R_=`#ifdef USE_ENVMAP
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
#endif`,P_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,I_=`#ifdef USE_ENVMAP
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
#endif`,L_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,N_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,D_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,F_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,U_=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,O_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,B_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,k_=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,z_=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
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
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
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
#endif`,V_=`#ifdef USE_ENVMAP
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
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
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
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,H_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,G_=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,W_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,X_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,q_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
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
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
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
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
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
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
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
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Y_=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
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
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
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
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
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
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
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
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
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
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
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
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
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
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
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
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
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
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,j_=`
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
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
#endif`,K_=`#if defined( RE_IndirectDiffuse )
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
#endif`,$_=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,J_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Z_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Q_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ex=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,tx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,nx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ix=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,sx=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ax=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ox=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,lx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,cx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hx=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ux=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,fx=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
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
#endif`,px=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,mx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,_x=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,xx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,vx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,yx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Mx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Sx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,bx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
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
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Tx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,wx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ex=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Cx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ax=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Rx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Px=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Ix=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Lx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Nx=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Dx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Fx=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ux=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ox=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Bx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,kx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,zx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Vx=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
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
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Hx=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Gx=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Wx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Xx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,qx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const jx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Kx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$x=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jx=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Zx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Qx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ev=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
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
}`,tv=`#if DEPTH_PACKING == 3200
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,nv=`#define DISTANCE
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
}`,iv=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
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
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,sv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,rv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,av=`uniform float scale;
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
}`,ov=`uniform vec3 diffuse;
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
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,lv=`#include <common>
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
}`,cv=`uniform vec3 diffuse;
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
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
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
}`,hv=`#define LAMBERT
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
}`,uv=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dv=`#define MATCAP
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
}`,fv=`#define MATCAP
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
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pv=`#define NORMAL
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
}`,mv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
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
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,gv=`#define PHONG
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
}`,_v=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
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
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xv=`#define STANDARD
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
}`,vv=`#define STANDARD
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
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
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
}`,yv=`#define TOON
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
}`,Mv=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sv=`uniform float size;
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
}`,bv=`uniform vec3 diffuse;
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
}`,Tv=`#include <common>
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
}`,wv=`uniform vec3 color;
uniform float opacity;
#include <common>
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
}`,Ev=`uniform float rotation;
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
}`,Cv=`uniform vec3 diffuse;
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
}`,Ke={alphahash_fragment:K0,alphahash_pars_fragment:$0,alphamap_fragment:J0,alphamap_pars_fragment:Z0,alphatest_fragment:Q0,alphatest_pars_fragment:e_,aomap_fragment:t_,aomap_pars_fragment:n_,batching_pars_vertex:i_,batching_vertex:s_,begin_vertex:r_,beginnormal_vertex:a_,bsdfs:o_,iridescence_fragment:l_,bumpmap_pars_fragment:c_,clipping_planes_fragment:h_,clipping_planes_pars_fragment:u_,clipping_planes_pars_vertex:d_,clipping_planes_vertex:f_,color_fragment:p_,color_pars_fragment:m_,color_pars_vertex:g_,color_vertex:__,common:x_,cube_uv_reflection_fragment:v_,defaultnormal_vertex:y_,displacementmap_pars_vertex:M_,displacementmap_vertex:S_,emissivemap_fragment:b_,emissivemap_pars_fragment:T_,colorspace_fragment:w_,colorspace_pars_fragment:E_,envmap_fragment:C_,envmap_common_pars_fragment:A_,envmap_pars_fragment:R_,envmap_pars_vertex:P_,envmap_physical_pars_fragment:V_,envmap_vertex:I_,fog_vertex:L_,fog_pars_vertex:N_,fog_fragment:D_,fog_pars_fragment:F_,gradientmap_pars_fragment:U_,lightmap_pars_fragment:O_,lights_lambert_fragment:B_,lights_lambert_pars_fragment:k_,lights_pars_begin:z_,lights_toon_fragment:H_,lights_toon_pars_fragment:G_,lights_phong_fragment:W_,lights_phong_pars_fragment:X_,lights_physical_fragment:q_,lights_physical_pars_fragment:Y_,lights_fragment_begin:j_,lights_fragment_maps:K_,lights_fragment_end:$_,logdepthbuf_fragment:J_,logdepthbuf_pars_fragment:Z_,logdepthbuf_pars_vertex:Q_,logdepthbuf_vertex:ex,map_fragment:tx,map_pars_fragment:nx,map_particle_fragment:ix,map_particle_pars_fragment:sx,metalnessmap_fragment:rx,metalnessmap_pars_fragment:ax,morphinstance_vertex:ox,morphcolor_vertex:lx,morphnormal_vertex:cx,morphtarget_pars_vertex:hx,morphtarget_vertex:ux,normal_fragment_begin:dx,normal_fragment_maps:fx,normal_pars_fragment:px,normal_pars_vertex:mx,normal_vertex:gx,normalmap_pars_fragment:_x,clearcoat_normal_fragment_begin:xx,clearcoat_normal_fragment_maps:vx,clearcoat_pars_fragment:yx,iridescence_pars_fragment:Mx,opaque_fragment:Sx,packing:bx,premultiplied_alpha_fragment:Tx,project_vertex:wx,dithering_fragment:Ex,dithering_pars_fragment:Cx,roughnessmap_fragment:Ax,roughnessmap_pars_fragment:Rx,shadowmap_pars_fragment:Px,shadowmap_pars_vertex:Ix,shadowmap_vertex:Lx,shadowmask_pars_fragment:Nx,skinbase_vertex:Dx,skinning_pars_vertex:Fx,skinning_vertex:Ux,skinnormal_vertex:Ox,specularmap_fragment:Bx,specularmap_pars_fragment:kx,tonemapping_fragment:zx,tonemapping_pars_fragment:Vx,transmission_fragment:Hx,transmission_pars_fragment:Gx,uv_pars_fragment:Wx,uv_pars_vertex:Xx,uv_vertex:qx,worldpos_vertex:Yx,background_vert:jx,background_frag:Kx,backgroundCube_vert:$x,backgroundCube_frag:Jx,cube_vert:Zx,cube_frag:Qx,depth_vert:ev,depth_frag:tv,distance_vert:nv,distance_frag:iv,equirect_vert:sv,equirect_frag:rv,linedashed_vert:av,linedashed_frag:ov,meshbasic_vert:lv,meshbasic_frag:cv,meshlambert_vert:hv,meshlambert_frag:uv,meshmatcap_vert:dv,meshmatcap_frag:fv,meshnormal_vert:pv,meshnormal_frag:mv,meshphong_vert:gv,meshphong_frag:_v,meshphysical_vert:xv,meshphysical_frag:vv,meshtoon_vert:yv,meshtoon_frag:Mv,points_vert:Sv,points_frag:bv,shadow_vert:Tv,shadow_frag:wv,sprite_vert:Ev,sprite_frag:Cv},me={common:{diffuse:{value:new Pe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Pe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Pe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Pe(16777215)},opacity:{value:1},center:{value:new re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},ei={basic:{uniforms:sn([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ke.meshbasic_vert,fragmentShader:Ke.meshbasic_frag},lambert:{uniforms:sn([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Pe(0)}}]),vertexShader:Ke.meshlambert_vert,fragmentShader:Ke.meshlambert_frag},phong:{uniforms:sn([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Pe(0)},specular:{value:new Pe(1118481)},shininess:{value:30}}]),vertexShader:Ke.meshphong_vert,fragmentShader:Ke.meshphong_frag},standard:{uniforms:sn([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Pe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ke.meshphysical_vert,fragmentShader:Ke.meshphysical_frag},toon:{uniforms:sn([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Pe(0)}}]),vertexShader:Ke.meshtoon_vert,fragmentShader:Ke.meshtoon_frag},matcap:{uniforms:sn([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ke.meshmatcap_vert,fragmentShader:Ke.meshmatcap_frag},points:{uniforms:sn([me.points,me.fog]),vertexShader:Ke.points_vert,fragmentShader:Ke.points_frag},dashed:{uniforms:sn([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ke.linedashed_vert,fragmentShader:Ke.linedashed_frag},depth:{uniforms:sn([me.common,me.displacementmap]),vertexShader:Ke.depth_vert,fragmentShader:Ke.depth_frag},normal:{uniforms:sn([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ke.meshnormal_vert,fragmentShader:Ke.meshnormal_frag},sprite:{uniforms:sn([me.sprite,me.fog]),vertexShader:Ke.sprite_vert,fragmentShader:Ke.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ke.background_vert,fragmentShader:Ke.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:Ke.backgroundCube_vert,fragmentShader:Ke.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ke.cube_vert,fragmentShader:Ke.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ke.equirect_vert,fragmentShader:Ke.equirect_frag},distance:{uniforms:sn([me.common,me.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ke.distance_vert,fragmentShader:Ke.distance_frag},shadow:{uniforms:sn([me.lights,me.fog,{color:{value:new Pe(0)},opacity:{value:1}}]),vertexShader:Ke.shadow_vert,fragmentShader:Ke.shadow_frag}};ei.physical={uniforms:sn([ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Pe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Pe(0)},specularColor:{value:new Pe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:Ke.meshphysical_vert,fragmentShader:Ke.meshphysical_frag};const ka={r:0,b:0,g:0},ts=new Kt,Av=new He;function Rv(s,e,t,n,i,r,a){const o=new Pe(0);let l=r===!0?0:1,c,h,u=null,d=0,f=null;function m(S){let y=S.isScene===!0?S.background:null;return y&&y.isTexture&&(y=(S.backgroundBlurriness>0?t:e).get(y)),y}function _(S){let y=!1;const w=m(S);w===null?p(o,l):w&&w.isColor&&(p(w,1),y=!0);const P=s.xr.getEnvironmentBlendMode();P==="additive"?n.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function g(S,y){const w=m(y);w&&(w.isCubeTexture||w.mapping===Co)?(h===void 0&&(h=new lt(new Si(1,1,1),new zn({name:"BackgroundCubeMaterial",uniforms:Qs(ei.backgroundCube.uniforms),vertexShader:ei.backgroundCube.vertexShader,fragmentShader:ei.backgroundCube.fragmentShader,side:gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(P,C,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),ts.copy(y.backgroundRotation),ts.x*=-1,ts.y*=-1,ts.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ts.y*=-1,ts.z*=-1),h.material.uniforms.envMap.value=w,h.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Av.makeRotationFromEuler(ts)),h.material.toneMapped=nt.getTransfer(w.colorSpace)!==ut,(u!==w||d!==w.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=w,d=w.version,f=s.toneMapping),h.layers.enableAll(),S.unshift(h,h.geometry,h.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new lt(new ta(2,2),new zn({name:"BackgroundMaterial",uniforms:Qs(ei.background.uniforms),vertexShader:ei.background.vertexShader,fragmentShader:ei.background.fragmentShader,side:Ti,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=nt.getTransfer(w.colorSpace)!==ut,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(u!==w||d!==w.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,u=w,d=w.version,f=s.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function p(S,y){S.getRGB(ka,wf(s)),n.buffers.color.setClear(ka.r,ka.g,ka.b,y,a)}function T(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(S,y=1){o.set(S),l=y,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,p(o,l)},render:_,addToRenderList:g,dispose:T}}function Pv(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null);let r=i,a=!1;function o(b,R,F,U,B){let H=!1;const W=u(U,F,R);r!==W&&(r=W,c(r.object)),H=f(b,U,F,B),H&&m(b,U,F,B),B!==null&&e.update(B,s.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,y(b,R,F,U),B!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return s.createVertexArray()}function c(b){return s.bindVertexArray(b)}function h(b){return s.deleteVertexArray(b)}function u(b,R,F){const U=F.wireframe===!0;let B=n[b.id];B===void 0&&(B={},n[b.id]=B);let H=B[R.id];H===void 0&&(H={},B[R.id]=H);let W=H[U];return W===void 0&&(W=d(l()),H[U]=W),W}function d(b){const R=[],F=[],U=[];for(let B=0;B<t;B++)R[B]=0,F[B]=0,U[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:F,attributeDivisors:U,object:b,attributes:{},index:null}}function f(b,R,F,U){const B=r.attributes,H=R.attributes;let W=0;const z=F.getAttributes();for(const Z in z)if(z[Z].location>=0){const ce=B[Z];let de=H[Z];if(de===void 0&&(Z==="instanceMatrix"&&b.instanceMatrix&&(de=b.instanceMatrix),Z==="instanceColor"&&b.instanceColor&&(de=b.instanceColor)),ce===void 0||ce.attribute!==de||de&&ce.data!==de.data)return!0;W++}return r.attributesNum!==W||r.index!==U}function m(b,R,F,U){const B={},H=R.attributes;let W=0;const z=F.getAttributes();for(const Z in z)if(z[Z].location>=0){let ce=H[Z];ce===void 0&&(Z==="instanceMatrix"&&b.instanceMatrix&&(ce=b.instanceMatrix),Z==="instanceColor"&&b.instanceColor&&(ce=b.instanceColor));const de={};de.attribute=ce,ce&&ce.data&&(de.data=ce.data),B[Z]=de,W++}r.attributes=B,r.attributesNum=W,r.index=U}function _(){const b=r.newAttributes;for(let R=0,F=b.length;R<F;R++)b[R]=0}function g(b){p(b,0)}function p(b,R){const F=r.newAttributes,U=r.enabledAttributes,B=r.attributeDivisors;F[b]=1,U[b]===0&&(s.enableVertexAttribArray(b),U[b]=1),B[b]!==R&&(s.vertexAttribDivisor(b,R),B[b]=R)}function T(){const b=r.newAttributes,R=r.enabledAttributes;for(let F=0,U=R.length;F<U;F++)R[F]!==b[F]&&(s.disableVertexAttribArray(F),R[F]=0)}function S(b,R,F,U,B,H,W){W===!0?s.vertexAttribIPointer(b,R,F,B,H):s.vertexAttribPointer(b,R,F,U,B,H)}function y(b,R,F,U){_();const B=U.attributes,H=F.getAttributes(),W=R.defaultAttributeValues;for(const z in H){const Z=H[z];if(Z.location>=0){let oe=B[z];if(oe===void 0&&(z==="instanceMatrix"&&b.instanceMatrix&&(oe=b.instanceMatrix),z==="instanceColor"&&b.instanceColor&&(oe=b.instanceColor)),oe!==void 0){const ce=oe.normalized,de=oe.itemSize,Xe=e.get(oe);if(Xe===void 0)continue;const Ge=Xe.buffer,pt=Xe.type,mt=Xe.bytesPerElement,Y=pt===s.INT||pt===s.UNSIGNED_INT||oe.gpuType===ah;if(oe.isInterleavedBufferAttribute){const ee=oe.data,Me=ee.stride,Oe=oe.offset;if(ee.isInstancedInterleavedBuffer){for(let Te=0;Te<Z.locationSize;Te++)p(Z.location+Te,ee.meshPerAttribute);b.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Te=0;Te<Z.locationSize;Te++)g(Z.location+Te);s.bindBuffer(s.ARRAY_BUFFER,Ge);for(let Te=0;Te<Z.locationSize;Te++)S(Z.location+Te,de/Z.locationSize,pt,ce,Me*mt,(Oe+de/Z.locationSize*Te)*mt,Y)}else{if(oe.isInstancedBufferAttribute){for(let ee=0;ee<Z.locationSize;ee++)p(Z.location+ee,oe.meshPerAttribute);b.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let ee=0;ee<Z.locationSize;ee++)g(Z.location+ee);s.bindBuffer(s.ARRAY_BUFFER,Ge);for(let ee=0;ee<Z.locationSize;ee++)S(Z.location+ee,de/Z.locationSize,pt,ce,de*mt,de/Z.locationSize*ee*mt,Y)}}else if(W!==void 0){const ce=W[z];if(ce!==void 0)switch(ce.length){case 2:s.vertexAttrib2fv(Z.location,ce);break;case 3:s.vertexAttrib3fv(Z.location,ce);break;case 4:s.vertexAttrib4fv(Z.location,ce);break;default:s.vertexAttrib1fv(Z.location,ce)}}}}T()}function w(){L();for(const b in n){const R=n[b];for(const F in R){const U=R[F];for(const B in U)h(U[B].object),delete U[B];delete R[F]}delete n[b]}}function P(b){if(n[b.id]===void 0)return;const R=n[b.id];for(const F in R){const U=R[F];for(const B in U)h(U[B].object),delete U[B];delete R[F]}delete n[b.id]}function C(b){for(const R in n){const F=n[R];if(F[b.id]===void 0)continue;const U=F[b.id];for(const B in U)h(U[B].object),delete U[B];delete F[b.id]}}function L(){v(),a=!0,r!==i&&(r=i,c(r.object))}function v(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:L,resetDefaultState:v,dispose:w,releaseStatesOfGeometry:P,releaseStatesOfProgram:C,initAttributes:_,enableAttribute:g,disableUnusedAttributes:T}}function Iv(s,e,t){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let m=0;m<u;m++)f+=h[m];t.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let m=0;m<c.length;m++)a(c[m],h[m],d[m]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let m=0;for(let _=0;_<u;_++)m+=h[_]*d[_];t.update(m,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Lv(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(C){return!(C!==Un&&n.convert(C)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){const L=C===wi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==Cn&&n.convert(C)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Fn&&!L)}function l(C){if(C==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(we("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),m=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),T=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),S=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),w=s.getParameter(s.MAX_SAMPLES),P=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:T,maxVaryings:S,maxFragmentUniforms:y,maxSamples:w,samples:P}}function Nv(s){const e=this;let t=null,n=0,i=!1,r=!1;const a=new rs,o=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const m=u.clippingPlanes,_=u.clipIntersection,g=u.clipShadows,p=s.get(u);if(!i||m===null||m.length===0||r&&!g)r?h(null):c();else{const T=r?0:n,S=T*4;let y=p.clippingState||null;l.value=y,y=h(m,d,S,f);for(let w=0;w!==S;++w)y[w]=t[w];p.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,m){const _=u!==null?u.length:0;let g=null;if(_!==0){if(g=l.value,m!==!0||g===null){const p=f+_*4,T=d.matrixWorldInverse;o.getNormalMatrix(T),(g===null||g.length<p)&&(g=new Float32Array(p));for(let S=0,y=f;S!==_;++S,y+=4)a.copy(u[S]).applyMatrix4(T,o),a.normal.toArray(g,y),g[y+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,g}}function Dv(s){let e=new WeakMap;function t(a,o){return o===ec?a.mapping=ps:o===tc&&(a.mapping=Ks),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===ec||o===tc)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Af(l.height);return c.fromEquirectangularTexture(s,a),e.set(a,c),a.addEventListener("dispose",i),t(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const ki=4,Ku=[.125,.215,.35,.446,.526,.582],os=20,Fv=256,Sr=new Io,$u=new Pe;let Sl=null,bl=0,Tl=0,wl=!1;const Uv=new I;class Ju{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){const{size:a=256,position:o=Uv}=r;Sl=this._renderer.getRenderTarget(),bl=this._renderer.getActiveCubeFace(),Tl=this._renderer.getActiveMipmapLevel(),wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,i,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ed(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Sl,bl,Tl),this._renderer.xr.enabled=wl,e.scissorTest=!1,zs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ps||e.mapping===Ks?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Sl=this._renderer.getRenderTarget(),bl=this._renderer.getActiveCubeFace(),Tl=this._renderer.getActiveMipmapLevel(),wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Et,minFilter:Et,generateMipmaps:!1,type:wi,format:Un,colorSpace:cn,depthBuffer:!1},i=Zu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Zu(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Ov(r)),this._blurMaterial=kv(r,e,t),this._ggxMaterial=Bv(r,e,t)}return i}_compileMaterial(e){const t=new lt(new en,e);this._renderer.compile(t,Sr)}_sceneToCubeUV(e,t,n,i,r){const l=new an(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor($u),u.toneMapping=ii,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new lt(new Si,new On({name:"PMREM.Background",side:gn,depthWrite:!1,depthTest:!1})));const _=this._backgroundBox,g=_.material;let p=!1;const T=e.background;T?T.isColor&&(g.color.copy(T),e.background=null,p=!0):(g.color.copy($u),p=!0);for(let S=0;S<6;S++){const y=S%3;y===0?(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[S],r.y,r.z)):y===1?(l.up.set(0,0,c[S]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[S],r.z)):(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[S]));const w=this._cubeSize;zs(i,y*w,S>2?w:0,w,w),u.setRenderTarget(i),p&&u.render(_,l),u.render(e,l)}u.toneMapping=f,u.autoClear=d,e.background=T}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===ps||e.mapping===Ks;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=ed()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qu());const r=i?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;zs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Sr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const i=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const l=a.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=0+c*1.25,f=u*d,{_lodMax:m}=this,_=this._sizeLods[n],g=3*_*(n>m-ki?n-m+ki:0),p=4*(this._cubeSize-_);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=m-t,zs(r,g,p,3*_,2*_),i.setRenderTarget(r),i.render(o,Sr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-n,zs(e,g,p,3*_,2*_),i.setRenderTarget(e),i.render(o,Sr)}_blur(e,t,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",r),this._halfBlur(a,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&ke("blur direction must be either latitudinal or longitudinal!");const h=3,u=this._lodMeshes[i];u.material=c;const d=c.uniforms,f=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*os-1),_=r/m,g=isFinite(r)?1+Math.floor(h*_):os;g>os&&we(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${os}`);const p=[];let T=0;for(let C=0;C<os;++C){const L=C/_,v=Math.exp(-L*L/2);p.push(v),C===0?T+=v:C<g&&(T+=2*v)}for(let C=0;C<p.length;C++)p[C]=p[C]/T;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:S}=this;d.dTheta.value=m,d.mipInt.value=S-n;const y=this._sizeLods[i],w=3*y*(i>S-ki?i-S+ki:0),P=4*(this._cubeSize-y);zs(t,w,P,3*y,2*y),l.setRenderTarget(t),l.render(u,Sr)}}function Ov(s){const e=[],t=[],n=[];let i=s;const r=s-ki+1+Ku.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);e.push(o);let l=1/o;a>s-ki?l=Ku[a-s+ki-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,m=6,_=3,g=2,p=1,T=new Float32Array(_*m*f),S=new Float32Array(g*m*f),y=new Float32Array(p*m*f);for(let P=0;P<f;P++){const C=P%3*2/3-1,L=P>2?0:-1,v=[C,L,0,C+2/3,L,0,C+2/3,L+1,0,C,L,0,C+2/3,L+1,0,C,L+1,0];T.set(v,_*m*P),S.set(d,g*m*P);const b=[P,P,P,P,P,P];y.set(b,p*m*P)}const w=new en;w.setAttribute("position",new ln(T,_)),w.setAttribute("uv",new ln(S,g)),w.setAttribute("faceIndex",new ln(y,p)),n.push(new lt(w,null)),i>ki&&i--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function Zu(s,e,t){const n=new si(s,e,t);return n.texture.mapping=Co,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function zs(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Bv(s,e,t){return new zn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Fv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Lo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:yi,depthTest:!1,depthWrite:!1})}function kv(s,e,t){const n=new Float32Array(os),i=new I(0,1,0);return new zn({name:"SphericalGaussianBlur",defines:{n:os,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Lo(),fragmentShader:`

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
		`,blending:yi,depthTest:!1,depthWrite:!1})}function Qu(){return new zn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Lo(),fragmentShader:`

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
		`,blending:yi,depthTest:!1,depthWrite:!1})}function ed(){return new zn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Lo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:yi,depthTest:!1,depthWrite:!1})}function Lo(){return`

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
	`}function zv(s){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===ec||l===tc,h=l===ps||l===Ks;if(c||h){let u=e.get(o);const d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new Ju(s)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const f=o.image;return c&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new Ju(s)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Vv(s){const e={};function t(n){if(e[n]!==void 0)return e[n];const i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Xr("WebGLRenderer: "+n+" extension not supported."),i}}}function Hv(s,e,t,n){const i={},r=new WeakMap;function a(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const m in d.attributes)e.remove(d.attributes[m]);d.removeEventListener("dispose",a),delete i[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const f in d)e.update(d[f],s.ARRAY_BUFFER)}function c(u){const d=[],f=u.index,m=u.attributes.position;let _=0;if(f!==null){const T=f.array;_=f.version;for(let S=0,y=T.length;S<y;S+=3){const w=T[S+0],P=T[S+1],C=T[S+2];d.push(w,P,P,C,C,w)}}else if(m!==void 0){const T=m.array;_=m.version;for(let S=0,y=T.length/3-1;S<y;S+=3){const w=S+0,P=S+1,C=S+2;d.push(w,P,P,C,C,w)}}else return;const g=new(vf(d)?Tf:bf)(d,1);g.version=_;const p=r.get(u);p&&e.remove(p),r.set(u,g)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Gv(s,e,t){let n;function i(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,f){s.drawElements(n,f,r,d*a),t.update(f,n,1)}function c(d,f,m){m!==0&&(s.drawElementsInstanced(n,f,r,d*a,m),t.update(f,n,m))}function h(d,f,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,m);let g=0;for(let p=0;p<m;p++)g+=f[p];t.update(g,n,1)}function u(d,f,m,_){if(m===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<d.length;p++)c(d[p]/a,f[p],_[p]);else{g.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,m);let p=0;for(let T=0;T<m;T++)p+=f[T]*_[T];t.update(p,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Wv(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:ke("WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Xv(s,e,t){const n=new WeakMap,i=new bt;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let b=function(){L.dispose(),n.delete(o),o.removeEventListener("dispose",b)};var f=b;d!==void 0&&d.texture.dispose();const m=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],T=o.morphAttributes.normal||[],S=o.morphAttributes.color||[];let y=0;m===!0&&(y=1),_===!0&&(y=2),g===!0&&(y=3);let w=o.attributes.position.count*y,P=1;w>e.maxTextureSize&&(P=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const C=new Float32Array(w*P*4*u),L=new yf(C,w,P,u);L.type=Fn,L.needsUpdate=!0;const v=y*4;for(let R=0;R<u;R++){const F=p[R],U=T[R],B=S[R],H=w*P*4*R;for(let W=0;W<F.count;W++){const z=W*v;m===!0&&(i.fromBufferAttribute(F,W),C[H+z+0]=i.x,C[H+z+1]=i.y,C[H+z+2]=i.z,C[H+z+3]=0),_===!0&&(i.fromBufferAttribute(U,W),C[H+z+4]=i.x,C[H+z+5]=i.y,C[H+z+6]=i.z,C[H+z+7]=0),g===!0&&(i.fromBufferAttribute(B,W),C[H+z+8]=i.x,C[H+z+9]=i.y,C[H+z+10]=i.z,C[H+z+11]=B.itemSize===4?i.w:1)}}d={count:u,texture:L,size:new re(w,P)},n.set(o,d),o.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let m=0;for(let g=0;g<c.length;g++)m+=c[g];const _=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(s,"morphTargetBaseInfluence",_),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function qv(s,e,t,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}const Yv={[tf]:"LINEAR_TONE_MAPPING",[nf]:"REINHARD_TONE_MAPPING",[sf]:"CINEON_TONE_MAPPING",[rf]:"ACES_FILMIC_TONE_MAPPING",[of]:"AGX_TONE_MAPPING",[lf]:"NEUTRAL_TONE_MAPPING",[af]:"CUSTOM_TONE_MAPPING"};function jv(s,e,t,n,i){const r=new si(e,t,{type:s,depthBuffer:n,stencilBuffer:i}),a=new si(e,t,{type:wi,depthBuffer:!1,stencilBuffer:!1}),o=new en;o.setAttribute("position",new zt([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new zt([0,2,0,0,2,0],2));const l=new h0({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new lt(o,l),h=new Io(-1,1,1,-1,0,1);let u=null,d=null,f=!1,m,_=null,g=[],p=!1;this.setSize=function(T,S){r.setSize(T,S),a.setSize(T,S);for(let y=0;y<g.length;y++){const w=g[y];w.setSize&&w.setSize(T,S)}},this.setEffects=function(T){g=T,p=g.length>0&&g[0].isRenderPass===!0;const S=r.width,y=r.height;for(let w=0;w<g.length;w++){const P=g[w];P.setSize&&P.setSize(S,y)}},this.begin=function(T,S){if(f||T.toneMapping===ii&&g.length===0)return!1;if(_=S,S!==null){const y=S.width,w=S.height;(r.width!==y||r.height!==w)&&this.setSize(y,w)}return p===!1&&T.setRenderTarget(r),m=T.toneMapping,T.toneMapping=ii,!0},this.hasRenderPass=function(){return p},this.end=function(T,S){T.toneMapping=m,f=!0;let y=r,w=a;for(let P=0;P<g.length;P++){const C=g[P];if(C.enabled!==!1&&(C.render(T,w,y,S),C.needsSwap!==!1)){const L=y;y=w,w=L}}if(u!==T.outputColorSpace||d!==T.toneMapping){u=T.outputColorSpace,d=T.toneMapping,l.defines={},nt.getTransfer(u)===ut&&(l.defines.SRGB_TRANSFER="");const P=Yv[d];P&&(l.defines[P]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=y.texture,T.setRenderTarget(_),T.render(c,h),_=null,f=!1},this.isCompositing=function(){return f},this.dispose=function(){r.dispose(),a.dispose(),o.dispose(),l.dispose()}}const Zf=new kt,Vc=new Yr(1,1),Qf=new yf,ep=new eg,tp=new Cf,td=[],nd=[],id=new Float32Array(16),sd=new Float32Array(9),rd=new Float32Array(4);function ar(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=td[i];if(r===void 0&&(r=new Float32Array(i),td[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Vt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Ht(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function No(s,e){let t=nd[e];t===void 0&&(t=new Int32Array(e),nd[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function Kv(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function $v(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;s.uniform2fv(this.addr,e),Ht(t,e)}}function Jv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Vt(t,e))return;s.uniform3fv(this.addr,e),Ht(t,e)}}function Zv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;s.uniform4fv(this.addr,e),Ht(t,e)}}function Qv(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Vt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Ht(t,e)}else{if(Vt(t,n))return;rd.set(n),s.uniformMatrix2fv(this.addr,!1,rd),Ht(t,n)}}function ey(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Vt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Ht(t,e)}else{if(Vt(t,n))return;sd.set(n),s.uniformMatrix3fv(this.addr,!1,sd),Ht(t,n)}}function ty(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Vt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Ht(t,e)}else{if(Vt(t,n))return;id.set(n),s.uniformMatrix4fv(this.addr,!1,id),Ht(t,n)}}function ny(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function iy(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;s.uniform2iv(this.addr,e),Ht(t,e)}}function sy(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Vt(t,e))return;s.uniform3iv(this.addr,e),Ht(t,e)}}function ry(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;s.uniform4iv(this.addr,e),Ht(t,e)}}function ay(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function oy(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;s.uniform2uiv(this.addr,e),Ht(t,e)}}function ly(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Vt(t,e))return;s.uniform3uiv(this.addr,e),Ht(t,e)}}function cy(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;s.uniform4uiv(this.addr,e),Ht(t,e)}}function hy(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Vc.compareFunction=t.isReversedDepthBuffer()?_h:gh,r=Vc):r=Zf,t.setTexture2D(e||r,i)}function uy(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||ep,i)}function dy(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||tp,i)}function fy(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Qf,i)}function py(s){switch(s){case 5126:return Kv;case 35664:return $v;case 35665:return Jv;case 35666:return Zv;case 35674:return Qv;case 35675:return ey;case 35676:return ty;case 5124:case 35670:return ny;case 35667:case 35671:return iy;case 35668:case 35672:return sy;case 35669:case 35673:return ry;case 5125:return ay;case 36294:return oy;case 36295:return ly;case 36296:return cy;case 35678:case 36198:case 36298:case 36306:case 35682:return hy;case 35679:case 36299:case 36307:return uy;case 35680:case 36300:case 36308:case 36293:return dy;case 36289:case 36303:case 36311:case 36292:return fy}}function my(s,e){s.uniform1fv(this.addr,e)}function gy(s,e){const t=ar(e,this.size,2);s.uniform2fv(this.addr,t)}function _y(s,e){const t=ar(e,this.size,3);s.uniform3fv(this.addr,t)}function xy(s,e){const t=ar(e,this.size,4);s.uniform4fv(this.addr,t)}function vy(s,e){const t=ar(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function yy(s,e){const t=ar(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function My(s,e){const t=ar(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Sy(s,e){s.uniform1iv(this.addr,e)}function by(s,e){s.uniform2iv(this.addr,e)}function Ty(s,e){s.uniform3iv(this.addr,e)}function wy(s,e){s.uniform4iv(this.addr,e)}function Ey(s,e){s.uniform1uiv(this.addr,e)}function Cy(s,e){s.uniform2uiv(this.addr,e)}function Ay(s,e){s.uniform3uiv(this.addr,e)}function Ry(s,e){s.uniform4uiv(this.addr,e)}function Py(s,e,t){const n=this.cache,i=e.length,r=No(t,i);Vt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=Vc:a=Zf;for(let o=0;o!==i;++o)t.setTexture2D(e[o]||a,r[o])}function Iy(s,e,t){const n=this.cache,i=e.length,r=No(t,i);Vt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||ep,r[a])}function Ly(s,e,t){const n=this.cache,i=e.length,r=No(t,i);Vt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||tp,r[a])}function Ny(s,e,t){const n=this.cache,i=e.length,r=No(t,i);Vt(n,r)||(s.uniform1iv(this.addr,r),Ht(n,r));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Qf,r[a])}function Dy(s){switch(s){case 5126:return my;case 35664:return gy;case 35665:return _y;case 35666:return xy;case 35674:return vy;case 35675:return yy;case 35676:return My;case 5124:case 35670:return Sy;case 35667:case 35671:return by;case 35668:case 35672:return Ty;case 35669:case 35673:return wy;case 5125:return Ey;case 36294:return Cy;case 36295:return Ay;case 36296:return Ry;case 35678:case 36198:case 36298:case 36306:case 35682:return Py;case 35679:case 36299:case 36307:return Iy;case 35680:case 36300:case 36308:case 36293:return Ly;case 36289:case 36303:case 36311:case 36292:return Ny}}class Fy{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=py(t.type)}}class Uy{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Dy(t.type)}}class Oy{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(e,t[o.id],n)}}}const El=/(\w+)(\])?(\[|\.)?/g;function ad(s,e){s.seq.push(e),s.map[e.id]=e}function By(s,e,t){const n=s.name,i=n.length;for(El.lastIndex=0;;){const r=El.exec(n),a=El.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){ad(t,c===void 0?new Fy(o,s,e):new Uy(o,s,e));break}else{let u=t.map[o];u===void 0&&(u=new Oy(o),ad(t,u)),t=u}}}class no{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);By(o,l,this)}const i=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(a):r.push(a);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function od(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const ky=37297;let zy=0;function Vy(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const ld=new Ye;function Hy(s){nt._getMatrix(ld,nt.workingColorSpace,s);const e=`mat3( ${ld.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(s)){case fo:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return we("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function cd(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Vy(s.getShaderSource(e),o)}else return r}function Gy(s,e){const t=Hy(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Wy={[tf]:"Linear",[nf]:"Reinhard",[sf]:"Cineon",[rf]:"ACESFilmic",[of]:"AgX",[lf]:"Neutral",[af]:"Custom"};function Xy(s,e){const t=Wy[e];return t===void 0?(we("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const za=new I;function qy(){nt.getLuminanceCoefficients(za);const s=za.x.toFixed(4),e=za.y.toFixed(4),t=za.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Yy(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ir).join(`
`)}function jy(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Ky(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function Ir(s){return s!==""}function hd(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ud(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const $y=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hc(s){return s.replace($y,Zy)}const Jy=new Map;function Zy(s,e){let t=Ke[e];if(t===void 0){const n=Jy.get(e);if(n!==void 0)t=Ke[n],we('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Hc(t)}const Qy=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function dd(s){return s.replace(Qy,eM)}function eM(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function fd(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const tM={[$a]:"SHADOWMAP_TYPE_PCF",[Ar]:"SHADOWMAP_TYPE_VSM"};function nM(s){return tM[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const iM={[ps]:"ENVMAP_TYPE_CUBE",[Ks]:"ENVMAP_TYPE_CUBE",[Co]:"ENVMAP_TYPE_CUBE_UV"};function sM(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":iM[s.envMapMode]||"ENVMAP_TYPE_CUBE"}const rM={[Ks]:"ENVMAP_MODE_REFRACTION"};function aM(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":rM[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}const oM={[rh]:"ENVMAP_BLENDING_MULTIPLY",[gm]:"ENVMAP_BLENDING_MIX",[_m]:"ENVMAP_BLENDING_ADD"};function lM(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":oM[s.combine]||"ENVMAP_BLENDING_NONE"}function cM(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function hM(s,e,t,n){const i=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=nM(t),c=sM(t),h=aM(t),u=lM(t),d=cM(t),f=Yy(t),m=jy(r),_=i.createProgram();let g,p,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Ir).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Ir).join(`
`),p.length>0&&(p+=`
`)):(g=[fd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ir).join(`
`),p=[fd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ii?"#define TONE_MAPPING":"",t.toneMapping!==ii?Ke.tonemapping_pars_fragment:"",t.toneMapping!==ii?Xy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ke.colorspace_pars_fragment,Gy("linearToOutputTexel",t.outputColorSpace),qy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ir).join(`
`)),a=Hc(a),a=hd(a,t),a=ud(a,t),o=Hc(o),o=hd(o,t),o=ud(o,t),a=dd(a),o=dd(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===su?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===su?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const S=T+g+a,y=T+p+o,w=od(i,i.VERTEX_SHADER,S),P=od(i,i.FRAGMENT_SHADER,y);i.attachShader(_,w),i.attachShader(_,P),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function C(R){if(s.debug.checkShaderErrors){const F=i.getProgramInfoLog(_)||"",U=i.getShaderInfoLog(w)||"",B=i.getShaderInfoLog(P)||"",H=F.trim(),W=U.trim(),z=B.trim();let Z=!0,oe=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(Z=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,_,w,P);else{const ce=cd(i,w,"vertex"),de=cd(i,P,"fragment");ke("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+H+`
`+ce+`
`+de)}else H!==""?we("WebGLProgram: Program Info Log:",H):(W===""||z==="")&&(oe=!1);oe&&(R.diagnostics={runnable:Z,programLog:H,vertexShader:{log:W,prefix:g},fragmentShader:{log:z,prefix:p}})}i.deleteShader(w),i.deleteShader(P),L=new no(i,_),v=Ky(i,_)}let L;this.getUniforms=function(){return L===void 0&&C(this),L};let v;this.getAttributes=function(){return v===void 0&&C(this),v};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=i.getProgramParameter(_,ky)),b},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=zy++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=P,this}let uM=0;class dM{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new fM(e),t.set(e,n)),n}}class fM{constructor(e){this.id=uM++,this.code=e,this.usedTimes=0}}function pM(s,e,t,n,i,r,a){const o=new Mf,l=new dM,c=new Set,h=[],u=new Map,d=i.logarithmicDepthBuffer;let f=i.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(v){return c.add(v),v===0?"uv":`uv${v}`}function g(v,b,R,F,U){const B=F.fog,H=U.geometry,W=v.isMeshStandardMaterial?F.environment:null,z=(v.isMeshStandardMaterial?t:e).get(v.envMap||W),Z=z&&z.mapping===Co?z.image.height:null,oe=m[v.type];v.precision!==null&&(f=i.getMaxPrecision(v.precision),f!==v.precision&&we("WebGLProgram.getParameters:",v.precision,"not supported, using",f,"instead."));const ce=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,de=ce!==void 0?ce.length:0;let Xe=0;H.morphAttributes.position!==void 0&&(Xe=1),H.morphAttributes.normal!==void 0&&(Xe=2),H.morphAttributes.color!==void 0&&(Xe=3);let Ge,pt,mt,Y;if(oe){const ct=ei[oe];Ge=ct.vertexShader,pt=ct.fragmentShader}else Ge=v.vertexShader,pt=v.fragmentShader,l.update(v),mt=l.getVertexShaderID(v),Y=l.getFragmentShaderID(v);const ee=s.getRenderTarget(),Me=s.state.buffers.depth.getReversed(),Oe=U.isInstancedMesh===!0,Te=U.isBatchedMesh===!0,it=!!v.map,gt=!!v.matcap,qe=!!z,J=!!v.aoMap,ne=!!v.lightMap,Q=!!v.bumpMap,ge=!!v.normalMap,A=!!v.displacementMap,De=!!v.emissiveMap,ve=!!v.metalnessMap,Be=!!v.roughnessMap,ae=v.anisotropy>0,E=v.clearcoat>0,x=v.dispersion>0,D=v.iridescence>0,X=v.sheen>0,K=v.transmission>0,q=ae&&!!v.anisotropyMap,Re=E&&!!v.clearcoatMap,le=E&&!!v.clearcoatNormalMap,Ce=E&&!!v.clearcoatRoughnessMap,ze=D&&!!v.iridescenceMap,te=D&&!!v.iridescenceThicknessMap,fe=X&&!!v.sheenColorMap,Ae=X&&!!v.sheenRoughnessMap,Ie=!!v.specularMap,ue=!!v.specularColorMap,$e=!!v.specularIntensityMap,N=K&&!!v.transmissionMap,xe=K&&!!v.thicknessMap,se=!!v.gradientMap,ye=!!v.alphaMap,ie=v.alphaTest>0,$=!!v.alphaHash,he=!!v.extensions;let We=ii;v.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(We=s.toneMapping);const yt={shaderID:oe,shaderType:v.type,shaderName:v.name,vertexShader:Ge,fragmentShader:pt,defines:v.defines,customVertexShaderID:mt,customFragmentShaderID:Y,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:f,batching:Te,batchingColor:Te&&U._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&U.instanceColor!==null,instancingMorph:Oe&&U.morphTexture!==null,outputColorSpace:ee===null?s.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:cn,alphaToCoverage:!!v.alphaToCoverage,map:it,matcap:gt,envMap:qe,envMapMode:qe&&z.mapping,envMapCubeUVHeight:Z,aoMap:J,lightMap:ne,bumpMap:Q,normalMap:ge,displacementMap:A,emissiveMap:De,normalMapObjectSpace:ge&&v.normalMapType===bm,normalMapTangentSpace:ge&&v.normalMapType===mh,metalnessMap:ve,roughnessMap:Be,anisotropy:ae,anisotropyMap:q,clearcoat:E,clearcoatMap:Re,clearcoatNormalMap:le,clearcoatRoughnessMap:Ce,dispersion:x,iridescence:D,iridescenceMap:ze,iridescenceThicknessMap:te,sheen:X,sheenColorMap:fe,sheenRoughnessMap:Ae,specularMap:Ie,specularColorMap:ue,specularIntensityMap:$e,transmission:K,transmissionMap:N,thicknessMap:xe,gradientMap:se,opaque:v.transparent===!1&&v.blending===zi&&v.alphaToCoverage===!1,alphaMap:ye,alphaTest:ie,alphaHash:$,combine:v.combine,mapUv:it&&_(v.map.channel),aoMapUv:J&&_(v.aoMap.channel),lightMapUv:ne&&_(v.lightMap.channel),bumpMapUv:Q&&_(v.bumpMap.channel),normalMapUv:ge&&_(v.normalMap.channel),displacementMapUv:A&&_(v.displacementMap.channel),emissiveMapUv:De&&_(v.emissiveMap.channel),metalnessMapUv:ve&&_(v.metalnessMap.channel),roughnessMapUv:Be&&_(v.roughnessMap.channel),anisotropyMapUv:q&&_(v.anisotropyMap.channel),clearcoatMapUv:Re&&_(v.clearcoatMap.channel),clearcoatNormalMapUv:le&&_(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ce&&_(v.clearcoatRoughnessMap.channel),iridescenceMapUv:ze&&_(v.iridescenceMap.channel),iridescenceThicknessMapUv:te&&_(v.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&_(v.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&_(v.sheenRoughnessMap.channel),specularMapUv:Ie&&_(v.specularMap.channel),specularColorMapUv:ue&&_(v.specularColorMap.channel),specularIntensityMapUv:$e&&_(v.specularIntensityMap.channel),transmissionMapUv:N&&_(v.transmissionMap.channel),thicknessMapUv:xe&&_(v.thicknessMap.channel),alphaMapUv:ye&&_(v.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(ge||ae),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!H.attributes.uv&&(it||ye),fog:!!B,useFog:v.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:v.flatShading===!0&&v.wireframe===!1,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Me,skinning:U.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:de,morphTextureStride:Xe,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:s.shadowMap.enabled&&R.length>0,shadowMapType:s.shadowMap.type,toneMapping:We,decodeVideoTexture:it&&v.map.isVideoTexture===!0&&nt.getTransfer(v.map.colorSpace)===ut,decodeVideoTextureEmissive:De&&v.emissiveMap.isVideoTexture===!0&&nt.getTransfer(v.emissiveMap.colorSpace)===ut,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===on,flipSided:v.side===gn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:he&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(he&&v.extensions.multiDraw===!0||Te)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return yt.vertexUv1s=c.has(1),yt.vertexUv2s=c.has(2),yt.vertexUv3s=c.has(3),c.clear(),yt}function p(v){const b=[];if(v.shaderID?b.push(v.shaderID):(b.push(v.customVertexShaderID),b.push(v.customFragmentShaderID)),v.defines!==void 0)for(const R in v.defines)b.push(R),b.push(v.defines[R]);return v.isRawShaderMaterial===!1&&(T(b,v),S(b,v),b.push(s.outputColorSpace)),b.push(v.customProgramCacheKey),b.join()}function T(v,b){v.push(b.precision),v.push(b.outputColorSpace),v.push(b.envMapMode),v.push(b.envMapCubeUVHeight),v.push(b.mapUv),v.push(b.alphaMapUv),v.push(b.lightMapUv),v.push(b.aoMapUv),v.push(b.bumpMapUv),v.push(b.normalMapUv),v.push(b.displacementMapUv),v.push(b.emissiveMapUv),v.push(b.metalnessMapUv),v.push(b.roughnessMapUv),v.push(b.anisotropyMapUv),v.push(b.clearcoatMapUv),v.push(b.clearcoatNormalMapUv),v.push(b.clearcoatRoughnessMapUv),v.push(b.iridescenceMapUv),v.push(b.iridescenceThicknessMapUv),v.push(b.sheenColorMapUv),v.push(b.sheenRoughnessMapUv),v.push(b.specularMapUv),v.push(b.specularColorMapUv),v.push(b.specularIntensityMapUv),v.push(b.transmissionMapUv),v.push(b.thicknessMapUv),v.push(b.combine),v.push(b.fogExp2),v.push(b.sizeAttenuation),v.push(b.morphTargetsCount),v.push(b.morphAttributeCount),v.push(b.numDirLights),v.push(b.numPointLights),v.push(b.numSpotLights),v.push(b.numSpotLightMaps),v.push(b.numHemiLights),v.push(b.numRectAreaLights),v.push(b.numDirLightShadows),v.push(b.numPointLightShadows),v.push(b.numSpotLightShadows),v.push(b.numSpotLightShadowsWithMaps),v.push(b.numLightProbes),v.push(b.shadowMapType),v.push(b.toneMapping),v.push(b.numClippingPlanes),v.push(b.numClipIntersection),v.push(b.depthPacking)}function S(v,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),v.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),v.push(o.mask)}function y(v){const b=m[v.type];let R;if(b){const F=ei[b];R=fg.clone(F.uniforms)}else R=v.uniforms;return R}function w(v,b){let R=u.get(b);return R!==void 0?++R.usedTimes:(R=new hM(s,b,v,r),h.push(R),u.set(b,R)),R}function P(v){if(--v.usedTimes===0){const b=h.indexOf(v);h[b]=h[h.length-1],h.pop(),u.delete(v.cacheKey),v.destroy()}}function C(v){l.remove(v)}function L(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:y,acquireProgram:w,releaseProgram:P,releaseShaderCache:C,programs:h,dispose:L}}function mM(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function gM(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function pd(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function md(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function a(u,d,f,m,_,g){let p=s[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:m,renderOrder:u.renderOrder,z:_,group:g},s[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=m,p.renderOrder=u.renderOrder,p.z=_,p.group=g),e++,p}function o(u,d,f,m,_,g){const p=a(u,d,f,m,_,g);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function l(u,d,f,m,_,g){const p=a(u,d,f,m,_,g);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,d){t.length>1&&t.sort(u||gM),n.length>1&&n.sort(d||pd),i.length>1&&i.sort(d||pd)}function h(){for(let u=e,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:o,unshift:l,finish:h,sort:c}}function _M(){let s=new WeakMap;function e(n,i){const r=s.get(n);let a;return r===void 0?(a=new md,s.set(n,[a])):i>=r.length?(a=new md,r.push(a)):a=r[i],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function xM(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Pe};break;case"SpotLight":t={position:new I,direction:new I,color:new Pe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Pe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Pe,groundColor:new Pe};break;case"RectAreaLight":t={color:new Pe,position:new I,halfWidth:new I,halfHeight:new I};break}return s[e.id]=t,t}}}function vM(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let yM=0;function MM(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function SM(s){const e=new xM,t=vM(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const i=new I,r=new He,a=new He;function o(c){let h=0,u=0,d=0;for(let v=0;v<9;v++)n.probe[v].set(0,0,0);let f=0,m=0,_=0,g=0,p=0,T=0,S=0,y=0,w=0,P=0,C=0;c.sort(MM);for(let v=0,b=c.length;v<b;v++){const R=c[v],F=R.color,U=R.intensity,B=R.distance;let H=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===Js?H=R.shadow.map.texture:H=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)h+=F.r*U,u+=F.g*U,d+=F.b*U;else if(R.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(R.sh.coefficients[W],U);C++}else if(R.isDirectionalLight){const W=e.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const z=R.shadow,Z=t.get(R);Z.shadowIntensity=z.intensity,Z.shadowBias=z.bias,Z.shadowNormalBias=z.normalBias,Z.shadowRadius=z.radius,Z.shadowMapSize=z.mapSize,n.directionalShadow[f]=Z,n.directionalShadowMap[f]=H,n.directionalShadowMatrix[f]=R.shadow.matrix,T++}n.directional[f]=W,f++}else if(R.isSpotLight){const W=e.get(R);W.position.setFromMatrixPosition(R.matrixWorld),W.color.copy(F).multiplyScalar(U),W.distance=B,W.coneCos=Math.cos(R.angle),W.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),W.decay=R.decay,n.spot[_]=W;const z=R.shadow;if(R.map&&(n.spotLightMap[w]=R.map,w++,z.updateMatrices(R),R.castShadow&&P++),n.spotLightMatrix[_]=z.matrix,R.castShadow){const Z=t.get(R);Z.shadowIntensity=z.intensity,Z.shadowBias=z.bias,Z.shadowNormalBias=z.normalBias,Z.shadowRadius=z.radius,Z.shadowMapSize=z.mapSize,n.spotShadow[_]=Z,n.spotShadowMap[_]=H,y++}_++}else if(R.isRectAreaLight){const W=e.get(R);W.color.copy(F).multiplyScalar(U),W.halfWidth.set(R.width*.5,0,0),W.halfHeight.set(0,R.height*.5,0),n.rectArea[g]=W,g++}else if(R.isPointLight){const W=e.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),W.distance=R.distance,W.decay=R.decay,R.castShadow){const z=R.shadow,Z=t.get(R);Z.shadowIntensity=z.intensity,Z.shadowBias=z.bias,Z.shadowNormalBias=z.normalBias,Z.shadowRadius=z.radius,Z.shadowMapSize=z.mapSize,Z.shadowCameraNear=z.camera.near,Z.shadowCameraFar=z.camera.far,n.pointShadow[m]=Z,n.pointShadowMap[m]=H,n.pointShadowMatrix[m]=R.shadow.matrix,S++}n.point[m]=W,m++}else if(R.isHemisphereLight){const W=e.get(R);W.skyColor.copy(R.color).multiplyScalar(U),W.groundColor.copy(R.groundColor).multiplyScalar(U),n.hemi[p]=W,p++}}g>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const L=n.hash;(L.directionalLength!==f||L.pointLength!==m||L.spotLength!==_||L.rectAreaLength!==g||L.hemiLength!==p||L.numDirectionalShadows!==T||L.numPointShadows!==S||L.numSpotShadows!==y||L.numSpotMaps!==w||L.numLightProbes!==C)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=g,n.point.length=m,n.hemi.length=p,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=T,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=y+w-P,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=P,n.numLightProbes=C,L.directionalLength=f,L.pointLength=m,L.spotLength=_,L.rectAreaLength=g,L.hemiLength=p,L.numDirectionalShadows=T,L.numPointShadows=S,L.numSpotShadows=y,L.numSpotMaps=w,L.numLightProbes=C,n.version=yM++)}function l(c,h){let u=0,d=0,f=0,m=0,_=0;const g=h.matrixWorldInverse;for(let p=0,T=c.length;p<T;p++){const S=c[p];if(S.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(S.matrixWorld),i.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(g),u++}else if(S.isSpotLight){const y=n.spot[f];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(g),y.direction.setFromMatrixPosition(S.matrixWorld),i.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(g),f++}else if(S.isRectAreaLight){const y=n.rectArea[m];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(g),a.identity(),r.copy(S.matrixWorld),r.premultiply(g),a.extractRotation(r),y.halfWidth.set(S.width*.5,0,0),y.halfHeight.set(0,S.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),m++}else if(S.isPointLight){const y=n.point[d];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(g),d++}else if(S.isHemisphereLight){const y=n.hemi[_];y.direction.setFromMatrixPosition(S.matrixWorld),y.direction.transformDirection(g),_++}}}return{setup:o,setupView:l,state:n}}function gd(s){const e=new SM(s),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function bM(s){let e=new WeakMap;function t(i,r=0){const a=e.get(i);let o;return a===void 0?(o=new gd(s),e.set(i,[o])):r>=a.length?(o=new gd(s),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const TM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,wM=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,EM=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],CM=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],_d=new He,br=new I,Cl=new I;function AM(s,e,t){let n=new Sh;const i=new re,r=new re,a=new bt,o=new d0,l=new f0,c={},h=t.maxTextureSize,u={[Ti]:gn,[gn]:Ti,[on]:on},d=new zn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new re},radius:{value:4}},vertexShader:TM,fragmentShader:wM}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const m=new en;m.setAttribute("position",new ln(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new lt(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=$a;let p=this.type;this.render=function(P,C,L){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||P.length===0)return;P.type===Jp&&(we("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),P.type=$a);const v=s.getRenderTarget(),b=s.getActiveCubeFace(),R=s.getActiveMipmapLevel(),F=s.state;F.setBlending(yi),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const U=p!==this.type;U&&C.traverse(function(B){B.material&&(Array.isArray(B.material)?B.material.forEach(H=>H.needsUpdate=!0):B.material.needsUpdate=!0)});for(let B=0,H=P.length;B<H;B++){const W=P[B],z=W.shadow;if(z===void 0){we("WebGLShadowMap:",W,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const Z=z.getFrameExtents();if(i.multiply(Z),r.copy(z.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/Z.x),i.x=r.x*Z.x,z.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/Z.y),i.y=r.y*Z.y,z.mapSize.y=r.y)),z.map===null||U===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Ar){if(W.isPointLight){we("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new si(i.x,i.y,{format:Js,type:wi,minFilter:Et,magFilter:Et,generateMipmaps:!1}),z.map.texture.name=W.name+".shadowMap",z.map.depthTexture=new Yr(i.x,i.y,Fn),z.map.depthTexture.name=W.name+".shadowMapDepth",z.map.depthTexture.format=Ei,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ot,z.map.depthTexture.magFilter=Ot}else{W.isPointLight?(z.map=new Af(i.x),z.map.depthTexture=new Pg(i.x,ri)):(z.map=new si(i.x,i.y),z.map.depthTexture=new Yr(i.x,i.y,ri)),z.map.depthTexture.name=W.name+".shadowMap",z.map.depthTexture.format=Ei;const ce=s.state.buffers.depth.getReversed();this.type===$a?(z.map.depthTexture.compareFunction=ce?_h:gh,z.map.depthTexture.minFilter=Et,z.map.depthTexture.magFilter=Et):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ot,z.map.depthTexture.magFilter=Ot)}z.camera.updateProjectionMatrix()}const oe=z.map.isWebGLCubeRenderTarget?6:1;for(let ce=0;ce<oe;ce++){if(z.map.isWebGLCubeRenderTarget)s.setRenderTarget(z.map,ce),s.clear();else{ce===0&&(s.setRenderTarget(z.map),s.clear());const de=z.getViewport(ce);a.set(r.x*de.x,r.y*de.y,r.x*de.z,r.y*de.w),F.viewport(a)}if(W.isPointLight){const de=z.camera,Xe=z.matrix,Ge=W.distance||de.far;Ge!==de.far&&(de.far=Ge,de.updateProjectionMatrix()),br.setFromMatrixPosition(W.matrixWorld),de.position.copy(br),Cl.copy(de.position),Cl.add(EM[ce]),de.up.copy(CM[ce]),de.lookAt(Cl),de.updateMatrixWorld(),Xe.makeTranslation(-br.x,-br.y,-br.z),_d.multiplyMatrices(de.projectionMatrix,de.matrixWorldInverse),z._frustum.setFromProjectionMatrix(_d,de.coordinateSystem,de.reversedDepth)}else z.updateMatrices(W);n=z.getFrustum(),y(C,L,z.camera,W,this.type)}z.isPointLightShadow!==!0&&this.type===Ar&&T(z,L),z.needsUpdate=!1}p=this.type,g.needsUpdate=!1,s.setRenderTarget(v,b,R)};function T(P,C){const L=e.update(_);d.defines.VSM_SAMPLES!==P.blurSamples&&(d.defines.VSM_SAMPLES=P.blurSamples,f.defines.VSM_SAMPLES=P.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),P.mapPass===null&&(P.mapPass=new si(i.x,i.y,{format:Js,type:wi})),d.uniforms.shadow_pass.value=P.map.depthTexture,d.uniforms.resolution.value=P.mapSize,d.uniforms.radius.value=P.radius,s.setRenderTarget(P.mapPass),s.clear(),s.renderBufferDirect(C,null,L,d,_,null),f.uniforms.shadow_pass.value=P.mapPass.texture,f.uniforms.resolution.value=P.mapSize,f.uniforms.radius.value=P.radius,s.setRenderTarget(P.map),s.clear(),s.renderBufferDirect(C,null,L,f,_,null)}function S(P,C,L,v){let b=null;const R=L.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(R!==void 0)b=R;else if(b=L.isPointLight===!0?l:o,s.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){const F=b.uuid,U=C.uuid;let B=c[F];B===void 0&&(B={},c[F]=B);let H=B[U];H===void 0&&(H=b.clone(),B[U]=H,C.addEventListener("dispose",w)),b=H}if(b.visible=C.visible,b.wireframe=C.wireframe,v===Ar?b.side=C.shadowSide!==null?C.shadowSide:C.side:b.side=C.shadowSide!==null?C.shadowSide:u[C.side],b.alphaMap=C.alphaMap,b.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,b.map=C.map,b.clipShadows=C.clipShadows,b.clippingPlanes=C.clippingPlanes,b.clipIntersection=C.clipIntersection,b.displacementMap=C.displacementMap,b.displacementScale=C.displacementScale,b.displacementBias=C.displacementBias,b.wireframeLinewidth=C.wireframeLinewidth,b.linewidth=C.linewidth,L.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const F=s.properties.get(b);F.light=L}return b}function y(P,C,L,v,b){if(P.visible===!1)return;if(P.layers.test(C.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&b===Ar)&&(!P.frustumCulled||n.intersectsObject(P))){P.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,P.matrixWorld);const U=e.update(P),B=P.material;if(Array.isArray(B)){const H=U.groups;for(let W=0,z=H.length;W<z;W++){const Z=H[W],oe=B[Z.materialIndex];if(oe&&oe.visible){const ce=S(P,oe,v,b);P.onBeforeShadow(s,P,C,L,U,ce,Z),s.renderBufferDirect(L,null,U,ce,P,Z),P.onAfterShadow(s,P,C,L,U,ce,Z)}}}else if(B.visible){const H=S(P,B,v,b);P.onBeforeShadow(s,P,C,L,U,H,null),s.renderBufferDirect(L,null,U,H,P,null),P.onAfterShadow(s,P,C,L,U,H,null)}}const F=P.children;for(let U=0,B=F.length;U<B;U++)y(F[U],C,L,v,b)}function w(P){P.target.removeEventListener("dispose",w);for(const L in c){const v=c[L],b=P.target.uuid;b in v&&(v[b].dispose(),delete v[b])}}}const RM={[Yl]:jl,[Kl]:Zl,[$l]:Ql,[js]:Jl,[jl]:Yl,[Zl]:Kl,[Ql]:$l,[Jl]:js};function PM(s,e){function t(){let N=!1;const xe=new bt;let se=null;const ye=new bt(0,0,0,0);return{setMask:function(ie){se!==ie&&!N&&(s.colorMask(ie,ie,ie,ie),se=ie)},setLocked:function(ie){N=ie},setClear:function(ie,$,he,We,yt){yt===!0&&(ie*=We,$*=We,he*=We),xe.set(ie,$,he,We),ye.equals(xe)===!1&&(s.clearColor(ie,$,he,We),ye.copy(xe))},reset:function(){N=!1,se=null,ye.set(-1,0,0,0)}}}function n(){let N=!1,xe=!1,se=null,ye=null,ie=null;return{setReversed:function($){if(xe!==$){const he=e.get("EXT_clip_control");$?he.clipControlEXT(he.LOWER_LEFT_EXT,he.ZERO_TO_ONE_EXT):he.clipControlEXT(he.LOWER_LEFT_EXT,he.NEGATIVE_ONE_TO_ONE_EXT),xe=$;const We=ie;ie=null,this.setClear(We)}},getReversed:function(){return xe},setTest:function($){$?ee(s.DEPTH_TEST):Me(s.DEPTH_TEST)},setMask:function($){se!==$&&!N&&(s.depthMask($),se=$)},setFunc:function($){if(xe&&($=RM[$]),ye!==$){switch($){case Yl:s.depthFunc(s.NEVER);break;case jl:s.depthFunc(s.ALWAYS);break;case Kl:s.depthFunc(s.LESS);break;case js:s.depthFunc(s.LEQUAL);break;case $l:s.depthFunc(s.EQUAL);break;case Jl:s.depthFunc(s.GEQUAL);break;case Zl:s.depthFunc(s.GREATER);break;case Ql:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ye=$}},setLocked:function($){N=$},setClear:function($){ie!==$&&(xe&&($=1-$),s.clearDepth($),ie=$)},reset:function(){N=!1,se=null,ye=null,ie=null,xe=!1}}}function i(){let N=!1,xe=null,se=null,ye=null,ie=null,$=null,he=null,We=null,yt=null;return{setTest:function(ct){N||(ct?ee(s.STENCIL_TEST):Me(s.STENCIL_TEST))},setMask:function(ct){xe!==ct&&!N&&(s.stencilMask(ct),xe=ct)},setFunc:function(ct,Kn,hi){(se!==ct||ye!==Kn||ie!==hi)&&(s.stencilFunc(ct,Kn,hi),se=ct,ye=Kn,ie=hi)},setOp:function(ct,Kn,hi){($!==ct||he!==Kn||We!==hi)&&(s.stencilOp(ct,Kn,hi),$=ct,he=Kn,We=hi)},setLocked:function(ct){N=ct},setClear:function(ct){yt!==ct&&(s.clearStencil(ct),yt=ct)},reset:function(){N=!1,xe=null,se=null,ye=null,ie=null,$=null,he=null,We=null,yt=null}}}const r=new t,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,f=[],m=null,_=!1,g=null,p=null,T=null,S=null,y=null,w=null,P=null,C=new Pe(0,0,0),L=0,v=!1,b=null,R=null,F=null,U=null,B=null;const H=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let W=!1,z=0;const Z=s.getParameter(s.VERSION);Z.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(Z)[1]),W=z>=1):Z.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),W=z>=2);let oe=null,ce={};const de=s.getParameter(s.SCISSOR_BOX),Xe=s.getParameter(s.VIEWPORT),Ge=new bt().fromArray(de),pt=new bt().fromArray(Xe);function mt(N,xe,se,ye){const ie=new Uint8Array(4),$=s.createTexture();s.bindTexture(N,$),s.texParameteri(N,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(N,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let he=0;he<se;he++)N===s.TEXTURE_3D||N===s.TEXTURE_2D_ARRAY?s.texImage3D(xe,0,s.RGBA,1,1,ye,0,s.RGBA,s.UNSIGNED_BYTE,ie):s.texImage2D(xe+he,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ie);return $}const Y={};Y[s.TEXTURE_2D]=mt(s.TEXTURE_2D,s.TEXTURE_2D,1),Y[s.TEXTURE_CUBE_MAP]=mt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[s.TEXTURE_2D_ARRAY]=mt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Y[s.TEXTURE_3D]=mt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(s.DEPTH_TEST),a.setFunc(js),Q(!1),ge(Qh),ee(s.CULL_FACE),J(yi);function ee(N){h[N]!==!0&&(s.enable(N),h[N]=!0)}function Me(N){h[N]!==!1&&(s.disable(N),h[N]=!1)}function Oe(N,xe){return u[N]!==xe?(s.bindFramebuffer(N,xe),u[N]=xe,N===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=xe),N===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=xe),!0):!1}function Te(N,xe){let se=f,ye=!1;if(N){se=d.get(xe),se===void 0&&(se=[],d.set(xe,se));const ie=N.textures;if(se.length!==ie.length||se[0]!==s.COLOR_ATTACHMENT0){for(let $=0,he=ie.length;$<he;$++)se[$]=s.COLOR_ATTACHMENT0+$;se.length=ie.length,ye=!0}}else se[0]!==s.BACK&&(se[0]=s.BACK,ye=!0);ye&&s.drawBuffers(se)}function it(N){return m!==N?(s.useProgram(N),m=N,!0):!1}const gt={[as]:s.FUNC_ADD,[Qp]:s.FUNC_SUBTRACT,[em]:s.FUNC_REVERSE_SUBTRACT};gt[tm]=s.MIN,gt[nm]=s.MAX;const qe={[im]:s.ZERO,[sm]:s.ONE,[rm]:s.SRC_COLOR,[Xl]:s.SRC_ALPHA,[um]:s.SRC_ALPHA_SATURATE,[cm]:s.DST_COLOR,[om]:s.DST_ALPHA,[am]:s.ONE_MINUS_SRC_COLOR,[ql]:s.ONE_MINUS_SRC_ALPHA,[hm]:s.ONE_MINUS_DST_COLOR,[lm]:s.ONE_MINUS_DST_ALPHA,[dm]:s.CONSTANT_COLOR,[fm]:s.ONE_MINUS_CONSTANT_COLOR,[pm]:s.CONSTANT_ALPHA,[mm]:s.ONE_MINUS_CONSTANT_ALPHA};function J(N,xe,se,ye,ie,$,he,We,yt,ct){if(N===yi){_===!0&&(Me(s.BLEND),_=!1);return}if(_===!1&&(ee(s.BLEND),_=!0),N!==Zp){if(N!==g||ct!==v){if((p!==as||y!==as)&&(s.blendEquation(s.FUNC_ADD),p=as,y=as),ct)switch(N){case zi:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case mn:s.blendFunc(s.ONE,s.ONE);break;case eu:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case tu:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:ke("WebGLState: Invalid blending: ",N);break}else switch(N){case zi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case mn:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case eu:ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case tu:ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ke("WebGLState: Invalid blending: ",N);break}T=null,S=null,w=null,P=null,C.set(0,0,0),L=0,g=N,v=ct}return}ie=ie||xe,$=$||se,he=he||ye,(xe!==p||ie!==y)&&(s.blendEquationSeparate(gt[xe],gt[ie]),p=xe,y=ie),(se!==T||ye!==S||$!==w||he!==P)&&(s.blendFuncSeparate(qe[se],qe[ye],qe[$],qe[he]),T=se,S=ye,w=$,P=he),(We.equals(C)===!1||yt!==L)&&(s.blendColor(We.r,We.g,We.b,yt),C.copy(We),L=yt),g=N,v=!1}function ne(N,xe){N.side===on?Me(s.CULL_FACE):ee(s.CULL_FACE);let se=N.side===gn;xe&&(se=!se),Q(se),N.blending===zi&&N.transparent===!1?J(yi):J(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);const ye=N.stencilWrite;o.setTest(ye),ye&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),De(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?ee(s.SAMPLE_ALPHA_TO_COVERAGE):Me(s.SAMPLE_ALPHA_TO_COVERAGE)}function Q(N){b!==N&&(N?s.frontFace(s.CW):s.frontFace(s.CCW),b=N)}function ge(N){N!==Kp?(ee(s.CULL_FACE),N!==R&&(N===Qh?s.cullFace(s.BACK):N===$p?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Me(s.CULL_FACE),R=N}function A(N){N!==F&&(W&&s.lineWidth(N),F=N)}function De(N,xe,se){N?(ee(s.POLYGON_OFFSET_FILL),(U!==xe||B!==se)&&(s.polygonOffset(xe,se),U=xe,B=se)):Me(s.POLYGON_OFFSET_FILL)}function ve(N){N?ee(s.SCISSOR_TEST):Me(s.SCISSOR_TEST)}function Be(N){N===void 0&&(N=s.TEXTURE0+H-1),oe!==N&&(s.activeTexture(N),oe=N)}function ae(N,xe,se){se===void 0&&(oe===null?se=s.TEXTURE0+H-1:se=oe);let ye=ce[se];ye===void 0&&(ye={type:void 0,texture:void 0},ce[se]=ye),(ye.type!==N||ye.texture!==xe)&&(oe!==se&&(s.activeTexture(se),oe=se),s.bindTexture(N,xe||Y[N]),ye.type=N,ye.texture=xe)}function E(){const N=ce[oe];N!==void 0&&N.type!==void 0&&(s.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function x(){try{s.compressedTexImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function D(){try{s.compressedTexImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function X(){try{s.texSubImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function K(){try{s.texSubImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function q(){try{s.compressedTexSubImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function Re(){try{s.compressedTexSubImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function le(){try{s.texStorage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function Ce(){try{s.texStorage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function ze(){try{s.texImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function te(){try{s.texImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function fe(N){Ge.equals(N)===!1&&(s.scissor(N.x,N.y,N.z,N.w),Ge.copy(N))}function Ae(N){pt.equals(N)===!1&&(s.viewport(N.x,N.y,N.z,N.w),pt.copy(N))}function Ie(N,xe){let se=c.get(xe);se===void 0&&(se=new WeakMap,c.set(xe,se));let ye=se.get(N);ye===void 0&&(ye=s.getUniformBlockIndex(xe,N.name),se.set(N,ye))}function ue(N,xe){const ye=c.get(xe).get(N);l.get(xe)!==ye&&(s.uniformBlockBinding(xe,ye,N.__bindingPointIndex),l.set(xe,ye))}function $e(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},oe=null,ce={},u={},d=new WeakMap,f=[],m=null,_=!1,g=null,p=null,T=null,S=null,y=null,w=null,P=null,C=new Pe(0,0,0),L=0,v=!1,b=null,R=null,F=null,U=null,B=null,Ge.set(0,0,s.canvas.width,s.canvas.height),pt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ee,disable:Me,bindFramebuffer:Oe,drawBuffers:Te,useProgram:it,setBlending:J,setMaterial:ne,setFlipSided:Q,setCullFace:ge,setLineWidth:A,setPolygonOffset:De,setScissorTest:ve,activeTexture:Be,bindTexture:ae,unbindTexture:E,compressedTexImage2D:x,compressedTexImage3D:D,texImage2D:ze,texImage3D:te,updateUBOMapping:Ie,uniformBlockBinding:ue,texStorage2D:le,texStorage3D:Ce,texSubImage2D:X,texSubImage3D:K,compressedTexSubImage2D:q,compressedTexSubImage3D:Re,scissor:fe,viewport:Ae,reset:$e}}function IM(s,e,t,n,i,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new re,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(E,x){return f?new OffscreenCanvas(E,x):Wr("canvas")}function _(E,x,D){let X=1;const K=ae(E);if((K.width>D||K.height>D)&&(X=D/Math.max(K.width,K.height)),X<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const q=Math.floor(X*K.width),Re=Math.floor(X*K.height);u===void 0&&(u=m(q,Re));const le=x?m(q,Re):u;return le.width=q,le.height=Re,le.getContext("2d").drawImage(E,0,0,q,Re),we("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+q+"x"+Re+")."),le}else return"data"in E&&we("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),E;return E}function g(E){return E.generateMipmaps}function p(E){s.generateMipmap(E)}function T(E){return E.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?s.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function S(E,x,D,X,K=!1){if(E!==null){if(s[E]!==void 0)return s[E];we("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let q=x;if(x===s.RED&&(D===s.FLOAT&&(q=s.R32F),D===s.HALF_FLOAT&&(q=s.R16F),D===s.UNSIGNED_BYTE&&(q=s.R8)),x===s.RED_INTEGER&&(D===s.UNSIGNED_BYTE&&(q=s.R8UI),D===s.UNSIGNED_SHORT&&(q=s.R16UI),D===s.UNSIGNED_INT&&(q=s.R32UI),D===s.BYTE&&(q=s.R8I),D===s.SHORT&&(q=s.R16I),D===s.INT&&(q=s.R32I)),x===s.RG&&(D===s.FLOAT&&(q=s.RG32F),D===s.HALF_FLOAT&&(q=s.RG16F),D===s.UNSIGNED_BYTE&&(q=s.RG8)),x===s.RG_INTEGER&&(D===s.UNSIGNED_BYTE&&(q=s.RG8UI),D===s.UNSIGNED_SHORT&&(q=s.RG16UI),D===s.UNSIGNED_INT&&(q=s.RG32UI),D===s.BYTE&&(q=s.RG8I),D===s.SHORT&&(q=s.RG16I),D===s.INT&&(q=s.RG32I)),x===s.RGB_INTEGER&&(D===s.UNSIGNED_BYTE&&(q=s.RGB8UI),D===s.UNSIGNED_SHORT&&(q=s.RGB16UI),D===s.UNSIGNED_INT&&(q=s.RGB32UI),D===s.BYTE&&(q=s.RGB8I),D===s.SHORT&&(q=s.RGB16I),D===s.INT&&(q=s.RGB32I)),x===s.RGBA_INTEGER&&(D===s.UNSIGNED_BYTE&&(q=s.RGBA8UI),D===s.UNSIGNED_SHORT&&(q=s.RGBA16UI),D===s.UNSIGNED_INT&&(q=s.RGBA32UI),D===s.BYTE&&(q=s.RGBA8I),D===s.SHORT&&(q=s.RGBA16I),D===s.INT&&(q=s.RGBA32I)),x===s.RGB&&(D===s.UNSIGNED_INT_5_9_9_9_REV&&(q=s.RGB9_E5),D===s.UNSIGNED_INT_10F_11F_11F_REV&&(q=s.R11F_G11F_B10F)),x===s.RGBA){const Re=K?fo:nt.getTransfer(X);D===s.FLOAT&&(q=s.RGBA32F),D===s.HALF_FLOAT&&(q=s.RGBA16F),D===s.UNSIGNED_BYTE&&(q=Re===ut?s.SRGB8_ALPHA8:s.RGBA8),D===s.UNSIGNED_SHORT_4_4_4_4&&(q=s.RGBA4),D===s.UNSIGNED_SHORT_5_5_5_1&&(q=s.RGB5_A1)}return(q===s.R16F||q===s.R32F||q===s.RG16F||q===s.RG32F||q===s.RGBA16F||q===s.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function y(E,x){let D;return E?x===null||x===ri||x===Vr?D=s.DEPTH24_STENCIL8:x===Fn?D=s.DEPTH32F_STENCIL8:x===zr&&(D=s.DEPTH24_STENCIL8,we("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===ri||x===Vr?D=s.DEPTH_COMPONENT24:x===Fn?D=s.DEPTH_COMPONENT32F:x===zr&&(D=s.DEPTH_COMPONENT16),D}function w(E,x){return g(E)===!0||E.isFramebufferTexture&&E.minFilter!==Ot&&E.minFilter!==Et?Math.log2(Math.max(x.width,x.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?x.mipmaps.length:1}function P(E){const x=E.target;x.removeEventListener("dispose",P),L(x),x.isVideoTexture&&h.delete(x)}function C(E){const x=E.target;x.removeEventListener("dispose",C),b(x)}function L(E){const x=n.get(E);if(x.__webglInit===void 0)return;const D=E.source,X=d.get(D);if(X){const K=X[x.__cacheKey];K.usedTimes--,K.usedTimes===0&&v(E),Object.keys(X).length===0&&d.delete(D)}n.remove(E)}function v(E){const x=n.get(E);s.deleteTexture(x.__webglTexture);const D=E.source,X=d.get(D);delete X[x.__cacheKey],a.memory.textures--}function b(E){const x=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(x.__webglFramebuffer[X]))for(let K=0;K<x.__webglFramebuffer[X].length;K++)s.deleteFramebuffer(x.__webglFramebuffer[X][K]);else s.deleteFramebuffer(x.__webglFramebuffer[X]);x.__webglDepthbuffer&&s.deleteRenderbuffer(x.__webglDepthbuffer[X])}else{if(Array.isArray(x.__webglFramebuffer))for(let X=0;X<x.__webglFramebuffer.length;X++)s.deleteFramebuffer(x.__webglFramebuffer[X]);else s.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&s.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&s.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let X=0;X<x.__webglColorRenderbuffer.length;X++)x.__webglColorRenderbuffer[X]&&s.deleteRenderbuffer(x.__webglColorRenderbuffer[X]);x.__webglDepthRenderbuffer&&s.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const D=E.textures;for(let X=0,K=D.length;X<K;X++){const q=n.get(D[X]);q.__webglTexture&&(s.deleteTexture(q.__webglTexture),a.memory.textures--),n.remove(D[X])}n.remove(E)}let R=0;function F(){R=0}function U(){const E=R;return E>=i.maxTextures&&we("WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+i.maxTextures),R+=1,E}function B(E){const x=[];return x.push(E.wrapS),x.push(E.wrapT),x.push(E.wrapR||0),x.push(E.magFilter),x.push(E.minFilter),x.push(E.anisotropy),x.push(E.internalFormat),x.push(E.format),x.push(E.type),x.push(E.generateMipmaps),x.push(E.premultiplyAlpha),x.push(E.flipY),x.push(E.unpackAlignment),x.push(E.colorSpace),x.join()}function H(E,x){const D=n.get(E);if(E.isVideoTexture&&ve(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&D.__version!==E.version){const X=E.image;if(X===null)we("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)we("WebGLRenderer: Texture marked for update but image is incomplete");else{Y(D,E,x);return}}else E.isExternalTexture&&(D.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,D.__webglTexture,s.TEXTURE0+x)}function W(E,x){const D=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&D.__version!==E.version){Y(D,E,x);return}else E.isExternalTexture&&(D.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,D.__webglTexture,s.TEXTURE0+x)}function z(E,x){const D=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&D.__version!==E.version){Y(D,E,x);return}t.bindTexture(s.TEXTURE_3D,D.__webglTexture,s.TEXTURE0+x)}function Z(E,x){const D=n.get(E);if(E.isCubeDepthTexture!==!0&&E.version>0&&D.__version!==E.version){ee(D,E,x);return}t.bindTexture(s.TEXTURE_CUBE_MAP,D.__webglTexture,s.TEXTURE0+x)}const oe={[$s]:s.REPEAT,[ti]:s.CLAMP_TO_EDGE,[ho]:s.MIRRORED_REPEAT},ce={[Ot]:s.NEAREST,[hf]:s.NEAREST_MIPMAP_NEAREST,[Rr]:s.NEAREST_MIPMAP_LINEAR,[Et]:s.LINEAR,[Ja]:s.LINEAR_MIPMAP_NEAREST,[_i]:s.LINEAR_MIPMAP_LINEAR},de={[Tm]:s.NEVER,[Rm]:s.ALWAYS,[wm]:s.LESS,[gh]:s.LEQUAL,[Em]:s.EQUAL,[_h]:s.GEQUAL,[Cm]:s.GREATER,[Am]:s.NOTEQUAL};function Xe(E,x){if(x.type===Fn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Et||x.magFilter===Ja||x.magFilter===Rr||x.magFilter===_i||x.minFilter===Et||x.minFilter===Ja||x.minFilter===Rr||x.minFilter===_i)&&we("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(E,s.TEXTURE_WRAP_S,oe[x.wrapS]),s.texParameteri(E,s.TEXTURE_WRAP_T,oe[x.wrapT]),(E===s.TEXTURE_3D||E===s.TEXTURE_2D_ARRAY)&&s.texParameteri(E,s.TEXTURE_WRAP_R,oe[x.wrapR]),s.texParameteri(E,s.TEXTURE_MAG_FILTER,ce[x.magFilter]),s.texParameteri(E,s.TEXTURE_MIN_FILTER,ce[x.minFilter]),x.compareFunction&&(s.texParameteri(E,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(E,s.TEXTURE_COMPARE_FUNC,de[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Ot||x.minFilter!==Rr&&x.minFilter!==_i||x.type===Fn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const D=e.get("EXT_texture_filter_anisotropic");s.texParameterf(E,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,i.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function Ge(E,x){let D=!1;E.__webglInit===void 0&&(E.__webglInit=!0,x.addEventListener("dispose",P));const X=x.source;let K=d.get(X);K===void 0&&(K={},d.set(X,K));const q=B(x);if(q!==E.__cacheKey){K[q]===void 0&&(K[q]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,D=!0),K[q].usedTimes++;const Re=K[E.__cacheKey];Re!==void 0&&(K[E.__cacheKey].usedTimes--,Re.usedTimes===0&&v(x)),E.__cacheKey=q,E.__webglTexture=K[q].texture}return D}function pt(E,x,D){return Math.floor(Math.floor(E/D)/x)}function mt(E,x,D,X){const q=E.updateRanges;if(q.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,x.width,x.height,D,X,x.data);else{q.sort((te,fe)=>te.start-fe.start);let Re=0;for(let te=1;te<q.length;te++){const fe=q[Re],Ae=q[te],Ie=fe.start+fe.count,ue=pt(Ae.start,x.width,4),$e=pt(fe.start,x.width,4);Ae.start<=Ie+1&&ue===$e&&pt(Ae.start+Ae.count-1,x.width,4)===ue?fe.count=Math.max(fe.count,Ae.start+Ae.count-fe.start):(++Re,q[Re]=Ae)}q.length=Re+1;const le=s.getParameter(s.UNPACK_ROW_LENGTH),Ce=s.getParameter(s.UNPACK_SKIP_PIXELS),ze=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,x.width);for(let te=0,fe=q.length;te<fe;te++){const Ae=q[te],Ie=Math.floor(Ae.start/4),ue=Math.ceil(Ae.count/4),$e=Ie%x.width,N=Math.floor(Ie/x.width),xe=ue,se=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,$e),s.pixelStorei(s.UNPACK_SKIP_ROWS,N),t.texSubImage2D(s.TEXTURE_2D,0,$e,N,xe,se,D,X,x.data)}E.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,le),s.pixelStorei(s.UNPACK_SKIP_PIXELS,Ce),s.pixelStorei(s.UNPACK_SKIP_ROWS,ze)}}function Y(E,x,D){let X=s.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(X=s.TEXTURE_2D_ARRAY),x.isData3DTexture&&(X=s.TEXTURE_3D);const K=Ge(E,x),q=x.source;t.bindTexture(X,E.__webglTexture,s.TEXTURE0+D);const Re=n.get(q);if(q.version!==Re.__version||K===!0){t.activeTexture(s.TEXTURE0+D);const le=nt.getPrimaries(nt.workingColorSpace),Ce=x.colorSpace===Oi?null:nt.getPrimaries(x.colorSpace),ze=x.colorSpace===Oi||le===Ce?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,x.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,x.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ze);let te=_(x.image,!1,i.maxTextureSize);te=Be(x,te);const fe=r.convert(x.format,x.colorSpace),Ae=r.convert(x.type);let Ie=S(x.internalFormat,fe,Ae,x.colorSpace,x.isVideoTexture);Xe(X,x);let ue;const $e=x.mipmaps,N=x.isVideoTexture!==!0,xe=Re.__version===void 0||K===!0,se=q.dataReady,ye=w(x,te);if(x.isDepthTexture)Ie=y(x.format===cs,x.type),xe&&(N?t.texStorage2D(s.TEXTURE_2D,1,Ie,te.width,te.height):t.texImage2D(s.TEXTURE_2D,0,Ie,te.width,te.height,0,fe,Ae,null));else if(x.isDataTexture)if($e.length>0){N&&xe&&t.texStorage2D(s.TEXTURE_2D,ye,Ie,$e[0].width,$e[0].height);for(let ie=0,$=$e.length;ie<$;ie++)ue=$e[ie],N?se&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,ue.width,ue.height,fe,Ae,ue.data):t.texImage2D(s.TEXTURE_2D,ie,Ie,ue.width,ue.height,0,fe,Ae,ue.data);x.generateMipmaps=!1}else N?(xe&&t.texStorage2D(s.TEXTURE_2D,ye,Ie,te.width,te.height),se&&mt(x,te,fe,Ae)):t.texImage2D(s.TEXTURE_2D,0,Ie,te.width,te.height,0,fe,Ae,te.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){N&&xe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ye,Ie,$e[0].width,$e[0].height,te.depth);for(let ie=0,$=$e.length;ie<$;ie++)if(ue=$e[ie],x.format!==Un)if(fe!==null)if(N){if(se)if(x.layerUpdates.size>0){const he=ju(ue.width,ue.height,x.format,x.type);for(const We of x.layerUpdates){const yt=ue.data.subarray(We*he/ue.data.BYTES_PER_ELEMENT,(We+1)*he/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,We,ue.width,ue.height,1,fe,yt)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,0,ue.width,ue.height,te.depth,fe,ue.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ie,Ie,ue.width,ue.height,te.depth,0,ue.data,0,0);else we("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else N?se&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,0,ue.width,ue.height,te.depth,fe,Ae,ue.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ie,Ie,ue.width,ue.height,te.depth,0,fe,Ae,ue.data)}else{N&&xe&&t.texStorage2D(s.TEXTURE_2D,ye,Ie,$e[0].width,$e[0].height);for(let ie=0,$=$e.length;ie<$;ie++)ue=$e[ie],x.format!==Un?fe!==null?N?se&&t.compressedTexSubImage2D(s.TEXTURE_2D,ie,0,0,ue.width,ue.height,fe,ue.data):t.compressedTexImage2D(s.TEXTURE_2D,ie,Ie,ue.width,ue.height,0,ue.data):we("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):N?se&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,ue.width,ue.height,fe,Ae,ue.data):t.texImage2D(s.TEXTURE_2D,ie,Ie,ue.width,ue.height,0,fe,Ae,ue.data)}else if(x.isDataArrayTexture)if(N){if(xe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ye,Ie,te.width,te.height,te.depth),se)if(x.layerUpdates.size>0){const ie=ju(te.width,te.height,x.format,x.type);for(const $ of x.layerUpdates){const he=te.data.subarray($*ie/te.data.BYTES_PER_ELEMENT,($+1)*ie/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,$,te.width,te.height,1,fe,Ae,he)}x.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,fe,Ae,te.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Ie,te.width,te.height,te.depth,0,fe,Ae,te.data);else if(x.isData3DTexture)N?(xe&&t.texStorage3D(s.TEXTURE_3D,ye,Ie,te.width,te.height,te.depth),se&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,fe,Ae,te.data)):t.texImage3D(s.TEXTURE_3D,0,Ie,te.width,te.height,te.depth,0,fe,Ae,te.data);else if(x.isFramebufferTexture){if(xe)if(N)t.texStorage2D(s.TEXTURE_2D,ye,Ie,te.width,te.height);else{let ie=te.width,$=te.height;for(let he=0;he<ye;he++)t.texImage2D(s.TEXTURE_2D,he,Ie,ie,$,0,fe,Ae,null),ie>>=1,$>>=1}}else if($e.length>0){if(N&&xe){const ie=ae($e[0]);t.texStorage2D(s.TEXTURE_2D,ye,Ie,ie.width,ie.height)}for(let ie=0,$=$e.length;ie<$;ie++)ue=$e[ie],N?se&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,fe,Ae,ue):t.texImage2D(s.TEXTURE_2D,ie,Ie,fe,Ae,ue);x.generateMipmaps=!1}else if(N){if(xe){const ie=ae(te);t.texStorage2D(s.TEXTURE_2D,ye,Ie,ie.width,ie.height)}se&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,fe,Ae,te)}else t.texImage2D(s.TEXTURE_2D,0,Ie,fe,Ae,te);g(x)&&p(X),Re.__version=q.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function ee(E,x,D){if(x.image.length!==6)return;const X=Ge(E,x),K=x.source;t.bindTexture(s.TEXTURE_CUBE_MAP,E.__webglTexture,s.TEXTURE0+D);const q=n.get(K);if(K.version!==q.__version||X===!0){t.activeTexture(s.TEXTURE0+D);const Re=nt.getPrimaries(nt.workingColorSpace),le=x.colorSpace===Oi?null:nt.getPrimaries(x.colorSpace),Ce=x.colorSpace===Oi||Re===le?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,x.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,x.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);const ze=x.isCompressedTexture||x.image[0].isCompressedTexture,te=x.image[0]&&x.image[0].isDataTexture,fe=[];for(let $=0;$<6;$++)!ze&&!te?fe[$]=_(x.image[$],!0,i.maxCubemapSize):fe[$]=te?x.image[$].image:x.image[$],fe[$]=Be(x,fe[$]);const Ae=fe[0],Ie=r.convert(x.format,x.colorSpace),ue=r.convert(x.type),$e=S(x.internalFormat,Ie,ue,x.colorSpace),N=x.isVideoTexture!==!0,xe=q.__version===void 0||X===!0,se=K.dataReady;let ye=w(x,Ae);Xe(s.TEXTURE_CUBE_MAP,x);let ie;if(ze){N&&xe&&t.texStorage2D(s.TEXTURE_CUBE_MAP,ye,$e,Ae.width,Ae.height);for(let $=0;$<6;$++){ie=fe[$].mipmaps;for(let he=0;he<ie.length;he++){const We=ie[he];x.format!==Un?Ie!==null?N?se&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,0,0,We.width,We.height,Ie,We.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,$e,We.width,We.height,0,We.data):we("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,0,0,We.width,We.height,Ie,ue,We.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,$e,We.width,We.height,0,Ie,ue,We.data)}}}else{if(ie=x.mipmaps,N&&xe){ie.length>0&&ye++;const $=ae(fe[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,ye,$e,$.width,$.height)}for(let $=0;$<6;$++)if(te){N?se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,fe[$].width,fe[$].height,Ie,ue,fe[$].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,$e,fe[$].width,fe[$].height,0,Ie,ue,fe[$].data);for(let he=0;he<ie.length;he++){const yt=ie[he].image[$].image;N?se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,0,0,yt.width,yt.height,Ie,ue,yt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,$e,yt.width,yt.height,0,Ie,ue,yt.data)}}else{N?se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Ie,ue,fe[$]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,$e,Ie,ue,fe[$]);for(let he=0;he<ie.length;he++){const We=ie[he];N?se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,0,0,Ie,ue,We.image[$]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,$e,Ie,ue,We.image[$])}}}g(x)&&p(s.TEXTURE_CUBE_MAP),q.__version=K.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function Me(E,x,D,X,K,q){const Re=r.convert(D.format,D.colorSpace),le=r.convert(D.type),Ce=S(D.internalFormat,Re,le,D.colorSpace),ze=n.get(x),te=n.get(D);if(te.__renderTarget=x,!ze.__hasExternalTextures){const fe=Math.max(1,x.width>>q),Ae=Math.max(1,x.height>>q);K===s.TEXTURE_3D||K===s.TEXTURE_2D_ARRAY?t.texImage3D(K,q,Ce,fe,Ae,x.depth,0,Re,le,null):t.texImage2D(K,q,Ce,fe,Ae,0,Re,le,null)}t.bindFramebuffer(s.FRAMEBUFFER,E),De(x)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,X,K,te.__webglTexture,0,A(x)):(K===s.TEXTURE_2D||K>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,X,K,te.__webglTexture,q),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Oe(E,x,D){if(s.bindRenderbuffer(s.RENDERBUFFER,E),x.depthBuffer){const X=x.depthTexture,K=X&&X.isDepthTexture?X.type:null,q=y(x.stencilBuffer,K),Re=x.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;De(x)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,A(x),q,x.width,x.height):D?s.renderbufferStorageMultisample(s.RENDERBUFFER,A(x),q,x.width,x.height):s.renderbufferStorage(s.RENDERBUFFER,q,x.width,x.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Re,s.RENDERBUFFER,E)}else{const X=x.textures;for(let K=0;K<X.length;K++){const q=X[K],Re=r.convert(q.format,q.colorSpace),le=r.convert(q.type),Ce=S(q.internalFormat,Re,le,q.colorSpace);De(x)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,A(x),Ce,x.width,x.height):D?s.renderbufferStorageMultisample(s.RENDERBUFFER,A(x),Ce,x.width,x.height):s.renderbufferStorage(s.RENDERBUFFER,Ce,x.width,x.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Te(E,x,D){const X=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,E),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const K=n.get(x.depthTexture);if(K.__renderTarget=x,(!K.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),X){if(K.__webglInit===void 0&&(K.__webglInit=!0,x.depthTexture.addEventListener("dispose",P)),K.__webglTexture===void 0){K.__webglTexture=s.createTexture(),t.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture),Xe(s.TEXTURE_CUBE_MAP,x.depthTexture);const ze=r.convert(x.depthTexture.format),te=r.convert(x.depthTexture.type);let fe;x.depthTexture.format===Ei?fe=s.DEPTH_COMPONENT24:x.depthTexture.format===cs&&(fe=s.DEPTH24_STENCIL8);for(let Ae=0;Ae<6;Ae++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0,fe,x.width,x.height,0,ze,te,null)}}else H(x.depthTexture,0);const q=K.__webglTexture,Re=A(x),le=X?s.TEXTURE_CUBE_MAP_POSITIVE_X+D:s.TEXTURE_2D,Ce=x.depthTexture.format===cs?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(x.depthTexture.format===Ei)De(x)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Ce,le,q,0,Re):s.framebufferTexture2D(s.FRAMEBUFFER,Ce,le,q,0);else if(x.depthTexture.format===cs)De(x)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Ce,le,q,0,Re):s.framebufferTexture2D(s.FRAMEBUFFER,Ce,le,q,0);else throw new Error("Unknown depthTexture format")}function it(E){const x=n.get(E),D=E.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==E.depthTexture){const X=E.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),X){const K=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,X.removeEventListener("dispose",K)};X.addEventListener("dispose",K),x.__depthDisposeCallback=K}x.__boundDepthTexture=X}if(E.depthTexture&&!x.__autoAllocateDepthBuffer)if(D)for(let X=0;X<6;X++)Te(x.__webglFramebuffer[X],E,X);else{const X=E.texture.mipmaps;X&&X.length>0?Te(x.__webglFramebuffer[0],E,0):Te(x.__webglFramebuffer,E,0)}else if(D){x.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(t.bindFramebuffer(s.FRAMEBUFFER,x.__webglFramebuffer[X]),x.__webglDepthbuffer[X]===void 0)x.__webglDepthbuffer[X]=s.createRenderbuffer(),Oe(x.__webglDepthbuffer[X],E,!1);else{const K=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,q=x.__webglDepthbuffer[X];s.bindRenderbuffer(s.RENDERBUFFER,q),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,q)}}else{const X=E.texture.mipmaps;if(X&&X.length>0?t.bindFramebuffer(s.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=s.createRenderbuffer(),Oe(x.__webglDepthbuffer,E,!1);else{const K=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,q=x.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,q),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,q)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function gt(E,x,D){const X=n.get(E);x!==void 0&&Me(X.__webglFramebuffer,E,E.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),D!==void 0&&it(E)}function qe(E){const x=E.texture,D=n.get(E),X=n.get(x);E.addEventListener("dispose",C);const K=E.textures,q=E.isWebGLCubeRenderTarget===!0,Re=K.length>1;if(Re||(X.__webglTexture===void 0&&(X.__webglTexture=s.createTexture()),X.__version=x.version,a.memory.textures++),q){D.__webglFramebuffer=[];for(let le=0;le<6;le++)if(x.mipmaps&&x.mipmaps.length>0){D.__webglFramebuffer[le]=[];for(let Ce=0;Ce<x.mipmaps.length;Ce++)D.__webglFramebuffer[le][Ce]=s.createFramebuffer()}else D.__webglFramebuffer[le]=s.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){D.__webglFramebuffer=[];for(let le=0;le<x.mipmaps.length;le++)D.__webglFramebuffer[le]=s.createFramebuffer()}else D.__webglFramebuffer=s.createFramebuffer();if(Re)for(let le=0,Ce=K.length;le<Ce;le++){const ze=n.get(K[le]);ze.__webglTexture===void 0&&(ze.__webglTexture=s.createTexture(),a.memory.textures++)}if(E.samples>0&&De(E)===!1){D.__webglMultisampledFramebuffer=s.createFramebuffer(),D.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let le=0;le<K.length;le++){const Ce=K[le];D.__webglColorRenderbuffer[le]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,D.__webglColorRenderbuffer[le]);const ze=r.convert(Ce.format,Ce.colorSpace),te=r.convert(Ce.type),fe=S(Ce.internalFormat,ze,te,Ce.colorSpace,E.isXRRenderTarget===!0),Ae=A(E);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ae,fe,E.width,E.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+le,s.RENDERBUFFER,D.__webglColorRenderbuffer[le])}s.bindRenderbuffer(s.RENDERBUFFER,null),E.depthBuffer&&(D.__webglDepthRenderbuffer=s.createRenderbuffer(),Oe(D.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(q){t.bindTexture(s.TEXTURE_CUBE_MAP,X.__webglTexture),Xe(s.TEXTURE_CUBE_MAP,x);for(let le=0;le<6;le++)if(x.mipmaps&&x.mipmaps.length>0)for(let Ce=0;Ce<x.mipmaps.length;Ce++)Me(D.__webglFramebuffer[le][Ce],E,x,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ce);else Me(D.__webglFramebuffer[le],E,x,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);g(x)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Re){for(let le=0,Ce=K.length;le<Ce;le++){const ze=K[le],te=n.get(ze);let fe=s.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(fe=E.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(fe,te.__webglTexture),Xe(fe,ze),Me(D.__webglFramebuffer,E,ze,s.COLOR_ATTACHMENT0+le,fe,0),g(ze)&&p(fe)}t.unbindTexture()}else{let le=s.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(le=E.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(le,X.__webglTexture),Xe(le,x),x.mipmaps&&x.mipmaps.length>0)for(let Ce=0;Ce<x.mipmaps.length;Ce++)Me(D.__webglFramebuffer[Ce],E,x,s.COLOR_ATTACHMENT0,le,Ce);else Me(D.__webglFramebuffer,E,x,s.COLOR_ATTACHMENT0,le,0);g(x)&&p(le),t.unbindTexture()}E.depthBuffer&&it(E)}function J(E){const x=E.textures;for(let D=0,X=x.length;D<X;D++){const K=x[D];if(g(K)){const q=T(E),Re=n.get(K).__webglTexture;t.bindTexture(q,Re),p(q),t.unbindTexture()}}}const ne=[],Q=[];function ge(E){if(E.samples>0){if(De(E)===!1){const x=E.textures,D=E.width,X=E.height;let K=s.COLOR_BUFFER_BIT;const q=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Re=n.get(E),le=x.length>1;if(le)for(let ze=0;ze<x.length;ze++)t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ze,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ze,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Re.__webglMultisampledFramebuffer);const Ce=E.texture.mipmaps;Ce&&Ce.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Re.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Re.__webglFramebuffer);for(let ze=0;ze<x.length;ze++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(K|=s.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(K|=s.STENCIL_BUFFER_BIT)),le){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Re.__webglColorRenderbuffer[ze]);const te=n.get(x[ze]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,te,0)}s.blitFramebuffer(0,0,D,X,0,0,D,X,K,s.NEAREST),l===!0&&(ne.length=0,Q.length=0,ne.push(s.COLOR_ATTACHMENT0+ze),E.depthBuffer&&E.resolveDepthBuffer===!1&&(ne.push(q),Q.push(q),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Q)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,ne))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),le)for(let ze=0;ze<x.length;ze++){t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ze,s.RENDERBUFFER,Re.__webglColorRenderbuffer[ze]);const te=n.get(x[ze]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ze,s.TEXTURE_2D,te,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Re.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){const x=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[x])}}}function A(E){return Math.min(i.maxSamples,E.samples)}function De(E){const x=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function ve(E){const x=a.render.frame;h.get(E)!==x&&(h.set(E,x),E.update())}function Be(E,x){const D=E.colorSpace,X=E.format,K=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||D!==cn&&D!==Oi&&(nt.getTransfer(D)===ut?(X!==Un||K!==Cn)&&we("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ke("WebGLTextures: Unsupported texture color space:",D)),x}function ae(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=F,this.setTexture2D=H,this.setTexture2DArray=W,this.setTexture3D=z,this.setTextureCube=Z,this.rebindTextures=gt,this.setupRenderTarget=qe,this.updateRenderTargetMipmap=J,this.updateMultisampleRenderTarget=ge,this.setupDepthRenderbuffer=it,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=De,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function LM(s,e){function t(n,i=Oi){let r;const a=nt.getTransfer(i);if(n===Cn)return s.UNSIGNED_BYTE;if(n===oh)return s.UNSIGNED_SHORT_4_4_4_4;if(n===lh)return s.UNSIGNED_SHORT_5_5_5_1;if(n===ff)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===pf)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===uf)return s.BYTE;if(n===df)return s.SHORT;if(n===zr)return s.UNSIGNED_SHORT;if(n===ah)return s.INT;if(n===ri)return s.UNSIGNED_INT;if(n===Fn)return s.FLOAT;if(n===wi)return s.HALF_FLOAT;if(n===mf)return s.ALPHA;if(n===gf)return s.RGB;if(n===Un)return s.RGBA;if(n===Ei)return s.DEPTH_COMPONENT;if(n===cs)return s.DEPTH_STENCIL;if(n===ch)return s.RED;if(n===hh)return s.RED_INTEGER;if(n===Js)return s.RG;if(n===uh)return s.RG_INTEGER;if(n===dh)return s.RGBA_INTEGER;if(n===Za||n===Qa||n===eo||n===to)if(a===ut)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Za)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===to)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Za)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===eo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===to)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===nc||n===ic||n===sc||n===rc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===nc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ic)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===sc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===rc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ac||n===oc||n===lc||n===cc||n===hc||n===uc||n===dc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ac||n===oc)return a===ut?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===lc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===cc)return r.COMPRESSED_R11_EAC;if(n===hc)return r.COMPRESSED_SIGNED_R11_EAC;if(n===uc)return r.COMPRESSED_RG11_EAC;if(n===dc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===fc||n===pc||n===mc||n===gc||n===_c||n===xc||n===vc||n===yc||n===Mc||n===Sc||n===bc||n===Tc||n===wc||n===Ec)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===fc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===pc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===mc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===gc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===_c)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===xc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===vc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===yc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Mc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Sc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===bc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Tc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===wc)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ec)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Cc||n===Ac||n===Rc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Cc)return a===ut?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ac)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Rc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Pc||n===Ic||n===Lc||n===Nc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Pc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ic)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Lc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Nc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Vr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const NM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,DM=`
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

}`;class FM{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Df(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new zn({vertexShader:NM,fragmentShader:DM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new lt(new ta(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class UM extends xs{constructor(e,t){super();const n=this;let i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null;const _=typeof XRWebGLBinding<"u",g=new FM,p={},T=t.getContextAttributes();let S=null,y=null;const w=[],P=[],C=new re;let L=null;const v=new an;v.viewport=new bt;const b=new an;b.viewport=new bt;const R=[v,b],F=new L0;let U=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ee=w[Y];return ee===void 0&&(ee=new hl,w[Y]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Y){let ee=w[Y];return ee===void 0&&(ee=new hl,w[Y]=ee),ee.getGripSpace()},this.getHand=function(Y){let ee=w[Y];return ee===void 0&&(ee=new hl,w[Y]=ee),ee.getHandSpace()};function H(Y){const ee=P.indexOf(Y.inputSource);if(ee===-1)return;const Me=w[ee];Me!==void 0&&(Me.update(Y.inputSource,Y.frame,c||a),Me.dispatchEvent({type:Y.type,data:Y.inputSource}))}function W(){i.removeEventListener("select",H),i.removeEventListener("selectstart",H),i.removeEventListener("selectend",H),i.removeEventListener("squeeze",H),i.removeEventListener("squeezestart",H),i.removeEventListener("squeezeend",H),i.removeEventListener("end",W),i.removeEventListener("inputsourceschange",z);for(let Y=0;Y<w.length;Y++){const ee=P[Y];ee!==null&&(P[Y]=null,w[Y].disconnect(ee))}U=null,B=null,g.reset();for(const Y in p)delete p[Y];e.setRenderTarget(S),f=null,d=null,u=null,i=null,y=null,mt.stop(),n.isPresenting=!1,e.setPixelRatio(L),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&we("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&we("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(Y){if(i=Y,i!==null){if(S=e.getRenderTarget(),i.addEventListener("select",H),i.addEventListener("selectstart",H),i.addEventListener("selectend",H),i.addEventListener("squeeze",H),i.addEventListener("squeezestart",H),i.addEventListener("squeezeend",H),i.addEventListener("end",W),i.addEventListener("inputsourceschange",z),T.xrCompatible!==!0&&await t.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(C),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Me=null,Oe=null,Te=null;T.depth&&(Te=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Me=T.stencil?cs:Ei,Oe=T.stencil?Vr:ri);const it={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(it),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new si(d.textureWidth,d.textureHeight,{format:Un,type:Cn,depthTexture:new Yr(d.textureWidth,d.textureHeight,Oe,void 0,void 0,void 0,void 0,void 0,void 0,Me),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const Me={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,Me),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new si(f.framebufferWidth,f.framebufferHeight,{format:Un,type:Cn,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),mt.setContext(i),mt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function z(Y){for(let ee=0;ee<Y.removed.length;ee++){const Me=Y.removed[ee],Oe=P.indexOf(Me);Oe>=0&&(P[Oe]=null,w[Oe].disconnect(Me))}for(let ee=0;ee<Y.added.length;ee++){const Me=Y.added[ee];let Oe=P.indexOf(Me);if(Oe===-1){for(let it=0;it<w.length;it++)if(it>=P.length){P.push(Me),Oe=it;break}else if(P[it]===null){P[it]=Me,Oe=it;break}if(Oe===-1)break}const Te=w[Oe];Te&&Te.connect(Me)}}const Z=new I,oe=new I;function ce(Y,ee,Me){Z.setFromMatrixPosition(ee.matrixWorld),oe.setFromMatrixPosition(Me.matrixWorld);const Oe=Z.distanceTo(oe),Te=ee.projectionMatrix.elements,it=Me.projectionMatrix.elements,gt=Te[14]/(Te[10]-1),qe=Te[14]/(Te[10]+1),J=(Te[9]+1)/Te[5],ne=(Te[9]-1)/Te[5],Q=(Te[8]-1)/Te[0],ge=(it[8]+1)/it[0],A=gt*Q,De=gt*ge,ve=Oe/(-Q+ge),Be=ve*-Q;if(ee.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Be),Y.translateZ(ve),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Te[10]===-1)Y.projectionMatrix.copy(ee.projectionMatrix),Y.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{const ae=gt+ve,E=qe+ve,x=A-Be,D=De+(Oe-Be),X=J*qe/E*ae,K=ne*qe/E*ae;Y.projectionMatrix.makePerspective(x,D,X,K,ae,E),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function de(Y,ee){ee===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ee.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(i===null)return;let ee=Y.near,Me=Y.far;g.texture!==null&&(g.depthNear>0&&(ee=g.depthNear),g.depthFar>0&&(Me=g.depthFar)),F.near=b.near=v.near=ee,F.far=b.far=v.far=Me,(U!==F.near||B!==F.far)&&(i.updateRenderState({depthNear:F.near,depthFar:F.far}),U=F.near,B=F.far),F.layers.mask=Y.layers.mask|6,v.layers.mask=F.layers.mask&3,b.layers.mask=F.layers.mask&5;const Oe=Y.parent,Te=F.cameras;de(F,Oe);for(let it=0;it<Te.length;it++)de(Te[it],Oe);Te.length===2?ce(F,v,b):F.projectionMatrix.copy(v.projectionMatrix),Xe(Y,F,Oe)};function Xe(Y,ee,Me){Me===null?Y.matrix.copy(ee.matrixWorld):(Y.matrix.copy(Me.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ee.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ee.projectionMatrix),Y.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Zs*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(Y){l=Y,d!==null&&(d.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(F)},this.getCameraTexture=function(Y){return p[Y]};let Ge=null;function pt(Y,ee){if(h=ee.getViewerPose(c||a),m=ee,h!==null){const Me=h.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let Oe=!1;Me.length!==F.cameras.length&&(F.cameras.length=0,Oe=!0);for(let qe=0;qe<Me.length;qe++){const J=Me[qe];let ne=null;if(f!==null)ne=f.getViewport(J);else{const ge=u.getViewSubImage(d,J);ne=ge.viewport,qe===0&&(e.setRenderTargetTextures(y,ge.colorTexture,ge.depthStencilTexture),e.setRenderTarget(y))}let Q=R[qe];Q===void 0&&(Q=new an,Q.layers.enable(qe),Q.viewport=new bt,R[qe]=Q),Q.matrix.fromArray(J.transform.matrix),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.projectionMatrix.fromArray(J.projectionMatrix),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert(),Q.viewport.set(ne.x,ne.y,ne.width,ne.height),qe===0&&(F.matrix.copy(Q.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Oe===!0&&F.cameras.push(Q)}const Te=i.enabledFeatures;if(Te&&Te.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){u=n.getBinding();const qe=u.getDepthInformation(Me[0]);qe&&qe.isValid&&qe.texture&&g.init(qe,i.renderState)}if(Te&&Te.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let qe=0;qe<Me.length;qe++){const J=Me[qe].camera;if(J){let ne=p[J];ne||(ne=new Df,p[J]=ne);const Q=u.getCameraImage(J);ne.sourceTexture=Q}}}}for(let Me=0;Me<w.length;Me++){const Oe=P[Me],Te=w[Me];Oe!==null&&Te!==void 0&&Te.update(Oe,ee,c||a)}Ge&&Ge(Y,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),m=null}const mt=new Jf;mt.setAnimationLoop(pt),this.setAnimationLoop=function(Y){Ge=Y},this.dispose=function(){}}}const ns=new Kt,OM=new He;function BM(s,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,wf(s)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function i(g,p,T,S,y){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),u(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p)):p.isMeshStandardMaterial?(r(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,y)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),_(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,T,S):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===gn&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===gn&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const T=e.get(p),S=T.envMap,y=T.envMapRotation;S&&(g.envMap.value=S,ns.copy(y),ns.x*=-1,ns.y*=-1,ns.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(ns.y*=-1,ns.z*=-1),g.envMapRotation.value.setFromMatrix4(OM.makeRotationFromEuler(ns)),g.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,T,S){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*T,g.scale.value=S*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,T){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===gn&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=T.texture,g.transmissionSamplerSize.value.set(T.width,T.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){const T=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(T.matrixWorld),g.nearDistance.value=T.shadow.camera.near,g.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function kM(s,e,t,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(T,S){const y=S.program;n.uniformBlockBinding(T,y)}function c(T,S){let y=i[T.id];y===void 0&&(m(T),y=h(T),i[T.id]=y,T.addEventListener("dispose",g));const w=S.program;n.updateUBOMapping(T,w);const P=e.render.frame;r[T.id]!==P&&(d(T),r[T.id]=P)}function h(T){const S=u();T.__bindingPointIndex=S;const y=s.createBuffer(),w=T.__size,P=T.usage;return s.bindBuffer(s.UNIFORM_BUFFER,y),s.bufferData(s.UNIFORM_BUFFER,w,P),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,S,y),y}function u(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(T){const S=i[T.id],y=T.uniforms,w=T.__cache;s.bindBuffer(s.UNIFORM_BUFFER,S);for(let P=0,C=y.length;P<C;P++){const L=Array.isArray(y[P])?y[P]:[y[P]];for(let v=0,b=L.length;v<b;v++){const R=L[v];if(f(R,P,v,w)===!0){const F=R.__offset,U=Array.isArray(R.value)?R.value:[R.value];let B=0;for(let H=0;H<U.length;H++){const W=U[H],z=_(W);typeof W=="number"||typeof W=="boolean"?(R.__data[0]=W,s.bufferSubData(s.UNIFORM_BUFFER,F+B,R.__data)):W.isMatrix3?(R.__data[0]=W.elements[0],R.__data[1]=W.elements[1],R.__data[2]=W.elements[2],R.__data[3]=0,R.__data[4]=W.elements[3],R.__data[5]=W.elements[4],R.__data[6]=W.elements[5],R.__data[7]=0,R.__data[8]=W.elements[6],R.__data[9]=W.elements[7],R.__data[10]=W.elements[8],R.__data[11]=0):(W.toArray(R.__data,B),B+=z.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,F,R.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(T,S,y,w){const P=T.value,C=S+"_"+y;if(w[C]===void 0)return typeof P=="number"||typeof P=="boolean"?w[C]=P:w[C]=P.clone(),!0;{const L=w[C];if(typeof P=="number"||typeof P=="boolean"){if(L!==P)return w[C]=P,!0}else if(L.equals(P)===!1)return L.copy(P),!0}return!1}function m(T){const S=T.uniforms;let y=0;const w=16;for(let C=0,L=S.length;C<L;C++){const v=Array.isArray(S[C])?S[C]:[S[C]];for(let b=0,R=v.length;b<R;b++){const F=v[b],U=Array.isArray(F.value)?F.value:[F.value];for(let B=0,H=U.length;B<H;B++){const W=U[B],z=_(W),Z=y%w,oe=Z%z.boundary,ce=Z+oe;y+=oe,ce!==0&&w-ce<z.storage&&(y+=w-ce),F.__data=new Float32Array(z.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=y,y+=z.storage}}}const P=y%w;return P>0&&(y+=w-P),T.__size=y,T.__cache={},this}function _(T){const S={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(S.boundary=4,S.storage=4):T.isVector2?(S.boundary=8,S.storage=8):T.isVector3||T.isColor?(S.boundary=16,S.storage=12):T.isVector4?(S.boundary=16,S.storage=16):T.isMatrix3?(S.boundary=48,S.storage=48):T.isMatrix4?(S.boundary=64,S.storage=64):T.isTexture?we("WebGLRenderer: Texture samplers can not be part of an uniforms group."):we("WebGLRenderer: Unsupported uniform value type.",T),S}function g(T){const S=T.target;S.removeEventListener("dispose",g);const y=a.indexOf(S.__bindingPointIndex);a.splice(y,1),s.deleteBuffer(i[S.id]),delete i[S.id],delete r[S.id]}function p(){for(const T in i)s.deleteBuffer(i[T]);a=[],i={},r={}}return{bind:l,update:c,dispose:p}}const zM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let $n=null;function VM(){return $n===null&&($n=new yh(zM,16,16,Js,wi),$n.name="DFG_LUT",$n.minFilter=Et,$n.magFilter=Et,$n.wrapS=ti,$n.wrapT=ti,$n.generateMipmaps=!1,$n.needsUpdate=!0),$n}class HM{constructor(e={}){const{canvas:t=Im(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Cn}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;const _=f,g=new Set([dh,uh,hh]),p=new Set([Cn,ri,zr,Vr,oh,lh]),T=new Uint32Array(4),S=new Int32Array(4);let y=null,w=null;const P=[],C=[];let L=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ii,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const v=this;let b=!1;this._outputColorSpace=qt;let R=0,F=0,U=null,B=-1,H=null;const W=new bt,z=new bt;let Z=null;const oe=new Pe(0);let ce=0,de=t.width,Xe=t.height,Ge=1,pt=null,mt=null;const Y=new bt(0,0,de,Xe),ee=new bt(0,0,de,Xe);let Me=!1;const Oe=new Sh;let Te=!1,it=!1;const gt=new He,qe=new I,J=new bt,ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Q=!1;function ge(){return U===null?Ge:1}let A=n;function De(M,O){return t.getContext(M,O)}try{const M={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${sh}`),t.addEventListener("webglcontextlost",We,!1),t.addEventListener("webglcontextrestored",yt,!1),t.addEventListener("webglcontextcreationerror",ct,!1),A===null){const O="webgl2";if(A=De(O,M),A===null)throw De(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw ke("WebGLRenderer: "+M.message),M}let ve,Be,ae,E,x,D,X,K,q,Re,le,Ce,ze,te,fe,Ae,Ie,ue,$e,N,xe,se,ye,ie;function $(){ve=new Vv(A),ve.init(),se=new LM(A,ve),Be=new Lv(A,ve,e,se),ae=new PM(A,ve),Be.reversedDepthBuffer&&d&&ae.buffers.depth.setReversed(!0),E=new Wv(A),x=new mM,D=new IM(A,ve,ae,x,Be,se,E),X=new Dv(v),K=new zv(v),q=new j0(A),ye=new Pv(A,q),Re=new Hv(A,q,E,ye),le=new qv(A,Re,q,E),$e=new Xv(A,Be,D),Ae=new Nv(x),Ce=new pM(v,X,K,ve,Be,ye,Ae),ze=new BM(v,x),te=new _M,fe=new bM(ve),ue=new Rv(v,X,K,ae,le,m,l),Ie=new AM(v,le,Be),ie=new kM(A,E,Be,ae),N=new Iv(A,ve,E),xe=new Gv(A,ve,E),E.programs=Ce.programs,v.capabilities=Be,v.extensions=ve,v.properties=x,v.renderLists=te,v.shadowMap=Ie,v.state=ae,v.info=E}$(),_!==Cn&&(L=new jv(_,t.width,t.height,i,r));const he=new UM(v,A);this.xr=he,this.getContext=function(){return A},this.getContextAttributes=function(){return A.getContextAttributes()},this.forceContextLoss=function(){const M=ve.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=ve.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return Ge},this.setPixelRatio=function(M){M!==void 0&&(Ge=M,this.setSize(de,Xe,!1))},this.getSize=function(M){return M.set(de,Xe)},this.setSize=function(M,O,G=!0){if(he.isPresenting){we("WebGLRenderer: Can't change size while VR device is presenting.");return}de=M,Xe=O,t.width=Math.floor(M*Ge),t.height=Math.floor(O*Ge),G===!0&&(t.style.width=M+"px",t.style.height=O+"px"),L!==null&&L.setSize(t.width,t.height),this.setViewport(0,0,M,O)},this.getDrawingBufferSize=function(M){return M.set(de*Ge,Xe*Ge).floor()},this.setDrawingBufferSize=function(M,O,G){de=M,Xe=O,Ge=G,t.width=Math.floor(M*G),t.height=Math.floor(O*G),this.setViewport(0,0,M,O)},this.setEffects=function(M){if(_===Cn){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let O=0;O<M.length;O++)if(M[O].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(W)},this.getViewport=function(M){return M.copy(Y)},this.setViewport=function(M,O,G,V){M.isVector4?Y.set(M.x,M.y,M.z,M.w):Y.set(M,O,G,V),ae.viewport(W.copy(Y).multiplyScalar(Ge).round())},this.getScissor=function(M){return M.copy(ee)},this.setScissor=function(M,O,G,V){M.isVector4?ee.set(M.x,M.y,M.z,M.w):ee.set(M,O,G,V),ae.scissor(z.copy(ee).multiplyScalar(Ge).round())},this.getScissorTest=function(){return Me},this.setScissorTest=function(M){ae.setScissorTest(Me=M)},this.setOpaqueSort=function(M){pt=M},this.setTransparentSort=function(M){mt=M},this.getClearColor=function(M){return M.copy(ue.getClearColor())},this.setClearColor=function(){ue.setClearColor(...arguments)},this.getClearAlpha=function(){return ue.getClearAlpha()},this.setClearAlpha=function(){ue.setClearAlpha(...arguments)},this.clear=function(M=!0,O=!0,G=!0){let V=0;if(M){let k=!1;if(U!==null){const pe=U.texture.format;k=g.has(pe)}if(k){const pe=U.texture.type,Se=p.has(pe),_e=ue.getClearColor(),Ee=ue.getClearAlpha(),Ne=_e.r,Ve=_e.g,Fe=_e.b;Se?(T[0]=Ne,T[1]=Ve,T[2]=Fe,T[3]=Ee,A.clearBufferuiv(A.COLOR,0,T)):(S[0]=Ne,S[1]=Ve,S[2]=Fe,S[3]=Ee,A.clearBufferiv(A.COLOR,0,S))}else V|=A.COLOR_BUFFER_BIT}O&&(V|=A.DEPTH_BUFFER_BIT),G&&(V|=A.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),A.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",We,!1),t.removeEventListener("webglcontextrestored",yt,!1),t.removeEventListener("webglcontextcreationerror",ct,!1),ue.dispose(),te.dispose(),fe.dispose(),x.dispose(),X.dispose(),K.dispose(),le.dispose(),ye.dispose(),ie.dispose(),Ce.dispose(),he.dispose(),he.removeEventListener("sessionstart",qh),he.removeEventListener("sessionend",Yh),qi.stop()};function We(M){M.preventDefault(),mo("WebGLRenderer: Context Lost."),b=!0}function yt(){mo("WebGLRenderer: Context Restored."),b=!1;const M=E.autoReset,O=Ie.enabled,G=Ie.autoUpdate,V=Ie.needsUpdate,k=Ie.type;$(),E.autoReset=M,Ie.enabled=O,Ie.autoUpdate=G,Ie.needsUpdate=V,Ie.type=k}function ct(M){ke("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Kn(M){const O=M.target;O.removeEventListener("dispose",Kn),hi(O)}function hi(M){Vp(M),x.remove(M)}function Vp(M){const O=x.get(M).programs;O!==void 0&&(O.forEach(function(G){Ce.releaseProgram(G)}),M.isShaderMaterial&&Ce.releaseShaderCache(M))}this.renderBufferDirect=function(M,O,G,V,k,pe){O===null&&(O=ne);const Se=k.isMesh&&k.matrixWorld.determinant()<0,_e=Gp(M,O,G,V,k);ae.setMaterial(V,Se);let Ee=G.index,Ne=1;if(V.wireframe===!0){if(Ee=Re.getWireframeAttribute(G),Ee===void 0)return;Ne=2}const Ve=G.drawRange,Fe=G.attributes.position;let Qe=Ve.start*Ne,_t=(Ve.start+Ve.count)*Ne;pe!==null&&(Qe=Math.max(Qe,pe.start*Ne),_t=Math.min(_t,(pe.start+pe.count)*Ne)),Ee!==null?(Qe=Math.max(Qe,0),_t=Math.min(_t,Ee.count)):Fe!=null&&(Qe=Math.max(Qe,0),_t=Math.min(_t,Fe.count));const Ct=_t-Qe;if(Ct<0||Ct===1/0)return;ye.setup(k,V,_e,G,Ee);let At,vt=N;if(Ee!==null&&(At=q.get(Ee),vt=xe,vt.setIndex(At)),k.isMesh)V.wireframe===!0?(ae.setLineWidth(V.wireframeLinewidth*ge()),vt.setMode(A.LINES)):vt.setMode(A.TRIANGLES);else if(k.isLine){let Ue=V.linewidth;Ue===void 0&&(Ue=1),ae.setLineWidth(Ue*ge()),k.isLineSegments?vt.setMode(A.LINES):k.isLineLoop?vt.setMode(A.LINE_LOOP):vt.setMode(A.LINE_STRIP)}else k.isPoints?vt.setMode(A.POINTS):k.isSprite&&vt.setMode(A.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)Xr("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),vt.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(ve.get("WEBGL_multi_draw"))vt.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Ue=k._multiDrawStarts,ht=k._multiDrawCounts,rt=k._multiDrawCount,xn=Ee?q.get(Ee).bytesPerElement:1,ys=x.get(V).currentProgram.getUniforms();for(let vn=0;vn<rt;vn++)ys.setValue(A,"_gl_DrawID",vn),vt.render(Ue[vn]/xn,ht[vn])}else if(k.isInstancedMesh)vt.renderInstances(Qe,Ct,k.count);else if(G.isInstancedBufferGeometry){const Ue=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,ht=Math.min(G.instanceCount,Ue);vt.renderInstances(Qe,Ct,ht)}else vt.render(Qe,Ct)};function Xh(M,O,G){M.transparent===!0&&M.side===on&&M.forceSinglePass===!1?(M.side=gn,M.needsUpdate=!0,oa(M,O,G),M.side=Ti,M.needsUpdate=!0,oa(M,O,G),M.side=on):oa(M,O,G)}this.compile=function(M,O,G=null){G===null&&(G=M),w=fe.get(G),w.init(O),C.push(w),G.traverseVisible(function(k){k.isLight&&k.layers.test(O.layers)&&(w.pushLight(k),k.castShadow&&w.pushShadow(k))}),M!==G&&M.traverseVisible(function(k){k.isLight&&k.layers.test(O.layers)&&(w.pushLight(k),k.castShadow&&w.pushShadow(k))}),w.setupLights();const V=new Set;return M.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const pe=k.material;if(pe)if(Array.isArray(pe))for(let Se=0;Se<pe.length;Se++){const _e=pe[Se];Xh(_e,G,k),V.add(_e)}else Xh(pe,G,k),V.add(pe)}),w=C.pop(),V},this.compileAsync=function(M,O,G=null){const V=this.compile(M,O,G);return new Promise(k=>{function pe(){if(V.forEach(function(Se){x.get(Se).currentProgram.isReady()&&V.delete(Se)}),V.size===0){k(M);return}setTimeout(pe,10)}ve.get("KHR_parallel_shader_compile")!==null?pe():setTimeout(pe,10)})};let zo=null;function Hp(M){zo&&zo(M)}function qh(){qi.stop()}function Yh(){qi.start()}const qi=new Jf;qi.setAnimationLoop(Hp),typeof self<"u"&&qi.setContext(self),this.setAnimationLoop=function(M){zo=M,he.setAnimationLoop(M),M===null?qi.stop():qi.start()},he.addEventListener("sessionstart",qh),he.addEventListener("sessionend",Yh),this.render=function(M,O){if(O!==void 0&&O.isCamera!==!0){ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(b===!0)return;const G=he.enabled===!0&&he.isPresenting===!0,V=L!==null&&(U===null||G)&&L.begin(v,U);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),he.enabled===!0&&he.isPresenting===!0&&(L===null||L.isCompositing()===!1)&&(he.cameraAutoUpdate===!0&&he.updateCamera(O),O=he.getCamera()),M.isScene===!0&&M.onBeforeRender(v,M,O,U),w=fe.get(M,C.length),w.init(O),C.push(w),gt.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Oe.setFromProjectionMatrix(gt,ni,O.reversedDepth),it=this.localClippingEnabled,Te=Ae.init(this.clippingPlanes,it),y=te.get(M,P.length),y.init(),P.push(y),he.enabled===!0&&he.isPresenting===!0){const Se=v.xr.getDepthSensingMesh();Se!==null&&Vo(Se,O,-1/0,v.sortObjects)}Vo(M,O,0,v.sortObjects),y.finish(),v.sortObjects===!0&&y.sort(pt,mt),Q=he.enabled===!1||he.isPresenting===!1||he.hasDepthSensing()===!1,Q&&ue.addToRenderList(y,M),this.info.render.frame++,Te===!0&&Ae.beginShadows();const k=w.state.shadowsArray;if(Ie.render(k,M,O),Te===!0&&Ae.endShadows(),this.info.autoReset===!0&&this.info.reset(),(V&&L.hasRenderPass())===!1){const Se=y.opaque,_e=y.transmissive;if(w.setupLights(),O.isArrayCamera){const Ee=O.cameras;if(_e.length>0)for(let Ne=0,Ve=Ee.length;Ne<Ve;Ne++){const Fe=Ee[Ne];Kh(Se,_e,M,Fe)}Q&&ue.render(M);for(let Ne=0,Ve=Ee.length;Ne<Ve;Ne++){const Fe=Ee[Ne];jh(y,M,Fe,Fe.viewport)}}else _e.length>0&&Kh(Se,_e,M,O),Q&&ue.render(M),jh(y,M,O)}U!==null&&F===0&&(D.updateMultisampleRenderTarget(U),D.updateRenderTargetMipmap(U)),V&&L.end(v),M.isScene===!0&&M.onAfterRender(v,M,O),ye.resetDefaultState(),B=-1,H=null,C.pop(),C.length>0?(w=C[C.length-1],Te===!0&&Ae.setGlobalState(v.clippingPlanes,w.state.camera)):w=null,P.pop(),P.length>0?y=P[P.length-1]:y=null};function Vo(M,O,G,V){if(M.visible===!1)return;if(M.layers.test(O.layers)){if(M.isGroup)G=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(O);else if(M.isLight)w.pushLight(M),M.castShadow&&w.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Oe.intersectsSprite(M)){V&&J.setFromMatrixPosition(M.matrixWorld).applyMatrix4(gt);const Se=le.update(M),_e=M.material;_e.visible&&y.push(M,Se,_e,G,J.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Oe.intersectsObject(M))){const Se=le.update(M),_e=M.material;if(V&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),J.copy(M.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),J.copy(Se.boundingSphere.center)),J.applyMatrix4(M.matrixWorld).applyMatrix4(gt)),Array.isArray(_e)){const Ee=Se.groups;for(let Ne=0,Ve=Ee.length;Ne<Ve;Ne++){const Fe=Ee[Ne],Qe=_e[Fe.materialIndex];Qe&&Qe.visible&&y.push(M,Se,Qe,G,J.z,Fe)}}else _e.visible&&y.push(M,Se,_e,G,J.z,null)}}const pe=M.children;for(let Se=0,_e=pe.length;Se<_e;Se++)Vo(pe[Se],O,G,V)}function jh(M,O,G,V){const{opaque:k,transmissive:pe,transparent:Se}=M;w.setupLightsView(G),Te===!0&&Ae.setGlobalState(v.clippingPlanes,G),V&&ae.viewport(W.copy(V)),k.length>0&&aa(k,O,G),pe.length>0&&aa(pe,O,G),Se.length>0&&aa(Se,O,G),ae.buffers.depth.setTest(!0),ae.buffers.depth.setMask(!0),ae.buffers.color.setMask(!0),ae.setPolygonOffset(!1)}function Kh(M,O,G,V){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[V.id]===void 0){const Qe=ve.has("EXT_color_buffer_half_float")||ve.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[V.id]=new si(1,1,{generateMipmaps:!0,type:Qe?wi:Cn,minFilter:_i,samples:Be.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace})}const pe=w.state.transmissionRenderTarget[V.id],Se=V.viewport||W;pe.setSize(Se.z*v.transmissionResolutionScale,Se.w*v.transmissionResolutionScale);const _e=v.getRenderTarget(),Ee=v.getActiveCubeFace(),Ne=v.getActiveMipmapLevel();v.setRenderTarget(pe),v.getClearColor(oe),ce=v.getClearAlpha(),ce<1&&v.setClearColor(16777215,.5),v.clear(),Q&&ue.render(G);const Ve=v.toneMapping;v.toneMapping=ii;const Fe=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),w.setupLightsView(V),Te===!0&&Ae.setGlobalState(v.clippingPlanes,V),aa(M,G,V),D.updateMultisampleRenderTarget(pe),D.updateRenderTargetMipmap(pe),ve.has("WEBGL_multisampled_render_to_texture")===!1){let Qe=!1;for(let _t=0,Ct=O.length;_t<Ct;_t++){const At=O[_t],{object:vt,geometry:Ue,material:ht,group:rt}=At;if(ht.side===on&&vt.layers.test(V.layers)){const xn=ht.side;ht.side=gn,ht.needsUpdate=!0,$h(vt,G,V,Ue,ht,rt),ht.side=xn,ht.needsUpdate=!0,Qe=!0}}Qe===!0&&(D.updateMultisampleRenderTarget(pe),D.updateRenderTargetMipmap(pe))}v.setRenderTarget(_e,Ee,Ne),v.setClearColor(oe,ce),Fe!==void 0&&(V.viewport=Fe),v.toneMapping=Ve}function aa(M,O,G){const V=O.isScene===!0?O.overrideMaterial:null;for(let k=0,pe=M.length;k<pe;k++){const Se=M[k],{object:_e,geometry:Ee,group:Ne}=Se;let Ve=Se.material;Ve.allowOverride===!0&&V!==null&&(Ve=V),_e.layers.test(G.layers)&&$h(_e,O,G,Ee,Ve,Ne)}}function $h(M,O,G,V,k,pe){M.onBeforeRender(v,O,G,V,k,pe),M.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),k.onBeforeRender(v,O,G,V,M,pe),k.transparent===!0&&k.side===on&&k.forceSinglePass===!1?(k.side=gn,k.needsUpdate=!0,v.renderBufferDirect(G,O,V,k,M,pe),k.side=Ti,k.needsUpdate=!0,v.renderBufferDirect(G,O,V,k,M,pe),k.side=on):v.renderBufferDirect(G,O,V,k,M,pe),M.onAfterRender(v,O,G,V,k,pe)}function oa(M,O,G){O.isScene!==!0&&(O=ne);const V=x.get(M),k=w.state.lights,pe=w.state.shadowsArray,Se=k.state.version,_e=Ce.getParameters(M,k.state,pe,O,G),Ee=Ce.getProgramCacheKey(_e);let Ne=V.programs;V.environment=M.isMeshStandardMaterial?O.environment:null,V.fog=O.fog,V.envMap=(M.isMeshStandardMaterial?K:X).get(M.envMap||V.environment),V.envMapRotation=V.environment!==null&&M.envMap===null?O.environmentRotation:M.envMapRotation,Ne===void 0&&(M.addEventListener("dispose",Kn),Ne=new Map,V.programs=Ne);let Ve=Ne.get(Ee);if(Ve!==void 0){if(V.currentProgram===Ve&&V.lightsStateVersion===Se)return Zh(M,_e),Ve}else _e.uniforms=Ce.getUniforms(M),M.onBeforeCompile(_e,v),Ve=Ce.acquireProgram(_e,Ee),Ne.set(Ee,Ve),V.uniforms=_e.uniforms;const Fe=V.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Fe.clippingPlanes=Ae.uniform),Zh(M,_e),V.needsLights=Xp(M),V.lightsStateVersion=Se,V.needsLights&&(Fe.ambientLightColor.value=k.state.ambient,Fe.lightProbe.value=k.state.probe,Fe.directionalLights.value=k.state.directional,Fe.directionalLightShadows.value=k.state.directionalShadow,Fe.spotLights.value=k.state.spot,Fe.spotLightShadows.value=k.state.spotShadow,Fe.rectAreaLights.value=k.state.rectArea,Fe.ltc_1.value=k.state.rectAreaLTC1,Fe.ltc_2.value=k.state.rectAreaLTC2,Fe.pointLights.value=k.state.point,Fe.pointLightShadows.value=k.state.pointShadow,Fe.hemisphereLights.value=k.state.hemi,Fe.directionalShadowMap.value=k.state.directionalShadowMap,Fe.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Fe.spotShadowMap.value=k.state.spotShadowMap,Fe.spotLightMatrix.value=k.state.spotLightMatrix,Fe.spotLightMap.value=k.state.spotLightMap,Fe.pointShadowMap.value=k.state.pointShadowMap,Fe.pointShadowMatrix.value=k.state.pointShadowMatrix),V.currentProgram=Ve,V.uniformsList=null,Ve}function Jh(M){if(M.uniformsList===null){const O=M.currentProgram.getUniforms();M.uniformsList=no.seqWithValue(O.seq,M.uniforms)}return M.uniformsList}function Zh(M,O){const G=x.get(M);G.outputColorSpace=O.outputColorSpace,G.batching=O.batching,G.batchingColor=O.batchingColor,G.instancing=O.instancing,G.instancingColor=O.instancingColor,G.instancingMorph=O.instancingMorph,G.skinning=O.skinning,G.morphTargets=O.morphTargets,G.morphNormals=O.morphNormals,G.morphColors=O.morphColors,G.morphTargetsCount=O.morphTargetsCount,G.numClippingPlanes=O.numClippingPlanes,G.numIntersection=O.numClipIntersection,G.vertexAlphas=O.vertexAlphas,G.vertexTangents=O.vertexTangents,G.toneMapping=O.toneMapping}function Gp(M,O,G,V,k){O.isScene!==!0&&(O=ne),D.resetTextureUnits();const pe=O.fog,Se=V.isMeshStandardMaterial?O.environment:null,_e=U===null?v.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:cn,Ee=(V.isMeshStandardMaterial?K:X).get(V.envMap||Se),Ne=V.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Ve=!!G.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Fe=!!G.morphAttributes.position,Qe=!!G.morphAttributes.normal,_t=!!G.morphAttributes.color;let Ct=ii;V.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(Ct=v.toneMapping);const At=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,vt=At!==void 0?At.length:0,Ue=x.get(V),ht=w.state.lights;if(Te===!0&&(it===!0||M!==H)){const tn=M===H&&V.id===B;Ae.setState(V,M,tn)}let rt=!1;V.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==ht.state.version||Ue.outputColorSpace!==_e||k.isBatchedMesh&&Ue.batching===!1||!k.isBatchedMesh&&Ue.batching===!0||k.isBatchedMesh&&Ue.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&Ue.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&Ue.instancing===!1||!k.isInstancedMesh&&Ue.instancing===!0||k.isSkinnedMesh&&Ue.skinning===!1||!k.isSkinnedMesh&&Ue.skinning===!0||k.isInstancedMesh&&Ue.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Ue.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Ue.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Ue.instancingMorph===!1&&k.morphTexture!==null||Ue.envMap!==Ee||V.fog===!0&&Ue.fog!==pe||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==Ae.numPlanes||Ue.numIntersection!==Ae.numIntersection)||Ue.vertexAlphas!==Ne||Ue.vertexTangents!==Ve||Ue.morphTargets!==Fe||Ue.morphNormals!==Qe||Ue.morphColors!==_t||Ue.toneMapping!==Ct||Ue.morphTargetsCount!==vt)&&(rt=!0):(rt=!0,Ue.__version=V.version);let xn=Ue.currentProgram;rt===!0&&(xn=oa(V,O,k));let ys=!1,vn=!1,ur=!1;const Mt=xn.getUniforms(),hn=Ue.uniforms;if(ae.useProgram(xn.program)&&(ys=!0,vn=!0,ur=!0),V.id!==B&&(B=V.id,vn=!0),ys||H!==M){ae.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Mt.setValue(A,"projectionMatrix",M.projectionMatrix),Mt.setValue(A,"viewMatrix",M.matrixWorldInverse);const un=Mt.map.cameraPosition;un!==void 0&&un.setValue(A,qe.setFromMatrixPosition(M.matrixWorld)),Be.logarithmicDepthBuffer&&Mt.setValue(A,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Mt.setValue(A,"isOrthographic",M.isOrthographicCamera===!0),H!==M&&(H=M,vn=!0,ur=!0)}if(Ue.needsLights&&(ht.state.directionalShadowMap.length>0&&Mt.setValue(A,"directionalShadowMap",ht.state.directionalShadowMap,D),ht.state.spotShadowMap.length>0&&Mt.setValue(A,"spotShadowMap",ht.state.spotShadowMap,D),ht.state.pointShadowMap.length>0&&Mt.setValue(A,"pointShadowMap",ht.state.pointShadowMap,D)),k.isSkinnedMesh){Mt.setOptional(A,k,"bindMatrix"),Mt.setOptional(A,k,"bindMatrixInverse");const tn=k.skeleton;tn&&(tn.boneTexture===null&&tn.computeBoneTexture(),Mt.setValue(A,"boneTexture",tn.boneTexture,D))}k.isBatchedMesh&&(Mt.setOptional(A,k,"batchingTexture"),Mt.setValue(A,"batchingTexture",k._matricesTexture,D),Mt.setOptional(A,k,"batchingIdTexture"),Mt.setValue(A,"batchingIdTexture",k._indirectTexture,D),Mt.setOptional(A,k,"batchingColorTexture"),k._colorsTexture!==null&&Mt.setValue(A,"batchingColorTexture",k._colorsTexture,D));const Rn=G.morphAttributes;if((Rn.position!==void 0||Rn.normal!==void 0||Rn.color!==void 0)&&$e.update(k,G,xn),(vn||Ue.receiveShadow!==k.receiveShadow)&&(Ue.receiveShadow=k.receiveShadow,Mt.setValue(A,"receiveShadow",k.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(hn.envMap.value=Ee,hn.flipEnvMap.value=Ee.isCubeTexture&&Ee.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&O.environment!==null&&(hn.envMapIntensity.value=O.environmentIntensity),hn.dfgLUT!==void 0&&(hn.dfgLUT.value=VM()),vn&&(Mt.setValue(A,"toneMappingExposure",v.toneMappingExposure),Ue.needsLights&&Wp(hn,ur),pe&&V.fog===!0&&ze.refreshFogUniforms(hn,pe),ze.refreshMaterialUniforms(hn,V,Ge,Xe,w.state.transmissionRenderTarget[M.id]),no.upload(A,Jh(Ue),hn,D)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(no.upload(A,Jh(Ue),hn,D),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Mt.setValue(A,"center",k.center),Mt.setValue(A,"modelViewMatrix",k.modelViewMatrix),Mt.setValue(A,"normalMatrix",k.normalMatrix),Mt.setValue(A,"modelMatrix",k.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const tn=V.uniformsGroups;for(let un=0,Ho=tn.length;un<Ho;un++){const Yi=tn[un];ie.update(Yi,xn),ie.bind(Yi,xn)}}return xn}function Wp(M,O){M.ambientLightColor.needsUpdate=O,M.lightProbe.needsUpdate=O,M.directionalLights.needsUpdate=O,M.directionalLightShadows.needsUpdate=O,M.pointLights.needsUpdate=O,M.pointLightShadows.needsUpdate=O,M.spotLights.needsUpdate=O,M.spotLightShadows.needsUpdate=O,M.rectAreaLights.needsUpdate=O,M.hemisphereLights.needsUpdate=O}function Xp(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(M,O,G){const V=x.get(M);V.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),x.get(M.texture).__webglTexture=O,x.get(M.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:G,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,O){const G=x.get(M);G.__webglFramebuffer=O,G.__useDefaultFramebuffer=O===void 0};const qp=A.createFramebuffer();this.setRenderTarget=function(M,O=0,G=0){U=M,R=O,F=G;let V=null,k=!1,pe=!1;if(M){const _e=x.get(M);if(_e.__useDefaultFramebuffer!==void 0){ae.bindFramebuffer(A.FRAMEBUFFER,_e.__webglFramebuffer),W.copy(M.viewport),z.copy(M.scissor),Z=M.scissorTest,ae.viewport(W),ae.scissor(z),ae.setScissorTest(Z),B=-1;return}else if(_e.__webglFramebuffer===void 0)D.setupRenderTarget(M);else if(_e.__hasExternalTextures)D.rebindTextures(M,x.get(M.texture).__webglTexture,x.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Ve=M.depthTexture;if(_e.__boundDepthTexture!==Ve){if(Ve!==null&&x.has(Ve)&&(M.width!==Ve.image.width||M.height!==Ve.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(M)}}const Ee=M.texture;(Ee.isData3DTexture||Ee.isDataArrayTexture||Ee.isCompressedArrayTexture)&&(pe=!0);const Ne=x.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ne[O])?V=Ne[O][G]:V=Ne[O],k=!0):M.samples>0&&D.useMultisampledRTT(M)===!1?V=x.get(M).__webglMultisampledFramebuffer:Array.isArray(Ne)?V=Ne[G]:V=Ne,W.copy(M.viewport),z.copy(M.scissor),Z=M.scissorTest}else W.copy(Y).multiplyScalar(Ge).floor(),z.copy(ee).multiplyScalar(Ge).floor(),Z=Me;if(G!==0&&(V=qp),ae.bindFramebuffer(A.FRAMEBUFFER,V)&&ae.drawBuffers(M,V),ae.viewport(W),ae.scissor(z),ae.setScissorTest(Z),k){const _e=x.get(M.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_CUBE_MAP_POSITIVE_X+O,_e.__webglTexture,G)}else if(pe){const _e=O;for(let Ee=0;Ee<M.textures.length;Ee++){const Ne=x.get(M.textures[Ee]);A.framebufferTextureLayer(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0+Ee,Ne.__webglTexture,G,_e)}}else if(M!==null&&G!==0){const _e=x.get(M.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,_e.__webglTexture,G)}B=-1},this.readRenderTargetPixels=function(M,O,G,V,k,pe,Se,_e=0){if(!(M&&M.isWebGLRenderTarget)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=x.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Se!==void 0&&(Ee=Ee[Se]),Ee){ae.bindFramebuffer(A.FRAMEBUFFER,Ee);try{const Ne=M.textures[_e],Ve=Ne.format,Fe=Ne.type;if(!Be.textureFormatReadable(Ve)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Be.textureTypeReadable(Fe)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=M.width-V&&G>=0&&G<=M.height-k&&(M.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+_e),A.readPixels(O,G,V,k,se.convert(Ve),se.convert(Fe),pe))}finally{const Ne=U!==null?x.get(U).__webglFramebuffer:null;ae.bindFramebuffer(A.FRAMEBUFFER,Ne)}}},this.readRenderTargetPixelsAsync=async function(M,O,G,V,k,pe,Se,_e=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=x.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Se!==void 0&&(Ee=Ee[Se]),Ee)if(O>=0&&O<=M.width-V&&G>=0&&G<=M.height-k){ae.bindFramebuffer(A.FRAMEBUFFER,Ee);const Ne=M.textures[_e],Ve=Ne.format,Fe=Ne.type;if(!Be.textureFormatReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Be.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Qe=A.createBuffer();A.bindBuffer(A.PIXEL_PACK_BUFFER,Qe),A.bufferData(A.PIXEL_PACK_BUFFER,pe.byteLength,A.STREAM_READ),M.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+_e),A.readPixels(O,G,V,k,se.convert(Ve),se.convert(Fe),0);const _t=U!==null?x.get(U).__webglFramebuffer:null;ae.bindFramebuffer(A.FRAMEBUFFER,_t);const Ct=A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE,0);return A.flush(),await Lm(A,Ct,4),A.bindBuffer(A.PIXEL_PACK_BUFFER,Qe),A.getBufferSubData(A.PIXEL_PACK_BUFFER,0,pe),A.deleteBuffer(Qe),A.deleteSync(Ct),pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,O=null,G=0){const V=Math.pow(2,-G),k=Math.floor(M.image.width*V),pe=Math.floor(M.image.height*V),Se=O!==null?O.x:0,_e=O!==null?O.y:0;D.setTexture2D(M,0),A.copyTexSubImage2D(A.TEXTURE_2D,G,0,0,Se,_e,k,pe),ae.unbindTexture()};const Yp=A.createFramebuffer(),jp=A.createFramebuffer();this.copyTextureToTexture=function(M,O,G=null,V=null,k=0,pe=null){pe===null&&(k!==0?(Xr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),pe=k,k=0):pe=0);let Se,_e,Ee,Ne,Ve,Fe,Qe,_t,Ct;const At=M.isCompressedTexture?M.mipmaps[pe]:M.image;if(G!==null)Se=G.max.x-G.min.x,_e=G.max.y-G.min.y,Ee=G.isBox3?G.max.z-G.min.z:1,Ne=G.min.x,Ve=G.min.y,Fe=G.isBox3?G.min.z:0;else{const Rn=Math.pow(2,-k);Se=Math.floor(At.width*Rn),_e=Math.floor(At.height*Rn),M.isDataArrayTexture?Ee=At.depth:M.isData3DTexture?Ee=Math.floor(At.depth*Rn):Ee=1,Ne=0,Ve=0,Fe=0}V!==null?(Qe=V.x,_t=V.y,Ct=V.z):(Qe=0,_t=0,Ct=0);const vt=se.convert(O.format),Ue=se.convert(O.type);let ht;O.isData3DTexture?(D.setTexture3D(O,0),ht=A.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(D.setTexture2DArray(O,0),ht=A.TEXTURE_2D_ARRAY):(D.setTexture2D(O,0),ht=A.TEXTURE_2D),A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL,O.flipY),A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),A.pixelStorei(A.UNPACK_ALIGNMENT,O.unpackAlignment);const rt=A.getParameter(A.UNPACK_ROW_LENGTH),xn=A.getParameter(A.UNPACK_IMAGE_HEIGHT),ys=A.getParameter(A.UNPACK_SKIP_PIXELS),vn=A.getParameter(A.UNPACK_SKIP_ROWS),ur=A.getParameter(A.UNPACK_SKIP_IMAGES);A.pixelStorei(A.UNPACK_ROW_LENGTH,At.width),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,At.height),A.pixelStorei(A.UNPACK_SKIP_PIXELS,Ne),A.pixelStorei(A.UNPACK_SKIP_ROWS,Ve),A.pixelStorei(A.UNPACK_SKIP_IMAGES,Fe);const Mt=M.isDataArrayTexture||M.isData3DTexture,hn=O.isDataArrayTexture||O.isData3DTexture;if(M.isDepthTexture){const Rn=x.get(M),tn=x.get(O),un=x.get(Rn.__renderTarget),Ho=x.get(tn.__renderTarget);ae.bindFramebuffer(A.READ_FRAMEBUFFER,un.__webglFramebuffer),ae.bindFramebuffer(A.DRAW_FRAMEBUFFER,Ho.__webglFramebuffer);for(let Yi=0;Yi<Ee;Yi++)Mt&&(A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,x.get(M).__webglTexture,k,Fe+Yi),A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,x.get(O).__webglTexture,pe,Ct+Yi)),A.blitFramebuffer(Ne,Ve,Se,_e,Qe,_t,Se,_e,A.DEPTH_BUFFER_BIT,A.NEAREST);ae.bindFramebuffer(A.READ_FRAMEBUFFER,null),ae.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else if(k!==0||M.isRenderTargetTexture||x.has(M)){const Rn=x.get(M),tn=x.get(O);ae.bindFramebuffer(A.READ_FRAMEBUFFER,Yp),ae.bindFramebuffer(A.DRAW_FRAMEBUFFER,jp);for(let un=0;un<Ee;un++)Mt?A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,Rn.__webglTexture,k,Fe+un):A.framebufferTexture2D(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,Rn.__webglTexture,k),hn?A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,tn.__webglTexture,pe,Ct+un):A.framebufferTexture2D(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,tn.__webglTexture,pe),k!==0?A.blitFramebuffer(Ne,Ve,Se,_e,Qe,_t,Se,_e,A.COLOR_BUFFER_BIT,A.NEAREST):hn?A.copyTexSubImage3D(ht,pe,Qe,_t,Ct+un,Ne,Ve,Se,_e):A.copyTexSubImage2D(ht,pe,Qe,_t,Ne,Ve,Se,_e);ae.bindFramebuffer(A.READ_FRAMEBUFFER,null),ae.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else hn?M.isDataTexture||M.isData3DTexture?A.texSubImage3D(ht,pe,Qe,_t,Ct,Se,_e,Ee,vt,Ue,At.data):O.isCompressedArrayTexture?A.compressedTexSubImage3D(ht,pe,Qe,_t,Ct,Se,_e,Ee,vt,At.data):A.texSubImage3D(ht,pe,Qe,_t,Ct,Se,_e,Ee,vt,Ue,At):M.isDataTexture?A.texSubImage2D(A.TEXTURE_2D,pe,Qe,_t,Se,_e,vt,Ue,At.data):M.isCompressedTexture?A.compressedTexSubImage2D(A.TEXTURE_2D,pe,Qe,_t,At.width,At.height,vt,At.data):A.texSubImage2D(A.TEXTURE_2D,pe,Qe,_t,Se,_e,vt,Ue,At);A.pixelStorei(A.UNPACK_ROW_LENGTH,rt),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,xn),A.pixelStorei(A.UNPACK_SKIP_PIXELS,ys),A.pixelStorei(A.UNPACK_SKIP_ROWS,vn),A.pixelStorei(A.UNPACK_SKIP_IMAGES,ur),pe===0&&O.generateMipmaps&&A.generateMipmap(ht),ae.unbindTexture()},this.initRenderTarget=function(M){x.get(M).__webglFramebuffer===void 0&&D.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?D.setTextureCube(M,0):M.isData3DTexture?D.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?D.setTexture2DArray(M,0):D.setTexture2D(M,0),ae.unbindTexture()},this.resetState=function(){R=0,F=0,U=null,ae.reset(),ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ni}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}}function xd(s,e){if(e===Mm)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Dc||e===xf){let t=s.getIndex();if(t===null){const a=[],o=s.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);s.setIndex(a),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===Dc)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class Nh extends vs{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new YM(t)}),this.register(function(t){return new jM(t)}),this.register(function(t){return new iS(t)}),this.register(function(t){return new sS(t)}),this.register(function(t){return new rS(t)}),this.register(function(t){return new $M(t)}),this.register(function(t){return new JM(t)}),this.register(function(t){return new ZM(t)}),this.register(function(t){return new QM(t)}),this.register(function(t){return new qM(t)}),this.register(function(t){return new eS(t)}),this.register(function(t){return new KM(t)}),this.register(function(t){return new nS(t)}),this.register(function(t){return new tS(t)}),this.register(function(t){return new WM(t)}),this.register(function(t){return new aS(t)}),this.register(function(t){return new oS(t)})}load(e,t,n,i){const r=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const c=Or.extractUrlBase(e);a=Or.resolveURL(c,this.path)}else a=Or.extractUrlBase(e);this.manager.itemStart(e);const o=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ah(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===np){try{a[tt.KHR_BINARY_GLTF]=new lS(e)}catch(u){i&&i(u);return}r=JSON.parse(a[tt.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new MS(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case tt.KHR_MATERIALS_UNLIT:a[u]=new XM;break;case tt.KHR_DRACO_MESH_COMPRESSION:a[u]=new cS(r,this.dracoLoader);break;case tt.KHR_TEXTURE_TRANSFORM:a[u]=new hS;break;case tt.KHR_MESH_QUANTIZATION:a[u]=new uS;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function GM(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const tt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class WM{constructor(e){this.parser=e,this.name=tt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let c;const h=new Pe(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],cn);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Yf(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Ph(h),c.distance=u;break;case"spot":c=new E0(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),Zn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}}class XM{constructor(){this.name=tt.KHR_MATERIALS_UNLIT}getMaterialType(){return On}extendParams(e,t,n){const i=[];e.color=new Pe(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],cn),e.opacity=a[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,qt))}return Promise.all(i)}}class qM{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class YM{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new re(o,o)}return Promise.all(r)}}class jM{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class KM{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(r)}}class $M{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new Pe(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],cn)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,qt)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}}class JM{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}}class ZM{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new Pe().setRGB(o[0],o[1],o[2],cn),Promise.all(r)}}class QM{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class eS{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new Pe().setRGB(o[0],o[1],o[2],cn),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,qt)),Promise.all(r)}}class tS{constructor(e){this.parser=e,this.name=tt.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(r)}}class nS{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ci}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(r)}}class iS{constructor(e){this.parser=e,this.name=tt.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}}class sS{constructor(e){this.parser=e,this.name=tt.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}}class rS{constructor(e){this.parser=e,this.name=tt.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}}class aS{constructor(e){this.name=tt.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}class oS{constructor(e){this.name=tt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==Ln.TRIANGLES&&c.mode!==Ln.TRIANGLE_STRIP&&c.mode!==Ln.TRIANGLE_FAN&&c.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],l={};for(const c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(const m of u){const _=new He,g=new I,p=new Bt,T=new I(1,1,1),S=new bg(m.geometry,m.material,d);for(let y=0;y<d;y++)l.TRANSLATION&&g.fromBufferAttribute(l.TRANSLATION,y),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,y),l.SCALE&&T.fromBufferAttribute(l.SCALE,y),S.setMatrixAt(y,_.compose(g,p,T));for(const y in l)if(y==="_COLOR_0"){const w=l[y];S.instanceColor=new Uc(w.array,w.itemSize,w.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&m.geometry.setAttribute(y,l[y]);St.prototype.copy.call(S,m),this.parser.assignFinalMaterial(S),f.push(S)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const np="glTF",Tr=12,vd={JSON:1313821514,BIN:5130562};class lS{constructor(e){this.name=tt.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Tr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==np)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-Tr,r=new DataView(e,Tr);let a=0;for(;a<i;){const o=r.getUint32(a,!0);a+=4;const l=r.getUint32(a,!0);if(a+=4,l===vd.JSON){const c=new Uint8Array(e,Tr+a,o);this.content=n.decode(c)}else if(l===vd.BIN){const c=Tr+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class cS{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=tt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(const h in a){const u=Gc[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=Gc[h]||h.toLowerCase();if(a[h]!==void 0){const d=n.accessors[e.attributes[h]],f=Ys[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const m in f.attributes){const _=f.attributes[m],g=l[m];g!==void 0&&(_.normalized=g)}u(f)},o,c,cn,d)})})}}class hS{constructor(){this.name=tt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class uS{constructor(){this.name=tt.KHR_MESH_QUANTIZATION}}class ip extends na{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,m=e*c,_=m-c,g=-2*f+3*d,p=f-d,T=1-g,S=p-d+u;for(let y=0;y!==o;y++){const w=a[_+y+o],P=a[_+y+l]*h,C=a[m+y+o],L=a[m+y]*h;r[y]=T*w+S*P+g*C+p*L}return r}}const dS=new Bt;class fS extends ip{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return dS.fromArray(r).normalize().toArray(r),r}}const Ln={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Ys={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},yd={9728:Ot,9729:Et,9984:hf,9985:Ja,9986:Rr,9987:_i},Md={33071:ti,33648:ho,10497:$s},Al={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Gc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Ni={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},pS={CUBICSPLINE:void 0,LINEAR:Gr,STEP:Hr},Rl={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function mS(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Vi({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Ti})),s.DefaultMaterial}function is(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Zn(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function gS(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;a.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;o.push(d)}if(r){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],d=c[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function _S(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function xS(s){let e;const t=s.extensions&&s.extensions[tt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Pl(t.attributes):e=s.indices+":"+Pl(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Pl(s.targets[n]);return e}function Pl(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Wc(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function vS(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const yS=new He;class MS{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new GM,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const l=o.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&a<98?this.textureLoader=new T0(this.options.manager):this.textureLoader=new P0(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ah(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return is(r,o,i),Zn(o,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(const l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const a=t[i].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(a,o)=>{const l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(const[c,h]of a.children.entries())r(h,o.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[tt.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,a){n.load(Or.resolveURL(t.uri,i.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Al[i.type],o=Ys[i.componentType],l=i.normalized===!0,c=new o(i.count*a);return Promise.resolve(new ln(c,a,l))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],l=Al[i.type],c=Ys[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0;let _,g;if(f&&f!==u){const p=Math.floor(d/f),T="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let S=t.cache.get(T);S||(_=new c(o,p*f,i.count*f/h),S=new Rf(_,f/h),t.cache.add(T,S)),g=new qr(S,l,d%f/h,m)}else o===null?_=new c(i.count*l):_=new c(o,d,i.count*l),g=new ln(_,l,m);if(i.sparse!==void 0){const p=Al.SCALAR,T=Ys[i.sparse.indices.componentType],S=i.sparse.indices.byteOffset||0,y=i.sparse.values.byteOffset||0,w=new T(a[1],S,i.sparse.count*p),P=new c(a[2],y,i.sparse.count*l);o!==null&&(g=new ln(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let C=0,L=w.length;C<L;C++){const v=w[C];if(g.setX(v,P[C*l]),l>=2&&g.setY(v,P[C*l+1]),l>=3&&g.setZ(v,P[C*l+2]),l>=4&&g.setW(v,P[C*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=m}return g})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r];let o=this.textureLoader;if(a.uri){const l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){const i=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const d=(r.samplers||{})[a.sampler]||{};return h.magFilter=yd[d.magFilter]||Et,h.minFilter=yd[d.minFilter]||_i,h.wrapS=Md[d.wrapS]||$s,h.wrapT=Md[d.wrapT]||$s,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Ot&&h.minFilter!==Et,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(u){c=!0;const d=new Blob([u],{type:a.mimeType});return l=o.createObjectURL(d),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(d,f){let m=d;t.isImageBitmapLoader===!0&&(m=function(_){const g=new kt(_);g.needsUpdate=!0,d(g)}),t.load(Or.resolveURL(u,r.path),m,void 0,f)})}).then(function(u){return c===!0&&o.revokeObjectURL(l),Zn(u,a),u.userData.mimeType=a.mimeType||vS(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[tt.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[tt.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const l=r.associations.get(a);a=r.extensions[tt.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new Nf,kn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new Lf,kn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(i||r||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Vi}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let a;const o={},l=r.extensions||{},c=[];if(l[tt.KHR_MATERIALS_UNLIT]){const u=i[tt.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,r,t))}else{const u=r.pbrMetallicRoughness||{};if(o.color=new Pe(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],cn),o.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,qt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=on);const h=r.alphaMode||Rl.OPAQUE;if(h===Rl.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===Rl.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==On&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new re(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==On&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==On){const u=r.emissiveFactor;o.emissive=new Pe().setRGB(u[0],u[1],u[2],cn)}return r.emissiveTexture!==void 0&&a!==On&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,qt)),Promise.all(c).then(function(){const u=new a(o);return r.name&&(u.name=r.name),Zn(u,r),t.associations.set(u,{materials:e}),r.extensions&&is(i,u,r),u})}createUniqueName(e){const t=ot.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(o){return n[tt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return Sd(l,o,t)})}const a=[];for(let o=0,l=e.length;o<l;o++){const c=e[o],h=xS(c),u=i[h];if(u)a.push(u.promise);else{let d;c.extensions&&c.extensions[tt.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=Sd(new en,c,t),i[h]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){const h=a[l].material===void 0?mS(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,m=h.length;f<m;f++){const _=h[f],g=a[f];let p;const T=c[f];if(g.mode===Ln.TRIANGLES||g.mode===Ln.TRIANGLE_STRIP||g.mode===Ln.TRIANGLE_FAN||g.mode===void 0)p=r.isSkinnedMesh===!0?new yg(_,T):new lt(_,T),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),g.mode===Ln.TRIANGLE_STRIP?p.geometry=xd(p.geometry,xf):g.mode===Ln.TRIANGLE_FAN&&(p.geometry=xd(p.geometry,Dc));else if(g.mode===Ln.LINES)p=new Cg(_,T);else if(g.mode===Ln.LINE_STRIP)p=new bh(_,T);else if(g.mode===Ln.LINE_LOOP)p=new Ag(_,T);else if(g.mode===Ln.POINTS)p=new Rg(_,T);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(p.geometry.morphAttributes).length>0&&_S(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),Zn(p,r),g.extensions&&is(i,p,g),t.assignFinalMaterial(p),u.push(p)}for(let f=0,m=u.length;f<m;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&is(i,u[0],r),u[0];const d=new Wt;r.extensions&&is(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,m=u.length;f<m;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new an(Ft.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Io(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Zn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),a=i,o=[],l=[];for(let c=0,h=a.length;c<h;c++){const u=a[c];if(u){o.push(u);const d=new He;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Mh(o,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],m=i.samplers[f.sampler],_=f.target,g=_.node,p=i.parameters!==void 0?i.parameters[m.input]:m.input,T=i.parameters!==void 0?i.parameters[m.output]:m.output;_.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",T)),c.push(m),h.push(_))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],m=u[2],_=u[3],g=u[4],p=[];for(let S=0,y=d.length;S<y;S++){const w=d[S],P=f[S],C=m[S],L=_[S],v=g[S];if(w===void 0)continue;w.updateMatrix&&w.updateMatrix();const b=n._createAnimationTracks(w,P,C,L,v);if(b)for(let R=0;R<b.length;R++)p.push(b[R])}const T=new Jr(r,void 0,p);return Zn(T,i),T})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=i.weights.length;l<c;l++)o.morphTargetInfluences[l]=i.weights[l]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=i.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){const h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,yS)});for(let f=0,m=u.length;f<m;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],a=r.name?i.createUniqueName(r.name):"",o=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(r.isBone===!0?h=new If:c.length>1?h=new Wt:c.length===1?h=c[0]:h=new St,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=a),Zn(h,r),r.extensions&&is(n,h,r),r.matrix!==void 0){const u=new He;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){const u=i.associations.get(h);i.associations.set(h,{...u})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new Wt;n.name&&(r.name=i.createUniqueName(n.name)),Zn(r,n),n.extensions&&is(t,r,n);const a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(i.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++)r.add(l[h]);const c=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof kn||d instanceof kt)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){const a=[],o=e.name?e.name:e.uuid,l=[];Ni[r.path]===Ni.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(o);let c;switch(Ni[r.path]){case Ni.weights:c=tr;break;case Ni.rotation:c=nr;break;case Ni.translation:case Ni.scale:c=ir;break;default:n.itemSize===1?c=tr:c=ir;break}const h=i.interpolation!==void 0?pS[i.interpolation]:Gr,u=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){const m=new c(l[d]+"."+Ni[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(m),a.push(m)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Wc(t.constructor),i=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof nr?fS:ip;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function SS(s,e,t){const n=e.attributes,i=new _n;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(i.set(new I(l[0],l[1],l[2]),new I(c[0],c[1],c[2])),o.normalized){const h=Wc(Ys[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const o=new I,l=new I;for(let c=0,h=r.length;c<h;c++){const u=r[c];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,m=d.max;if(f!==void 0&&m!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(m[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(m[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(m[2]))),d.normalized){const _=Wc(Ys[d.componentType]);l.multiplyScalar(_)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}s.boundingBox=i;const a=new oi;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=a}function Sd(s,e,t){const n=e.attributes,i=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){s.setAttribute(o,l)})}for(const a in n){const o=Gc[a]||a.toLowerCase();o in s.attributes||i.push(r(n[a],o))}if(e.indices!==void 0&&!s.index){const a=t.getDependency("accessor",e.indices).then(function(o){s.setIndex(o)});i.push(a)}return nt.workingColorSpace!==cn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${nt.workingColorSpace}" not supported.`),Zn(s,e),SS(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?gS(s,e.targets,t):s})}let at,ds,fs,us,Il,Va,ls,wr;const sp="".trim(),Dh=window.__FLIGHT_SIM_CONFIG__??{},or=(Dh.vworldApiKey??"").trim(),io=(Dh.vworldDomain??"").trim(),Zr=(Dh.mapTilerApiKey??"").trim(),Qr=Zr?`https://api.maptiler.com/tiles/terrain-quantized-mesh-v2/tiles.json?key=${Zr}`:null,bS=Cesium.Rectangle.fromDegrees(124.5,33,132.5,39.5),Br={mapProvider:"initializing",vworld:{configuredDomain:io||null,pageHost:null,pageHostname:null,runtimeDomains:[],scriptCandidates:[],loadedScriptUrl:null,scriptLoaded:!1,scriptGlobalsReady:!1,viewerReady:!1,viewerDetected:!1,callbackFired:!1,mapStartRequested:!1,eligible:!1,requestedStartInKorea:!1,initializationStage:"idle",initialPosition:null,layerName:null,layerActivated:!1,layerCandidates:[],moduleDetected:!1,lastError:null}};typeof window<"u"&&(Tt({vworld:{pageHost:window.location.host??null,pageHostname:window.location.hostname??null}}),window.__FLIGHT_SIM_RUNTIME__=Br);Cesium.Ion.defaultAccessToken=sp;function Tt(s={}){s.mapProvider&&(Br.mapProvider=s.mapProvider),s.vworld&&Object.assign(Br.vworld,s.vworld),typeof window<"u"&&(window.__FLIGHT_SIM_RUNTIME__=Br)}function xo(s={}){const{lon:e,lat:t}=Fh(s);return!!or&&!Qr&&Do(e,t)}function rp(s={}){return Qr?"maptiler-terrain-preferred":or?xo(s)?"vworld-runtime-unavailable":"vworld-outside-korea":"vworld-api-key-missing"}function Do(s,e){return s>=124.5&&s<=132.5&&e>=33&&e<=39.5}function TS(){if(typeof window>"u")return io?[io]:[];const s=[io,window.location.hostname??"",window.location.host??""],e=[...new Set(s.filter(t=>t.length>0))];return Tt({vworld:{runtimeDomains:e}}),e}function wS(){const s=new URL("https://map.vworld.kr/js/webglMapInit.js.do");s.searchParams.set("version","3.0"),s.searchParams.set("apiKey",or);const e=TS().map(n=>{const i=new URL(s.toString());return i.searchParams.set("domain",n),i.toString()});e.push(s.toString());const t=[...new Set(e)];return Tt({vworld:{scriptCandidates:t}}),t}function Fh(s={}){const e=Number.isFinite(s.lon)?s.lon:126.978,t=Number.isFinite(s.lat)?s.lat:37.5665,n=Number.isFinite(s.alt)?Math.max(s.alt,5e3):15e3;return{lon:e,lat:t,alt:n}}function ap(s,{async:e=!0,attributeName:t="data-vworld-src"}={}){return new Promise((n,i)=>{const r=document.querySelector(`script[${t}="${s}"]`);if(r){if(r.dataset.loaded==="true"){n();return}r.addEventListener("load",()=>n(),{once:!0}),r.addEventListener("error",()=>i(new Error(`Failed to load script: ${s}`)),{once:!0});return}const a=document.createElement("script");a.src=s,a.async=e,a.setAttribute(t,s),a.addEventListener("load",()=>{a.dataset.loaded="true",n()},{once:!0}),a.addEventListener("error",()=>i(new Error(`Failed to load script: ${s}`)),{once:!0}),document.head.appendChild(a)})}function ES(s){return new Promise((e,t)=>{const n=document.querySelector(`link[data-vworld-href="${s}"]`);if(n){if(n.dataset.loaded==="true"){e();return}n.addEventListener("load",()=>e(),{once:!0}),n.addEventListener("error",()=>t(new Error(`Failed to load stylesheet: ${s}`)),{once:!0});return}const i=document.createElement("link");i.rel="stylesheet",i.href=s,i.dataset.vworldHref=s,i.addEventListener("load",()=>{i.dataset.loaded="true",e()},{once:!0}),i.addEventListener("error",()=>t(new Error(`Failed to load stylesheet: ${s}`)),{once:!0}),document.head.appendChild(i)})}function CS(s,e){const n=s.join("").trim();if(!n)return Promise.resolve();const i=document.createElement("template");return i.innerHTML=n,Array.from(i.content.childNodes).reduce((a,o)=>a.then(async()=>{if(o.nodeType!==Node.ELEMENT_NODE)return;const l=o,c=l.tagName.toLowerCase();if(c==="script"){const h=l.getAttribute("src");if(!h)return;await ap(new URL(h,e).toString(),{async:!1});return}if(c==="link"){const h=l.getAttribute("href");if(!h)return;await ES(new URL(h,e).toString());return}c==="style"&&document.head.appendChild(l.cloneNode(!0))}),Promise.resolve())}function AS(s){return new Promise((e,t)=>{const n=document.write.bind(document),i=typeof document.writeln=="function"?document.writeln.bind(document):(...c)=>n(...c);let r=Promise.resolve(),a=0;const o=(...c)=>{a+=1,r=r.then(()=>CS(c,s))},l=()=>{const c=a;return r.then(()=>{if(c!==a)return l()})};document.write=(...c)=>{o(...c)},document.writeln=(...c)=>{o(...c,`
`)},ap(s,{async:!1}).then(()=>l()).then(e).catch(t).finally(()=>{document.write=n,document.writeln=i})})}function RS(s={}){const e=Fh(s);return Tt({vworld:{eligible:xo(e),requestedStartInKorea:Do(e.lon,e.lat),initialPosition:e,moduleDetected:!!window.Module,initializationStage:"script-loading"}}),xo(s)?window.vw?.Map&&window.ws3d?.viewer?(Tt({vworld:{scriptLoaded:!0,scriptGlobalsReady:!0,viewerDetected:!0,initializationStage:"viewer-ready",lastError:null}}),Promise.resolve(!0)):(Il||(Il=wS().reduce((n,i)=>n.then(async r=>{if(r||window.vw?.Map)return!0;try{await AS(i);const a=!!window.vw?.Map;return Tt({vworld:{loadedScriptUrl:i,scriptLoaded:!0,scriptGlobalsReady:a,moduleDetected:!!window.Module,initializationStage:a?"script-ready":"script-loaded-without-globals",lastError:a?null:"vworld-api-globals-missing"}}),a}catch(a){return Tt({vworld:{scriptLoaded:!1,scriptGlobalsReady:!1,initializationStage:"script-load-failed",lastError:`script-load: ${i}`}}),console.warn("Failed to load VWorld WebGL 3.0 script candidate.",{scriptUrl:i,error:a}),!1}}),Promise.resolve(!1)).catch(n=>(Tt({vworld:{initializationStage:"script-load-failed",lastError:"script-load-failed"}}),console.warn("Failed to load VWorld WebGL 3.0 script.",n),!1))),Il):(Tt({vworld:{initializationStage:"skipped",lastError:rp(s)}}),Promise.resolve(!1))}function op(){return Zr?new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({url:`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}@2x.jpg?key=${Zr}`,credit:"MapTiler",tileWidth:512,tileHeight:512,hasAlphaChannel:!1})):new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({url:"https://tile.openstreetmap.org/"}))}function lp(){return new Cesium.EllipsoidTerrainProvider}function PS(){return Qr?new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromUrl(Qr,{requestVertexNormals:!0})):null}function IS(){return Qr?{terrain:PS()}:sp?{terrain:Cesium.Terrain.fromWorldTerrain()}:{terrainProvider:lp()}}function LS(s,e){if(!s||!e?.errorEvent)return;let t=!1;const n=i=>{t||(t=!0,console.warn("Cesium World Terrain is unavailable. Falling back to ellipsoid terrain.",i),s.terrainProvider=lp(),s.scene?.requestRender?.())};e.errorEvent.addEventListener(i=>{n(i)}),e.readyEvent?.addEventListener(i=>{i?.errorEvent?.addEventListener(r=>{n(r)})})}function bd(s,e){return new Cesium.UrlTemplateImageryProvider({url:`https://api.vworld.kr/req/wmts/1.0.0/${or}/${s}/{z}/{y}/{x}.${e}`,credit:"VWorld",minimumLevel:6,maximumLevel:19,rectangle:bS})}function cp(s){Zr||!or||!s?.scene?.imageryLayers||(s.scene.imageryLayers.addImageryProvider(bd("Satellite","jpeg")),s.scene.imageryLayers.addImageryProvider(bd("Hybrid","png")))}function Uh(s,{main:e=!1}={}){if(!s)return;s.scene.requestRenderMode=!1,s.scene.maximumRenderTimeChange=0,s.scene.globe.maximumScreenSpaceError=2,s.scene.globe.tileCacheSize=2048,s.scene.globe.preloadAncestors=!0,s.scene.globe.preloadSiblings=!0,s.scene.globe.loadingDescendantLimit=20,s.scene.globe.skipLevelOfDetail=!0,s.scene.globe.baseScreenSpaceError=1024,s.scene.globe.skipScreenSpaceErrorFactor=16,s.scene.globe.skipLevels=1,s.scene.globe.depthTestAgainstTerrain=!0,s.resolutionScale=e?.75:1;const t=s.scene.skyAtmosphere??s.scene.atmosphere,n=s.scene.screenSpaceCameraController;n.maximumZoomDistance=25e6,e||(s.scene.globe.enableLighting=!1,s.scene.globe.showGroundAtmosphere=!1,s.scene.globe.baseColor=Cesium.Color.BLACK,s.scene.fog&&(s.scene.fog.enabled=!1),s.scene.highDynamicRange=!1,s.scene.postProcessStages?.fxaa&&(s.scene.postProcessStages.fxaa.enabled=!1),t&&"show"in t&&(t.show=!1)),e&&(s.scene.globe.enableLighting=!0,s.scene.highDynamicRange=!1,s.scene.postProcessStages?.fxaa&&(s.scene.postProcessStages.fxaa.enabled=!0),s.scene.fog&&(s.scene.fog.enabled=!0,s.scene.fog.density=1e-4),t&&"show"in t&&(t.show=!0)),s._cesiumWidget?._creditContainer&&(s._cesiumWidget._creditContainer.style.display="none")}function Td(s){const e=new Cesium.Viewer(s,{baseLayer:op(),terrainProvider:new Cesium.EllipsoidTerrainProvider,timeline:!1,animation:!1,baseLayerPicker:!1,geocoder:!1,homeButton:!1,infoBox:!1,sceneModePicker:!1,selectionIndicator:!1,navigationHelpButton:!1,fullscreenButton:!1,shouldAnimate:!1,skyBox:!1,skyAtmosphere:!1,contextOptions:{webgl:{preserveDrawingBuffer:!0}}});return Uh(e,{main:!1}),cp(e),e}function hp(s="main"){return s==="pause"?(fs||(fs=Td("pauseMinimapCesium")),fs):(ds||(ds=Td("minimapCesium")),ds)}function NS(){const s=IS(),e=new Cesium.Viewer("cesiumContainer",{baseLayer:op(),...s,timeline:!1,animation:!1,baseLayerPicker:!1,geocoder:!1,homeButton:!1,infoBox:!1,sceneModePicker:!1,selectionIndicator:!1,navigationHelpButton:!1,fullscreenButton:!1,shouldAnimate:!1});return s.terrain&&LS(e,s.terrain),Uh(e,{main:!0}),cp(e),e}function DS(s){const e=s?.terrainProvider??s?.scene?.terrainProvider;return!!e&&!(e instanceof Cesium.EllipsoidTerrainProvider)}async function FS(){return!at||ls||wr?wr??ls:(wr=Cesium.Cesium3DTileset.fromUrl("https://xdworld.vworld.kr/TDServer/services/facility_LOD4/vworld_3d_facility.json",{maximumScreenSpaceError:24,dynamicScreenSpaceError:!0,skipLevelOfDetail:!0,preferLeaves:!0}).then(s=>(ls=at.scene.primitives.add(s),ls.show=!1,ls)).catch(s=>(console.warn("Failed to load fallback VWorld Korea 3D tileset.",s),null)).finally(()=>{wr=null}),wr)}function Ll(s){Uh(s,{main:!0});const e=s.scene.screenSpaceCameraController;e.enableRotate=!1,e.enableTranslate=!1,e.enableZoom=!1,e.enableTilt=!1,e.enableLook=!1}function US(s){try{return window.Module?.getTileLayerList?.()?.nameAtLayer?.(s)??null}catch{return null}}function OS(s,e){return s?.getLayerElement?.(e)??s?.getElementById?.(e)??US(e)}function up(s){if(!us&&!window.ws3d?.viewer?.map)return null;Tt({vworld:{layerCandidates:s}});const e=window.ws3d?.viewer?.map??us;for(const t of s)try{const n=OS(e,t);if(n)return{label:t,element:n}}catch(n){console.warn("Failed to query a VWorld 3D layer candidate.",n)}return null}function dp(s,{trackRuntimeState:e=!0}={}){if(!s?.element)return!1;const{element:t,label:n}=s,i=[()=>t.show?.(),()=>t.setVisible?.(!0),()=>t.setEnable?.(!0),()=>t.setActive?.(!0),()=>{"visible"in t&&(t.visible=!0)},()=>{"show"in t&&typeof t.show!="function"&&(t.show=!0)}];let r=!1;for(const o of i)try{o(),r=!0}catch{}if("simple_real3d"in t)try{t.simple_real3d=!1,r=!0}catch{}if("lod_object_detail_ratio"in t)try{t.lod_object_detail_ratio=1}catch{}const a=t._tileset;return a&&(a.show=!0,a.maximumScreenSpaceError=6,a.dynamicScreenSpaceError=!1,a.skipLevelOfDetail=!1,a.preferLeaves=!0,r=!0),e&&Tt({vworld:{layerName:n,layerActivated:r}}),r}function BS(s){const t=(window.ws3d?.viewer?.map??us)?.getLayerElement?.(s);if(t)try{t.hide?.()}catch{}}function wd(s){s?.scene&&(s.scene.highDynamicRange=!1,s.scene.globe.depthTestAgainstTerrain=!0,s.scene.globe.maximumScreenSpaceError=1.5,window.ws3d?.viewer?.setting&&(window.ws3d.viewer.setting.useSunLighting=!0))}function Ed(s){const e=up(s);return e?dp(e,{trackRuntimeState:!1}):!1}function Nl(){const s=up(["facility_build","3차원 입체모형(LoD4)","3차원 입체모형(Lod4)","facility_build_all","facility_build_lod3","facility_build_lod2","facility_build_lod1","facility_LOD4","lod4","LoD4","3차원 입체모형"]);let e=!1;s?e=dp(s):Tt({vworld:{layerName:null,layerActivated:!1,lastError:"building-layer-not-found"}}),Ed(["poi_base","명칭(한글)"]),Ed(["hybrid_bound","행정경계"]),BS("명칭(영문)"),Tt({vworld:{initializationStage:e?"layer-ready":s?"layer-found":"layer-missing"}})}async function kS(s){return!await RS(s)||!window.vw?.Map?(Tt({vworld:{viewerReady:!1,lastError:Br.vworld.lastError??rp(s)}}),null):window.ws3d?.viewer&&us?(at=window.ws3d.viewer,Ll(at),Nl(),Tt({mapProvider:"vworld-webgl",vworld:{viewerReady:!0,viewerDetected:!0,lastError:null}}),at):(Va||(Tt({vworld:{initializationStage:"viewer-waiting",mapStartRequested:!1,callbackFired:!1,viewerDetected:!1}}),Va=new Promise((t,n)=>{try{const i=window.vw,r=window.ws3d;if(!i?.Map||!i.CameraPosition||!i.CoordZ||!i.Direction){n(new Error("VWorld WebGL API globals are unavailable."));return}const a=i.ws3dInitCallBack,o=new i.CameraPosition(new i.CoordZ(s.lon,s.lat,s.alt),new i.Direction(0,-90,0));let l=!1;i.ws3dInitCallBack=function(){if(typeof a=="function")try{a()}catch(c){console.warn("Previous VWorld init callback failed.",c)}if(!l){l=!0,Tt({vworld:{callbackFired:!0,initializationStage:"callback-fired"}});try{if(at=window.ws3d?.viewer??r?.viewer,!at){n(new Error("VWorld viewer is unavailable after initialization."));return}Ll(at),wd(at),Nl(),Tt({mapProvider:"vworld-webgl",vworld:{viewerReady:!0,viewerDetected:!0,lastError:null}}),t(at)}catch(c){n(c)}}},us=new i.Map,us.setOption({mapId:"cesiumContainer",initPosition:o,logo:!1,navigation:!1}),Tt({vworld:{mapStartRequested:!0,initializationStage:"map-started"}}),us.start(),window.setTimeout(()=>{if(!l){if(at=window.ws3d?.viewer??r?.viewer,at){l=!0,Ll(at),wd(at),Nl(),Tt({mapProvider:"vworld-webgl",vworld:{viewerReady:!0,viewerDetected:!0,lastError:null}}),t(at);return}n(new Error("Timed out while waiting for the VWorld viewer."))}},12e3)}catch(i){n(i)}}).catch(t=>(Tt({vworld:{viewerReady:!1,initializationStage:"viewer-init-failed",lastError:t instanceof Error?t.message:"vworld-init-failed"}}),console.warn("Failed to initialize VWorld WebGL map.",t),null)).finally(()=>{Va=null})),Va)}function vo(){return!!(window.ws3d?.viewer&&at===window.ws3d.viewer)}function zS(s,e){if(!at||vo())return;if(!(!!or&&Number.isFinite(s)&&Number.isFinite(e)&&Do(s,e)&&DS(at))){ls&&(ls.show=!1),at.scene.requestRender();return}FS().then(i=>{!i||!at||vo()||(i.show=!0,i.maximumScreenSpaceError=16,i.dynamicScreenSpaceError=!0,i.skipLevelOfDetail=!0,i.preferLeaves=!0,at.scene.requestRender())})}async function VS(s={}){const e=Fh(s);return Tt({vworld:{eligible:xo(e),requestedStartInKorea:Do(e.lon,e.lat),initialPosition:e,moduleDetected:!!window.Module}}),at=await kS(e)??NS(),Tt({mapProvider:vo()?"vworld-webgl":"cesium-fallback",vworld:{viewerReady:vo()}}),ia(!1),at}function lr(s){!at||!ds||!fs||[at,ds,fs].forEach(e=>{e.scene.requestRenderMode=!s,e.scene.maximumRenderTimeChange=s?0:1/0})}function ia(s){if(!at)return;const e=at.scene.screenSpaceCameraController;e.enableRotate=s,e.enableTranslate=s,e.enableZoom=s,e.enableTilt=s,e.enableLook=s}function Oh(s,e,t,n,i,r){at&&(zS(s,e),at.camera.setView({destination:Cesium.Cartesian3.fromDegrees(s,e,t),orientation:{heading:Cesium.Math.toRadians(n),pitch:Cesium.Math.toRadians(i),roll:Cesium.Math.toRadians(r)}}),at.scene.requestRender())}function HS(s,e,t,n){const i=ds??hp("main");i&&(i.canvas.width===0||i.canvas.height===0||(i.camera.setView({destination:Cesium.Cartesian3.fromDegrees(s,e,t),orientation:{heading:Cesium.Math.toRadians(n),pitch:Cesium.Math.toRadians(-90),roll:0}}),i.scene.requestRender()))}function GS(s,e,t,n){const i=fs??hp("pause");i&&(i.canvas.width===0||i.canvas.height===0||(i.camera.setView({destination:Cesium.Cartesian3.fromDegrees(s,e,t),orientation:{heading:Cesium.Math.toRadians(n),pitch:Cesium.Math.toRadians(-90),roll:0}}),i.scene.requestRender()))}function Xt(){return at}function WS(){return ds}function XS(){return fs}class qS{constructor(e={}){Object.assign(this,{speed:100,maxSpeed:1e3,minSpeed:100,throttle:.5,enginePower:1.2,drag:.005,liftFactor:.002,gravity:9.8,pitch:0,roll:0,heading:0,pitchRate:1.2,rollRate:2.5,yawRate:.5,isBoosting:!1,boostTimeRemaining:0,boostDuration:2.5,boostMultiplier:1.5,boostRotations:2,boostPressed:!1},e),this.quaternion=new Bt}boost(){this.boostTimeRemaining<=0&&(this.isBoosting=!0,this.boostTimeRemaining=this.boostDuration)}reset(e,t,n,i,r,a){this.heading=i||0,this.pitch=r||0,this.roll=a||0;const o=new Kt(Ft.degToRad(this.pitch),Ft.degToRad(this.heading),Ft.degToRad(this.roll),"YXZ");this.quaternion.setFromEuler(o)}update(e,t){this.boostTimeRemaining>0&&(this.boostTimeRemaining-=t,this.boostTimeRemaining<=0&&(this.isBoosting=!1,this.boostTimeRemaining=0)),e.boost?(!this.boostPressed&&!this.isBoosting&&this.boost(),this.boostPressed=!0):this.boostPressed=!1,this.throttle=e.throttle;let n=this.minSpeed+this.throttle*(this.maxSpeed-this.minSpeed);this.isBoosting&&(n=this.maxSpeed*this.boostMultiplier),this.speed+=(n-this.speed)*t*(this.isBoosting?4:2);const i=this.speed>this.minSpeed?1:this.speed/this.minSpeed,r=e.pitch*this.pitchRate*t*i,a=e.roll*this.rollRate*t*i,o=e.yaw*this.yawRate*t*i,l=new Bt().setFromAxisAngle(new I(1,0,0),r),c=new Bt().setFromAxisAngle(new I(0,0,1),a),h=new Bt().setFromAxisAngle(new I(0,1,0),o);this.quaternion.multiply(h),this.quaternion.multiply(l),this.quaternion.multiply(c),this.quaternion.normalize();const u=new Kt().setFromQuaternion(this.quaternion,"YXZ");return this.heading=Ft.radToDeg(u.y),this.pitch=Ft.radToDeg(u.x),this.roll=Ft.radToDeg(u.z),{speed:this.speed,pitch:this.pitch,roll:this.roll,heading:this.heading,isBoosting:this.isBoosting,boostTimeRemaining:this.boostTimeRemaining,boostDuration:this.boostDuration,boostRotations:this.boostRotations}}}class YS{constructor(e="jet"){this.keys={},this.prevKeys={},this.mode=e,window.addEventListener("keydown",t=>this.keys[t.key.toLowerCase()]=!0),window.addEventListener("keyup",t=>this.keys[t.key.toLowerCase()]=!1),this.mouseDragging=!1,this.mouseDeltaX=0,this.mouseDeltaY=0,this.lastMouseX=0,this.lastMouseY=0,window.addEventListener("mousedown",t=>{t.button===0&&(this.mouseDragging=!0,this.lastMouseX=t.clientX,this.lastMouseY=t.clientY)}),window.addEventListener("mousemove",t=>{this.mouseDragging&&(this.mouseDeltaX+=t.clientX-this.lastMouseX,this.mouseDeltaY+=t.clientY-this.lastMouseY,this.lastMouseX=t.clientX,this.lastMouseY=t.clientY)}),window.addEventListener("mouseup",t=>{t.button===0&&(this.mouseDragging=!1)}),this.input={throttle:0,forward:0,vertical:0,strafe:0,pitch:0,roll:0,yaw:0,boost:!1,cameraYaw:0,cameraPitch:0,isDragging:!1,fire:!1,fireFlare:!1,weaponIndex:-1,toggleWeapon:!1,cycleMissileProfile:!1,cycleCameraMode:!1},this.sensitivity=.2}setSensitivity(e){this.sensitivity=e}setMode(e){this.mode=e,this.reset()}update(){if(this.input.isDragging=this.mouseDragging,this.input.fire=!!this.keys.enter||!!this.keys.f,this.input.fireFlare=!!this.keys.v,this.input.toggleWeapon=!!this.keys.q&&!this.prevKeys.q,this.input.cycleMissileProfile=!!this.keys.r&&!this.prevKeys.r,this.input.cycleCameraMode=!!this.keys.c&&!this.prevKeys.c,this.input.weaponIndex=-1,this.keys[1]&&(this.input.weaponIndex=0),this.keys[2]&&(this.input.weaponIndex=1),this.mode==="drone")this.input.boost=!1,this.input.forward=this.lerp(this.input.forward,this.keys.w?1:this.keys.s?-1:0,.14),this.input.vertical=this.lerp(this.input.vertical,this.keys.arrowup?1:this.keys.arrowdown?-1:0,.14),this.input.strafe=this.lerp(this.input.strafe,this.keys.arrowright?1:this.keys.arrowleft?-1:0,.14),this.input.throttle=Math.max(Math.abs(this.input.forward),Math.abs(this.input.vertical),Math.abs(this.input.strafe)),this.input.pitch=this.input.forward,this.input.roll=this.input.strafe;else{this.input.boost=!!this.keys[" "],this.input.forward=0,this.input.vertical=0,this.input.strafe=0;const t=.5;this.keys.w?this.input.throttle=Math.min(1,this.input.throttle+t*.016):this.keys.s&&(this.input.throttle=Math.max(0,this.input.throttle-t*.016));const n=this.keys.arrowup?-1:this.keys.arrowdown?1:0;this.input.pitch=this.lerp(this.input.pitch,n,.1);const i=this.keys.arrowleft?-1:this.keys.arrowright?1:0;this.input.roll=this.lerp(this.input.roll,i,.1)}const e=this.keys.a?-1:this.keys.d?1:0;return this.input.yaw=this.lerp(this.input.yaw,e,.1),this.mouseDragging?(this.input.cameraYaw+=this.mouseDeltaX*this.sensitivity,this.input.cameraPitch-=this.mouseDeltaY*this.sensitivity,this.input.cameraPitch=Math.max(-85,Math.min(85,this.input.cameraPitch)),this.mouseDeltaX=0,this.mouseDeltaY=0):(this.input.cameraYaw=this.lerp(this.input.cameraYaw,0,.1),this.input.cameraPitch=this.lerp(this.input.cameraPitch,0,.1)),this.prevKeys={...this.keys},this.input}reset(){this.input.cameraYaw=0,this.input.cameraPitch=0,this.mouseDragging=!1,this.mouseDeltaX=0,this.mouseDeltaY=0,this.input.throttle=0,this.input.forward=0,this.input.vertical=0,this.input.strafe=0,this.input.pitch=0,this.input.roll=0,this.input.yaw=0}lerp(e,t,n){return(1-n)*e+n*t}}class jS{constructor(){this.heading=0,this.pitch=0,this.roll=0,this.forwardSpeed=0,this.lateralSpeed=0,this.verticalSpeed=0,this.maxForwardSpeed=55,this.maxReverseSpeed=18,this.maxLateralSpeed=28,this.maxVerticalSpeed=24,this.yawRate=65,this.forwardResponse=2.8,this.lateralResponse=3.2,this.verticalResponse=3.4,this.attitudeResponse=4.5}reset(e,t,n,i,r,a){this.heading=i||0,this.pitch=r||0,this.roll=a||0,this.forwardSpeed=0,this.lateralSpeed=0,this.verticalSpeed=0}update(e,t){const n=(o,l,c)=>o+(l-o)*Math.min(1,t*c),i=e.forward>=0?e.forward*this.maxForwardSpeed:e.forward*this.maxReverseSpeed,r=e.strafe*this.maxLateralSpeed,a=e.vertical*this.maxVerticalSpeed;return this.forwardSpeed=n(this.forwardSpeed,i,this.forwardResponse),this.lateralSpeed=n(this.lateralSpeed,r,this.lateralResponse),this.verticalSpeed=n(this.verticalSpeed,a,this.verticalResponse),this.heading+=e.yaw*this.yawRate*t,this.pitch=n(this.pitch,-e.forward*14,this.attitudeResponse),this.roll=n(this.roll,-e.strafe*16-e.yaw*6,this.attitudeResponse),{speed:Math.sqrt(this.forwardSpeed**2+this.lateralSpeed**2+this.verticalSpeed**2),pitch:this.pitch,roll:this.roll,heading:this.heading,forwardSpeed:this.forwardSpeed,lateralSpeed:this.lateralSpeed,verticalSpeed:this.verticalSpeed,isBoosting:!1,boostTimeRemaining:0,boostDuration:0,boostRotations:0}}}const so={basePosition:{x:0,y:-.8,z:-2.75},baseRotation:{x:0,y:0,z:0},scale:.2},fp={name:"flight_mode",loop:"once"},KS={mode:"jet",iconPath:"assets/images/f-15.svg",spawnAltitudeOffset:1500,initialAltitude:1e3,enableWeapons:!0,enableNpc:!0,enableJetFlames:!0,enableJetAudio:!0,enableBoost:!0,enableGpws:!0,crashClearance:5,visual:so,animation:fp,loadingLabel:"전투기 모델을 불러오는 중..."};function Fo(s){return{...KS,...s,visual:{...so,...s.visual??{},basePosition:{...so.basePosition,...s.visual?.basePosition??{}},baseRotation:{...so.baseRotation,...s.visual?.baseRotation??{}}},animation:{...fp,...s.animation??{}}}}const Uo=["/3d-bundles/aircraft/models/f-15.glb","/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb","/3d-bundles/aircraft/models/low_poly_f-15.glb"],$S=["/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",...Uo],Xc=Fo({id:"kf21",label:"KF-21 Boramae",hudLabel:"KF-21",modelCandidates:$S,initialSpeed:108,visual:{baseRotation:{y:Math.PI}},physics:{minSpeed:112,maxSpeed:1060,pitchRate:1.38,rollRate:3.05,yawRate:.6,boostDuration:2.7,boostMultiplier:1.46}}),yo=Fo({id:"f15",label:"F-15C Eagle",hudLabel:"F-15C",modelCandidates:Uo,initialSpeed:110,physics:{minSpeed:120,maxSpeed:1100,pitchRate:1.2,rollRate:2.6,yawRate:.55,boostDuration:2.8,boostMultiplier:1.5}}),qc=Fo({id:"f16",label:"F-16 Fighting Falcon",hudLabel:"F-16",modelCandidates:Uo,initialSpeed:105,physics:{minSpeed:105,maxSpeed:1025,pitchRate:1.45,rollRate:3.35,yawRate:.62,boostDuration:2.4,boostMultiplier:1.48}}),Yc=Fo({id:"f35",label:"F-35A Lightning II",hudLabel:"F-35A",modelCandidates:Uo,initialSpeed:100,physics:{minSpeed:115,maxSpeed:970,pitchRate:1.3,rollRate:2.9,yawRate:.58,boostDuration:3,boostMultiplier:1.42}}),JS=[{id:yo.id,label:yo.label},{id:Xc.id,label:Xc.label},{id:qc.id,label:qc.label},{id:Yc.id,label:Yc.label}],Cd={jet:yo,kf21:Xc,f15:yo,f16:qc,f35:Yc,drone:{id:"drone",label:"드론",hudLabel:"드론",mode:"drone",modelCandidates:["/3d-bundles/drone/models/animated_drone.glb","/3d-bundles/drone/models/drone.glb"],iconPath:null,spawnAltitudeOffset:180,initialAltitude:180,initialSpeed:0,enableWeapons:!1,enableNpc:!1,enableJetFlames:!1,enableJetAudio:!1,enableBoost:!1,enableGpws:!1,crashClearance:2,visual:{basePosition:{x:0,y:-.45,z:-1.9},scale:.85},animation:{name:null,loop:"repeat"},loadingLabel:"드론 모델을 불러오는 중..."}};function ea(s){return Cd[s]??Cd.jet}function Hi(s,e,t,n,i,r){const a=Cesium.Math.toRadians(n),o=Cesium.Math.toRadians(i),l=6371e3,c=r*Math.cos(a)*Math.cos(o)/l,h=r*Math.sin(a)*Math.cos(o)/(l*Math.cos(Cesium.Math.toRadians(e))),u=r*Math.sin(o);return{lon:s+Cesium.Math.toDegrees(h),lat:e+Cesium.Math.toDegrees(c),alt:t+u}}function Bh(s,e,t,n,i,r,a=0){const o=Cesium.Math.toRadians(n),l=Cesium.Math.toRadians(e),c=6371e3,h=Math.cos(o)*i-Math.sin(o)*r,u=Math.sin(o)*i+Math.cos(o)*r,d=h/c,f=u/(c*Math.cos(l));return{lon:s+Cesium.Math.toDegrees(f),lat:e+Cesium.Math.toDegrees(d),alt:t+a}}async function pp(s,e){try{const n=await(await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e}&lon=${s}&zoom=5&addressdetails=1`)).json();if(n&&n.address){const i=n.address,r=i.state||i.region||i.province,a=i.country;if(r&&a)return`${r}, ${a}`.toUpperCase();if(a)return a.toUpperCase()}}catch(t){console.error("Reverse geocoding error:",t)}return null}function mp(s,e,t,n){const r=e*Math.PI/180,a=n*Math.PI/180,o=(n-e)*Math.PI/180,l=(t-s)*Math.PI/180,c=Math.sin(o/2)*Math.sin(o/2)+Math.cos(r)*Math.cos(a)*Math.sin(l/2)*Math.sin(l/2);return 6371e3*(2*Math.atan2(Math.sqrt(c),Math.sqrt(1-c)))}const dn="#79e8ff",Ad="rgba(121, 232, 255, 0.35)",ZS="rgba(121, 232, 255, 0.2)",Dl="rgba(121, 232, 255, 0.75)",QS="#ffd79a";class eb{constructor(){this.speedElem=document.getElementById("speed"),this.altElem=document.getElementById("altitude"),this.timeElem=document.getElementById("time"),this.scoreElem=document.getElementById("score"),this.fpsElem=document.getElementById("fps"),this.localDateTimeElem=document.getElementById("local-datetime"),this.coordsElem=document.getElementById("coords"),this.minimapCanvas=document.getElementById("minimap"),this.miniCtx=this.minimapCanvas.getContext("2d"),this.pauseMinimapCanvas=document.getElementById("pauseMinimap"),this.pauseMinimapCanvas&&(this.pauseMiniCtx=this.pauseMinimapCanvas.getContext("2d")),this.pauseRegionElem=document.getElementById("pause-region"),this.pauseLatElem=document.getElementById("pause-lat"),this.pauseLonElem=document.getElementById("pause-lon"),this.pauseAltElem=document.getElementById("pause-alt"),this.pauseTimeElem=document.getElementById("pause-time"),this.uiContainer=document.getElementById("uiContainer"),this.compassTape=document.getElementById("compass-tape"),this.headingDisplay=document.getElementById("heading-display"),this.regionNotif=document.getElementById("region-notification"),this.regionNameElem=document.getElementById("region-name"),this.regionTimeout=null,this.pullUpElem=document.getElementById("pull-up-warning"),this.killNotifContainer=document.getElementById("kill-notification-container"),this.killTextElem=document.getElementById("kill-text"),this.killScoreElem=document.getElementById("kill-score"),this.killTimeout=null,this.weaponElems={gun:document.getElementById("weapon-gun"),missile:document.getElementById("weapon-missile"),flare:document.getElementById("weapon-flare")},this.weaponAmmoElems={gun:this.weaponElems.gun.querySelector(".weapon-ammo"),missile:this.weaponElems.missile.querySelector(".weapon-ammo"),flare:this.weaponElems.flare.querySelector(".weapon-ammo")},this.weaponProgressElems={gun:this.weaponElems.gun.querySelector(".weapon-progress"),missile:this.weaponElems.missile.querySelector(".weapon-progress"),flare:this.weaponElems.flare.querySelector(".weapon-progress")},this.missileSubtitleElem=this.weaponElems.missile.querySelector(".weapon-subtitle"),this.cameraModeElem=document.getElementById("camera-mode-indicator"),this.missileProfileElem=document.getElementById("missile-profile-indicator"),this.vignette=document.getElementById("transition-vignette"),this.startTime=Date.now(),this.smoothedPitch=0,this.smoothedRoll=0,this.smoothedHeading=0,this.smoothedThrottle=0,this.smoothedYaw=0,this.smoothedBoostScale=1,this.currentShakeX=0,this.currentShakeY=0,this.minimapRange=1,this.showHorizonLines=!1,this.npcMarkers=new Map,this.npcContainer=document.createElement("div"),this.npcContainer.id="npc-markers-layer",this.npcContainer.style.cssText="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:15;",this.uiContainer.appendChild(this.npcContainer),this.createHorizon(),this.createMissileCrosshair(),this.createCompass(),this.resizeMinimap(),window.addEventListener("resize",()=>this.resizeMinimap())}createMissileCrosshair(){if(document.getElementById("missile-crosshair"))return;const e=document.createElement("div");e.id="missile-crosshair",e.style.cssText=`
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 220px;
			height: 220px;
			display: none;
		`;const t=document.createElement("div");t.style.cssText=`
			position:absolute; left:50%; top:50%; width:76px; height:76px; transform:translate(-50%,-50%);
			border-radius:50%;
			border:2px solid ${dn};
		`;const n=document.createElement("div");n.style.cssText=`position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:10px; height:10px; border-radius:50%; background:${dn};`;const i=(u,d,f,m,_)=>{const g=document.createElement("div");return g.style.cssText=`position:absolute; left:${u}; top:${d}; width:${f}; height:${m}; background:${dn}; transform:${_};`,g},r=48,a=18,o=i("calc(50% - "+r+"px - "+a/2+"px)","50%","18px","2px","translateY(-50%)"),l=i("calc(50% + "+r+"px - "+a/2+"px)","50%","18px","2px","translateY(-50%)"),c=i("50%","calc(50% - "+r+"px - "+a/2+"px)","2px",a+"px","translateX(-50%)");e.appendChild(t),e.appendChild(n),e.appendChild(c),e.appendChild(o),e.appendChild(l);const h=document.getElementById("horizon-container");h?h.appendChild(e):this.uiContainer.appendChild(e),this.missileCrosshair=e}showMissileCrosshair(e){if(!this.missileCrosshair)return;const t=document.getElementById("normal-crosshair");e?(t&&(t.style.display="none"),this.missileCrosshair.style.display="block"):(this.missileCrosshair.style.display="none",t&&(t.style.display="flex"))}createCompass(){if(!this.compassTape)return;const e=5,t=4;this.compassTape.innerHTML="";for(let n=-360;n<=720;n+=e){const i=document.createElement("div");i.className="compass-tick";const r=n%10===0;if(i.style.left=`${(n+360)*t}px`,i.style.height=r?"10px":"5px",r){const a=document.createElement("div");a.className="compass-label",a.style.left=`${(n+360)*t}px`;let o=n%360;o<0&&(o+=360);let l=Math.round(o).toString().padStart(3,"0");Math.round(o)===0||Math.round(o)===360?l="북":Math.round(o)===90?l="동":Math.round(o)===180?l="남":Math.round(o)===270&&(l="서"),a.innerText=l,this.compassTape.appendChild(a)}this.compassTape.appendChild(i)}}resetTime(){this.startTime=Date.now()}setMinimapRange(e){this.minimapRange=e}setShowHorizonLines(e){this.showHorizonLines=e;const t=document.getElementById("pitch-lines");t&&(t.style.display=e?"block":"none")}showKillNotification(e,t){if(this.killTimeout&&clearTimeout(this.killTimeout),this.killNotifContainer){this.killNotifContainer.classList.remove("hidden"),this.killNotifContainer.classList.remove("kill-notification-exit");const n=`${e} 격추`,i="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";let r=0;this.glitchInterval&&clearInterval(this.glitchInterval),this.glitchInterval=setInterval(()=>{if(this.killTextElem){const a=Math.floor(r),o=n.split("").map((c,h)=>h<a?n[h]:h===a?i[Math.floor(Math.random()*i.length)]:"").join(""),l=a<n.length?Math.random()>.5?"_":" ":"";this.killTextElem.innerText=o+l}r>=n.length&&(this.killTextElem&&(this.killTextElem.innerText=n),clearInterval(this.glitchInterval)),r+=1},40),this.killScoreElem&&(this.killScoreElem.innerText=`+${t}`),this.killNotifContainer.style.animation="none",this.killNotifContainer.offsetHeight,this.killNotifContainer.style.animation=null,this.killTimeout=setTimeout(()=>{this.killNotifContainer.classList.add("kill-notification-exit"),setTimeout(()=>{this.killNotifContainer.classList.add("hidden"),this.killNotifContainer.classList.remove("kill-notification-exit")},500),this.glitchInterval&&clearInterval(this.glitchInterval)},3e3)}}showRegion(e){this.regionTimeout&&clearTimeout(this.regionTimeout),this.regionNameElem.innerText=e,this.regionNotif.classList.remove("hidden"),this.regionNotif.classList.remove("region-exit"),this.regionTimeout=setTimeout(()=>{this.regionNotif.classList.add("region-exit"),this.regionTimeout=setTimeout(()=>{this.regionNotif.classList.add("hidden"),this.regionTimeout=null},1e3)},4e3)}setPullUpWarning(e){this.pullUpElem&&(e?this.pullUpElem.classList.remove("hidden"):this.pullUpElem.classList.add("hidden"))}resizeMinimap(){requestAnimationFrame(()=>{this.minimapCanvas.width=this.minimapCanvas.offsetWidth,this.minimapCanvas.height=this.minimapCanvas.offsetHeight,this.pauseMinimapCanvas&&(this.pauseMinimapCanvas.width=this.pauseMinimapCanvas.offsetWidth,this.pauseMinimapCanvas.height=this.pauseMinimapCanvas.offsetHeight);const e=WS();e&&e.resize();const t=XS();t&&t.resize()})}createHorizon(){if(!document.getElementById("horizon-container")){const e=document.getElementById("uiContainer"),t=document.createElement("div");t.id="horizon-container",t.style.cssText=`
				position: absolute;
				top: 50%;
				left: 50%;
				width: 600px;
				height: 600px;
				transform: translate(-50%, -50%);
				pointer-events: none;
				overflow: hidden;
			`;const n=document.createElement("div");n.id="normal-crosshair",n.style.cssText="position:absolute; top:50%; left:50%; width:120px; height:48px; transform:translate(-50%,-50%); pointer-events:none;";const i=document.createElement("div");i.style.cssText=`position:absolute; left:50%; top:50%; width:12px; height:12px; transform:translate(-50%,-50%); border-radius:50%; border:2px solid ${dn}; background:transparent;`;const r=document.createElement("div");r.style.cssText=`position:absolute; top:50%; left:calc(50% - 6px - 20px); width:20px; height:2px; transform:translateY(-50%); background:${dn};`;const a=document.createElement("div");a.style.cssText=`position:absolute; top:50%; left:calc(50% + 6px); width:20px; height:2px; transform:translateY(-50%); background:${dn};`;const o=document.createElement("div");o.style.cssText=`position:absolute; left:50%; top:calc(50% - 6px - 12px); width:2px; height:12px; transform:translateX(-50%); background:${dn};`,n.appendChild(r),n.appendChild(a),n.appendChild(i),n.appendChild(o),t.appendChild(n);const l=document.createElement("div");l.id="pitch-lines",l.style.cssText=`
				position: absolute;
				width: 100%;
				height: 100%;
			`;for(let c=-90;c<=90;c+=10){if(c===0)continue;const h=document.createElement("div");h.style.cssText=`
					position: absolute;
					left: 30%;
					width: 40%;
					height: 1px;
					background: ${Ad};
					top: ${50-c}% ;
					text-align: center;
					font-size: 10px;
				`,h.innerText=c,l.appendChild(h)}t.appendChild(l),e.appendChild(t),this.setShowHorizonLines(this.showHorizonLines)}}updatePauseMenu(e,t,n=[]){if(this.pauseRegionElem&&(this.pauseRegionElem.innerText=t||"알 수 없는 지역"),this.pauseLatElem){const m=e.lat>=0?"북":"남";this.pauseLatElem.innerText=`${Math.abs(e.lat).toFixed(4)}°${m}`}if(this.pauseLonElem){const m=e.lon>=0?"동":"서";this.pauseLonElem.innerText=`${Math.abs(e.lon).toFixed(4)}°${m}`}if(this.pauseAltElem){const m=Math.max(0,Math.round(e.alt*3.28084));this.pauseAltElem.innerText=`${m.toLocaleString()} 피트`}if(this.pauseTimeElem){const m=new Date,_=m.getTime()+m.getTimezoneOffset()*6e4,g=Math.round((e.lon||0)/15),p=new Date(_+36e5*g),T=p.getFullYear(),S=(p.getMonth()+1).toString().padStart(2,"0"),y=p.getDate().toString().padStart(2,"0"),w=p.getHours().toString().padStart(2,"0"),P=p.getMinutes().toString().padStart(2,"0"),C=p.getSeconds().toString().padStart(2,"0");this.pauseTimeElem.innerText=`${T}-${S}-${y}T${w}:${P}:${C}Z`}const i=this.minimapRange*1e4;if(GS(e.lon,e.lat,i,0),!this.pauseMiniCtx||!this.pauseMinimapCanvas)return;const r=this.pauseMiniCtx,a=this.pauseMinimapCanvas.width,o=this.pauseMinimapCanvas.height,l=a/2,c=o/2;r.clearRect(0,0,a,o),r.strokeStyle=ZS,r.lineWidth=1;const h=50;r.beginPath();for(let m=l;m<=a;m+=h)r.moveTo(m,0),r.lineTo(m,o);for(let m=l-h;m>=0;m-=h)r.moveTo(m,0),r.lineTo(m,o);for(let m=c;m<=o;m+=h)r.moveTo(0,m),r.lineTo(a,m);for(let m=c-h;m>=0;m-=h)r.moveTo(0,m),r.lineTo(a,m);r.stroke(),r.strokeStyle=dn,r.lineWidth=2;const u=15;r.beginPath(),r.moveTo(l-u,c),r.lineTo(l+u,c),r.moveTo(l,c-u),r.lineTo(l,c+u),r.stroke(),r.fillStyle=dn,r.font="12px AceCombat",r.fillText("아군",l+20,c+5);const d=i*1.1547,f=o/d;n.forEach(m=>{const _=(m.lon-e.lon)*111320*Math.cos(e.lat*Math.PI/180),g=(m.lat-e.lat)*111320,p=l+_*f,T=c-g*f;p<0||p>a||T<0||T>o||(r.strokeStyle="#fff",r.lineWidth=2,r.save(),r.translate(p,T),r.rotate(45*Math.PI/180),r.beginPath(),r.rect(-5,-5,10,10),r.stroke(),r.restore(),r.fillStyle=QS,r.font="10px AceCombat",r.fillText(m.name||"미상",p+10,T+5))})}update(e,t=[]){const i=(R,F,U)=>{let B=F-R;for(;B<-180;)B+=360;for(;B>180;)B-=360;return R+B*U},r=(R,F)=>{let U=R-F;for(;U<-180;)U+=360;for(;U>180;)U-=360;return U},a=R=>{for(;R<=-180;)R+=360;for(;R>180;)R-=360;return R};this.smoothedPitch=i(this.smoothedPitch,e.pitch,.5),this.smoothedRoll=i(this.smoothedRoll,e.roll,.5),this.smoothedHeading=i(this.smoothedHeading,e.heading||0,.5),this.smoothedThrottle=this.smoothedThrottle+((e.throttle||0)-this.smoothedThrottle)*(.5*.4),this.smoothedYaw=this.smoothedYaw+((e.yaw||0)-this.smoothedYaw)*.5,this.smoothedPitch=a(this.smoothedPitch),this.smoothedRoll=a(this.smoothedRoll),this.smoothedHeading=a(this.smoothedHeading);const o=this.minimapRange*1500,l=this.minimapRange*2;let c=o+e.speed*l;e.isBoosting&&(c*=1.2),this.currentZoom=c,HS(e.lon,e.lat,c,this.smoothedHeading);const h=e.isBoosting||!1;this.vignette&&(this.vignette.style.opacity=h?"1":"0");const u=r(e.pitch,this.smoothedPitch),d=r(e.roll,this.smoothedRoll),f=(e.yaw||0)-this.smoothedYaw,m=(e.throttle||0)-this.smoothedThrottle;if(this.uiContainer){const F=Math.max(-15,Math.min(15,u*.8)),U=Math.max(-15,Math.min(15,-d*.3+f*5)),B=50,H=Math.max(-B,Math.min(B,-d*1.5-f*20)),W=Math.max(-B,Math.min(B,u*3+m*15)),z=h?1.02:1;this.smoothedBoostScale=this.smoothedBoostScale+(z-this.smoothedBoostScale)*.1;const Z=(1+m*.25)*this.smoothedBoostScale;if(h){const oe=Date.now()*.05;this.currentShakeX=Math.sin(oe*1.5)*2+Math.cos(oe*2.1)*1.5,this.currentShakeY=Math.cos(oe*1.7)*2+Math.sin(oe*2.3)*1.5}else this.currentShakeX*=.85,this.currentShakeY*=.85;this.uiContainer.style.transform=`perspective(1000px) rotateX(${F}deg) rotateY(${U}deg) translate(${H+this.currentShakeX}px, ${W+this.currentShakeY}px) scale(${Z})`}this.speedElem.innerText=Math.round(e.speed).toString().padStart(3,"0"),e.weaponSystem&&this.updateWeapons(e.weaponSystem,e);let _=this.smoothedHeading;for(;_<0;)_+=360;for(;_>=360;)_-=360;if(this.headingDisplay){let R=Math.round(_);R===360&&(R=0);let F="";R>=337.5||R<22.5?F="북":R>=22.5&&R<67.5?F="북동":R>=67.5&&R<112.5?F="동":R>=112.5&&R<157.5?F="남동":R>=157.5&&R<202.5?F="남":R>=202.5&&R<247.5?F="남서":R>=247.5&&R<292.5?F="서":R>=292.5&&R<337.5&&(F="북서"),this.headingDisplay.innerText=`${R.toString().padStart(3,"0")} ${F}`}if(this.compassTape){const B=160-(_+360)*4;this.compassTape.style.transform=`translateX(${B}px)`}const g=Math.max(0,Math.round(e.alt*3.28084));this.altElem.innerText=g.toString().padStart(5,"0"),this.scoreElem&&(this.scoreElem.innerText=(e.score||0).toString().padStart(6,"0"));const p=Date.now()-this.startTime,T=Math.floor(p/6e4),S=Math.floor(p%6e4/1e3),y=Math.floor(p%1e3/10);this.timeElem.innerText=`${T.toString().padStart(2,"0")}:${S.toString().padStart(2,"0")}:${y.toString().padStart(2,"0")}`;const w=new Date,P=w.getTime()+w.getTimezoneOffset()*6e4,C=Math.round((e.lon||0)/15),L=new Date(P+36e5*C);if(this.localDateTimeElem){const R=L.getFullYear(),F=(L.getMonth()+1).toString().padStart(2,"0"),U=L.getDate().toString().padStart(2,"0"),B=L.getHours().toString().padStart(2,"0"),H=L.getMinutes().toString().padStart(2,"0"),W=L.getSeconds().toString().padStart(2,"0");this.localDateTimeElem.innerText=`${R}-${F}-${U}T${B}:${H}:${W}Z`}if(this.coordsElem){const R=e.lat>=0?"북":"남",F=e.lon>=0?"동":"서";this.coordsElem.innerText=`위치: ${Math.abs(e.lat).toFixed(4)}°${R} ${Math.abs(e.lon).toFixed(4)}°${F}`}this.cameraModeElem&&(this.cameraModeElem.innerText=e.cameraModeLabel||"추적"),this.missileProfileElem&&e.weaponSystem&&(this.missileProfileElem.innerText=e.weaponSystem.getMissileProfileStatus(e,e.weaponSystem.target).shortLabel);const v=document.getElementById("pitch-lines"),b=document.getElementById("horizon-container");v&&b&&(b.style.transform=`translate(-50%, -50%) rotate(${-this.smoothedRoll}deg)`,v.style.transform=`translateY(${this.smoothedPitch*6}px)`),this.drawMinimap(e,t),this.updateNPCMarkers(t,e)}drawMinimap(e,t=[]){if(!this.miniCtx||!this.minimapCanvas)return;const n=this.miniCtx,i=this.minimapCanvas.width||250,r=this.minimapCanvas.height||250,a=i/2,o=r/2,l=Math.min(a,o)-10;n.clearRect(0,0,i,r),n.save(),n.translate(a,o);const c=this.smoothedHeading;n.rotate(-c*Math.PI/180),n.strokeStyle=Ad,n.lineWidth=1;const h=this.minimapRange*1e3,u=(this.currentZoom||this.minimapRange*1500)*1.1547,d=h*r/u,f=r/u,m=Math.min(1e4*f,l),_=l*2;for(let C=0;C<=_;C+=d)n.beginPath(),n.moveTo(C,-_),n.lineTo(C,_),n.stroke(),C>0&&(n.beginPath(),n.moveTo(-C,-_),n.lineTo(-C,_),n.stroke());for(let C=0;C<=_;C+=d)n.beginPath(),n.moveTo(-_,C),n.lineTo(_,C),n.stroke(),C>0&&(n.beginPath(),n.moveTo(-_,-C),n.lineTo(_,-C),n.stroke());t.forEach(C=>{if(mp(e.lon,e.lat,C.lon,C.lat)>this.minimapRange*5e3)return;const v=(C.lon-e.lon)*111320*Math.cos(e.lat*Math.PI/180),b=(C.lat-e.lat)*111320,R=v*f,F=-b*f;Math.sqrt(R*R+F*F)>l-5||(n.save(),n.translate(R,F),n.rotate(C.heading*Math.PI/180),n.fillStyle="#fff",n.shadowBlur=0,n.beginPath(),n.moveTo(0,-8),n.lineTo(6,6),n.lineTo(0,3),n.lineTo(-6,6),n.closePath(),n.fill(),n.restore())}),n.restore();const g=12,p=a-g,T=o-g;n.strokeStyle=Dl,n.lineWidth=1.2,n.beginPath(),n.moveTo(0,o),n.lineTo(i,o),n.moveTo(a,0),n.lineTo(a,r);const S=Xt();let y=Math.PI/4;if(S&&S.camera&&S.camera.frustum){const C=S.camera.frustum.fovy,L=window.innerWidth/window.innerHeight;y=Math.atan(Math.tan(C/2)*L)}const w=i+r;n.moveTo(a,o),n.lineTo(a-Math.sin(y)*w,o-Math.cos(y)*w),n.moveTo(a,o),n.lineTo(a+Math.sin(y)*w,o-Math.cos(y)*w),n.stroke(),n.fillStyle=dn,n.font=`bold 16px ${getComputedStyle(document.body).fontFamily}`,n.shadowColor="rgba(0, 0, 0, 0.5)",n.shadowBlur=4,n.textAlign="center",n.textBaseline="middle",[{label:"북",angle:0},{label:"동",angle:90},{label:"남",angle:180},{label:"서",angle:270}].forEach(C=>{const L=(C.angle-c)*Math.PI/180,v=Math.sin(L),b=Math.cos(L),R=Math.abs(v),F=Math.abs(b);let U,B;p*F>T*R?(B=b>0?-T:T,U=B*v/-b):(U=v>0?p:-p,B=U*-b/v),n.fillText(C.label,a+U,o+B)}),n.save(),n.translate(a,o),n.fillStyle=dn,n.shadowBlur=0,n.beginPath(),n.moveTo(0,-12),n.lineTo(8,10),n.lineTo(0,5),n.lineTo(-8,10),n.closePath(),n.fill(),n.strokeStyle=Dl,n.lineWidth=1.2,n.beginPath(),n.arc(0,0,m,0,Math.PI*2),n.stroke(),n.restore();const P=Date.now()/1500%1;n.strokeStyle=`rgba(121, 232, 255, ${.7*(1-P)})`,n.lineWidth=1.2,n.beginPath(),n.arc(a,o,P*m,0,Math.PI*2),n.stroke()}updateNPCMarkers(e,t){const n=Xt();if(!n)return;const i=new Set;if(e&&e.length>0){this.npcContainer.style.display="block";const r=n.scene,a=r.camera,o=2e5,l=new Cesium.Cartesian3,c=new Cesium.Cartesian3;e.forEach(h=>{Cesium.Cartesian3.fromDegrees(h.lon,h.lat,h.alt,void 0,l),Cesium.Cartesian3.fromDegrees(t.lon,t.lat,t.alt,void 0,c);const u=Cesium.Cartesian3.distance(l,c);if(u>o)return;const d=h.id||h.name;i.add(d);let f=this.npcMarkers.get(d);f||(f=this.createNPCMarker(h),this.npcMarkers.set(d,f));const m=Cesium.SceneTransforms.worldToWindowCoordinates||Cesium.SceneTransforms.wgs84ToWindowCoordinates,_=m?m(r,l):null,g=Cesium.Cartesian3.subtract(l,a.position,new Cesium.Cartesian3),p=Cesium.Cartesian3.dot(g,a.direction);if(!_||p<=0||_.x<0||_.x>window.innerWidth||_.y<0||_.y>window.innerHeight){const S=Cesium.Cartesian3.dot(g,a.right),y=-Cesium.Cartesian3.dot(g,a.up);this.updateOffScreenMarker(f,S,y,h,u)}else this.updateOnScreenMarker(f,_,h,u,t)})}else this.npcContainer.style.display="none";for(const[r,a]of this.npcMarkers)i.has(r)||(a.container.remove(),this.npcMarkers.delete(r))}createNPCMarker(e){const t=document.createElement("div");t.className="npc-marker-container";const n=document.createElement("div");n.className="npc-visual-wrapper";const i=document.createElement("div");i.className="npc-diamond";const r=document.createElement("div");r.className="npc-lock-box",r.style.display="none";const a=document.createElement("div");a.className="npc-label";const o=document.createElement("div");o.className="npc-offscreen-dot",o.style.display="none";const l=document.createElement("div");return l.className="npc-offscreen-name",l.style.display="none",n.appendChild(i),n.appendChild(r),t.appendChild(n),t.appendChild(a),t.appendChild(o),t.appendChild(l),this.npcContainer.appendChild(t),{container:t,diamond:i,label:a,dot:o,offscreenName:l,lockBox:r}}updateOnScreenMarker(e,t,n,i,r){e.container.style.display="flex",e.container.style.transform=`translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%)`,e.diamond.style.display="block",e.label.style.display="block",e.dot.style.display="none",e.offscreenName.style.display="none";const a=r.weaponSystem;a&&a.lockingTarget===n?(e.lockBox.style.display="block",a.lockStatus==="LOCKED"?(e.lockBox.classList.remove("locking-blink"),e.lockBox.style.borderColor=dn,e.lockBox.innerHTML=`<span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-weight:bold; color:${dn}; font-size:12px; text-shadow: 0 0 8px ${Dl};">고정</span>`):a.lockStatus==="LOCKING"&&(e.lockBox.classList.add("locking-blink"),e.lockBox.style.borderColor=dn,e.lockBox.innerHTML="")):(e.lockBox.style.display="none",e.lockBox.innerHTML="");const o=(i/1e3).toFixed(1),l=`${n.name}
${o}km`;e.label.innerText!==l&&(e.label.innerText=l)}updateOffScreenMarker(e,t,n,i,r){e.container.style.display="flex",e.diamond.style.display="none",e.label.style.display="none",e.dot.style.display="block",e.offscreenName.style.display="block";const a=window.innerWidth/2,o=window.innerHeight/2;Math.abs(t)<1e-4&&Math.abs(n)<1e-4&&(n=-1);const l=Math.atan2(n,t),c=40,h=a-c,u=o-c,d=Math.cos(l),f=Math.sin(l);let m,_;Math.abs(h*f)>Math.abs(u*d)?(_=u*Math.sign(f),m=_*d/f):(m=h*Math.sign(d),_=m*f/d);const g=a+m,p=o+_;e.container.style.transform=`translate3d(${g}px, ${p}px, 0) translate(-50%, -50%)`,e.offscreenName.innerText!==i.name&&(e.offscreenName.innerText=i.name),e.lockBox&&(e.lockBox.style.display="none",e.lockBox.innerHTML="")}updateFPS(e){this.fpsElem&&(this.fpsElem.innerText=Math.round(e).toString())}updateWeapons(e,t=null){const n=e.getCurrentWeapon(),i=performance.now()*.001,r=e.getMissileProfileStatus(t,e.target),a=!!n&&(n.id==="missile"||n.id==="aim-9"||n.name&&n.name.toLowerCase().includes("aim-9"));this.showMissileCrosshair(a),["gun","missile","flare"].forEach(o=>{const l=this.weaponElems[o],c=this.weaponAmmoElems[o],h=this.weaponProgressElems[o],d=(o==="flare"?e.flareWeapon:e.weapons.find(f=>f.id===o&&(o!=="missile"||f===n)))||(o==="flare"?e.flareWeapon:e.weapons.find(f=>f.id===o));if(l){const f=e.emptyWarningTimers&&e.emptyWarningTimers[o]>0,m=n&&n.id===o||o==="flare"&&i-e.flareWeapon.lastFire<1||f,_=o==="gun"&&e.isGunOverheated;if(m?l.classList.add("active"):l.classList.remove("active"),_||f?l.classList.add("overheated"):l.classList.remove("overheated"),o==="missile"){const g=l.querySelector(".weapon-name");g&&(g.innerText=d?.name||"AAM 미사일"),this.missileSubtitleElem&&(this.missileSubtitleElem.innerText=r.shortLabel)}}if(h&&d){let f=0;if(o==="gun")f=e.gunHeat*100;else{const m=i-d.lastFire,_=o==="flare"?1:d.fireRate;m<_?f=m/_*100:f=0}h.style.width=`${f}%`}c&&d&&(o==="gun"&&e.isGunOverheated?c.innerText="과열":d.ammo===1/0?c.innerText="무한":c.innerText=d.ammo.toString().padStart(2,"0"))})}}class Rd{constructor(){this.group=new Wt;const e=`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,t=`
            uniform float time;
            uniform float throttle;
            uniform float isBoosting;
            varying vec2 vUv;
            varying vec3 vPosition;

            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                float v = 1.0 - vUv.y;
                
                float effThrottle = max(throttle, isBoosting);

                float nonBoostLen = 0.3 + throttle * 0.7;
                float boostLen = 1.3;
                float activeLen = mix(nonBoostLen, boostLen, isBoosting);

                float nonBoostIntensity = 0.6 + throttle * 0.9;
                float boostIntensity = 1.4;
                float intensity = mix(nonBoostIntensity, boostIntensity, isBoosting);

                if (v > activeLen + 0.1) discard;

                vec3 coreColor = vec3(1.0, 1.0, 0.95); 
                
                vec3 normalMid = vec3(1.0, 0.4, 0.1);
                vec3 normalOuter = vec3(0.15, 0.35, 1.0);
                vec3 boostMid = vec3(1.0, 0.5, 0.2);
                vec3 boostOuter = vec3(0.3, 0.3, 1.0);

                vec3 midColor = mix(normalMid, boostMid, isBoosting);
                vec3 outerColor = mix(normalOuter, boostOuter, isBoosting);

                float radial = length(vPosition.xy);
                float glow = exp(-radial * 10.0);
                float core = exp(-radial * 28.0);
                
                float shockFreq = 20.0;
                float shock = pow(max(0.0, sin(v * shockFreq - time * 50.0)), 4.0);
                shock *= (0.2 + effThrottle * 0.8 + isBoosting * 0.2);
                
                float diamondPos = sin(v * 26.0 - time * 40.0);
                float diamondMesh = pow(max(0.0, diamondPos), 7.0) * (1.0 - v/activeLen);

                float flicker = 1.0 + 0.18 * noise(vec2(time * 20.0, v * 10.0));

                vec3 finalColor = mix(outerColor * 0.7, midColor, glow);
                
                float coreMix = core + diamondMesh * 0.7;
                vec3 detailColor = mix(coreColor, midColor, isBoosting * 0.3);
                finalColor = mix(finalColor, detailColor, coreMix);
                
                finalColor += detailColor * shock * glow;

                float fade = pow(max(0.0, 1.0 - v / activeLen), 2.2);
                
                float edgeFade = smoothstep(activeLen, activeLen * 0.5, v);
                
                float alpha = fade * intensity * (glow * 2.2 + core) * edgeFade;
                alpha = clamp(alpha * flicker, 0.0, 1.0);

                gl_FragColor = vec4(finalColor * intensity, alpha);
            }
        `;this.uniforms={time:{value:0},throttle:{value:0},isBoosting:{value:0}},this.boostFactor=0;const n=new Gi(.15,.03,2,16,32,!0);n.translate(0,-1,0),n.rotateX(-Math.PI/2),this.material=new zn({uniforms:this.uniforms,vertexShader:e,fragmentShader:t,transparent:!0,blending:mn,side:on,depthWrite:!1}),this.flame=new lt(n,this.material),this.group.add(this.flame),this.light=new Ph(16755268,1,5),this.light.position.set(0,0,0),this.group.add(this.light),this.cNormal=new Pe(16742178),this.cBoost=new Pe(10066431)}update(e,t,n,i){const r=t?1:0,a=5;this.boostFactor+=(r-this.boostFactor)*Math.min(i*a,1),this.uniforms.throttle.value=e,this.uniforms.isBoosting.value=this.boostFactor,this.uniforms.time.value=n;const o=(1-this.boostFactor)*(.6+e*1.2)+this.boostFactor*2.2,c=1.1+Math.max(e,this.boostFactor)*.4;this.flame.scale.set(c,c,o),this.light.intensity=(1-this.boostFactor)*(1+e*2.5)+this.boostFactor*7.5,this.light.color.copy(this.cNormal).lerp(this.cBoost,this.boostFactor)}}function Ha(s,e){const t=document.createElement("canvas");t.width=s,t.height=s;const n=t.getContext("2d");e(n,s);const i=new Th(t);return i.minFilter=Et,i.magFilter=Et,i}const Xn={scene:null,viewer:null,list:[],_textures:null,_scratchMatrix:new Cesium.Matrix4,_scratchCameraMatrix:new Cesium.Matrix4,_scratchThreeMatrix:new He,_scratchCartesian:new Cesium.Cartesian3,init(s,e){this.scene=s,this.viewer=e},ensureTextures(){return this._textures?this._textures:(this._textures={fire:Ha(128,(s,e)=>{const t=e/2,n=s.createRadialGradient(t,t,0,t,t,t);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.16,"rgba(255,247,212,0.98)"),n.addColorStop(.34,"rgba(255,187,84,0.92)"),n.addColorStop(.58,"rgba(255,96,24,0.54)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,e,e)}),smoke:Ha(128,(s,e)=>{const t=e/2,n=s.createRadialGradient(t,t,e*.08,t,t,e*.5);n.addColorStop(0,"rgba(255,255,255,0.9)"),n.addColorStop(.24,"rgba(208,208,208,0.68)"),n.addColorStop(.6,"rgba(108,108,108,0.28)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,e,e)}),spark:Ha(96,(s,e)=>{const t=e/2,n=s.createRadialGradient(t,t,0,t,t,t);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.24,"rgba(255,242,190,0.98)"),n.addColorStop(.5,"rgba(255,170,74,0.82)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,e,e)}),ring:Ha(160,(s,e)=>{const t=e/2;s.clearRect(0,0,e,e),s.strokeStyle="rgba(255,229,194,0.95)",s.lineWidth=e*.08,s.beginPath(),s.arc(t,t,e*.28,0,Math.PI*2),s.stroke();const n=s.createRadialGradient(t,t,e*.18,t,t,e*.5);n.addColorStop(0,"rgba(255,255,255,0)"),n.addColorStop(.45,"rgba(255,188,102,0.2)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,e,e)})},this._textures)},enableLayers(s){s.layers.enable(0),s.layers.enable(1)},addBillboardParticle(s){const e=new hs(new Bi({map:s.texture,color:s.color,transparent:!0,opacity:s.opacity,blending:s.blending??mn,depthWrite:!1}));return this.enableLayers(e),e.matrixAutoUpdate=!1,e.lon=s.lon,e.lat=s.lat,e.alt=s.alt,e.life=s.life,e.maxLife=s.life,e.isSmoke=!!s.isSmoke,e._scaleStart=s.scaleStart,e._scaleEnd=s.scaleEnd??s.scaleStart,e._opacityStart=s.opacity,e._drag=s.drag??0,e._gravityMultiplier=s.gravityMultiplier??0,e._riseBias=s.riseBias??0,e._spinSpeed=s.spinSpeed??0,e._fadePower=s.fadePower??1,e._localVel={east:s.velocity?.east??0,north:s.velocity?.north??0,up:s.velocity?.up??0},this.scene.add(e),this.list.push(e),e},spawnExplosion(s,e,t,n={}){const i=this.ensureTextures(),r=!!n.big,a=n.count||(r?48:26),o=typeof n.smokeCount<"u"?n.smokeCount:r?12:7,l=n.sparkCount||(r?28:16);this.addBillboardParticle({texture:i.fire,color:16777215,opacity:1,lon:s,lat:e,alt:t,life:r?.2:.14,scaleStart:r?2.8:1.8,scaleEnd:r?10.2:6.1,gravityMultiplier:0,riseBias:0,spinSpeed:0,fadePower:1.65}),this.addBillboardParticle({texture:i.ring,color:16765857,opacity:.86,lon:s,lat:e,alt:t,life:r?.5:.36,scaleStart:r?1.4:.9,scaleEnd:r?16.5:11.5,gravityMultiplier:0,riseBias:0,spinSpeed:0,fadePower:1.25});for(let c=0;c<a;c+=1){const h=Math.random()*Math.PI*2,u=(Math.random()*120-50)*(Math.PI/180),d=(r?24:12)+Math.random()*(r?68:34),f=.05+Math.random()*.05,m=.9+Math.random()*.1,_=.56+Math.random()*.14;this.addBillboardParticle({texture:i.fire,color:new Pe().setHSL(f,m,_),opacity:.96,lon:s,lat:e,alt:t,life:(r?.9:.55)+Math.random()*(r?.55:.35),scaleStart:(r?.9:.45)+Math.random()*(r?1.4:.6),scaleEnd:(r?3.6:2.1)+Math.random()*(r?2.2:1.1),velocity:{east:Math.sin(h)*Math.cos(u)*d,north:Math.cos(h)*Math.cos(u)*d,up:Math.sin(u)*d},gravityMultiplier:.16,riseBias:.45,drag:.4,spinSpeed:(Math.random()-.5)*4.5,fadePower:.84})}for(let c=0;c<l;c+=1){const h=Math.random()*Math.PI*2,u=(Math.random()*120-40)*(Math.PI/180),d=(r?55:26)+Math.random()*(r?145:80);this.addBillboardParticle({texture:i.spark,color:16772543,opacity:1,lon:s,lat:e,alt:t,life:.18+Math.random()*.34,scaleStart:.18+Math.random()*.16,scaleEnd:.78+Math.random()*.52,velocity:{east:Math.sin(h)*Math.cos(u)*d,north:Math.cos(h)*Math.cos(u)*d,up:Math.sin(u)*d},gravityMultiplier:1.4,riseBias:.05,drag:1.05,spinSpeed:(Math.random()-.5)*8,fadePower:.58})}for(let c=0;c<o;c+=1){const h=(Math.random()-.5)*16e-5,u=Math.random()*Math.PI*2,d=.8+Math.random()*3.2,f=.18+Math.random()*.14;this.addBillboardParticle({texture:i.smoke,color:new Pe(f,f*.98,f*.94),opacity:.62,blending:zi,lon:s+h,lat:e+h,alt:t+(Math.random()-.5)*1.1,life:(r?1.5:.9)+Math.random()*(r?1.3:.75),scaleStart:(r?1.8:1.05)+Math.random()*(r?1.6:.9),scaleEnd:(r?7.2:4.2)+Math.random()*(r?3.4:1.8),velocity:{east:Math.sin(u)*d,north:Math.cos(u)*d,up:1.4+Math.random()*3.8},gravityMultiplier:.05,riseBias:.55,drag:.18,spinSpeed:(Math.random()-.5)*1.3,fadePower:1.55,isSmoke:!0})}try{this.viewer?.scene&&this.viewer.scene.requestRender()}catch{}},spawnWreckage(s,e,t,n=0,i=0,r={}){const a=r.count||30,o=r.sizeMultiplier||1,l=r.speedMultiplier||1,c=r.lifeMultiplier||1,h=r.hotShardRatio||0,u=Cesium.Math.toRadians(n),d=Cesium.Math.toRadians(i),f={east:Math.sin(u)*Math.cos(d),north:Math.cos(u)*Math.cos(d),up:Math.sin(d)};for(let m=0;m<a;m+=1){const _=Math.random();let g;const p=(.4+Math.random()*2.4)*o;if(_<.6){const v=[],b=3+Math.floor(Math.random()*3);for(let U=0;U<b;U+=1){const B=U/b*Math.PI*2+(Math.random()-.5)*.6,H=p*(.35+Math.random()*1.1);v.push(new re(Math.cos(B)*H,Math.sin(B)*H))}const R=new kf(v),F=Math.max(.03,p*.12);g=new Ch(R,{depth:F,bevelEnabled:!1}),g.translate(0,0,-F*.5)}else g=new ms(p*.6,p,3),g.rotateX(Math.PI/2);const T=Math.random()*.08,S=Math.random()<h,y=S?.7+Math.random()*.8:0,w=new lt(g,new u0({color:new Pe(T,T,T),emissive:S?new Pe(.36,.12,.03):new Pe(0,0,0),emissiveIntensity:y,flatShading:!0,side:on}));this.enableLayers(w),w.matrixAutoUpdate=!1,w._rotEuler=new Kt(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI),w._rotVel=new I((Math.random()-.5)*6,(Math.random()-.5)*6,(Math.random()-.5)*6),w.life=(4+Math.random()*8)*c,w.maxLife=w.life,w.lon=s+(Math.random()-.5)*1e-4,w.lat=e+(Math.random()-.5)*1e-4,w.alt=t+(Math.random()-.5)*1,w._emissiveStart=y;const P=new I(1+Math.random()*1.5,1+Math.random()*1.5,1+Math.random()*1.5);w._scaleVector=P;const C=1.2,L=(10+Math.random()*60)*l;w._localVel={east:(f.east+(Math.random()-.5)*C)*L,north:(f.north+(Math.random()-.5)*C)*L,up:(f.up+(Math.random()-.5)*C*.8)*L-(4+Math.random()*6)},w._gravityMultiplier=r.fallMultiplier||2.2,w._drag=.12,this.scene.add(w),this.list.push(w)}},spawnSpark(s,e,t,n={}){const i=this.ensureTextures(),r=n.count||12;for(let a=0;a<r;a+=1){const o=Math.random()*Math.PI*2,l=(Math.random()*120-60)*(Math.PI/180),c=18+Math.random()*40;this.addBillboardParticle({texture:i.spark,color:16773310,opacity:.92,lon:s,lat:e,alt:t,life:.18+Math.random()*.3,scaleStart:.14+Math.random()*.1,scaleEnd:.6+Math.random()*.3,velocity:{east:Math.sin(o)*Math.cos(l)*c,north:Math.cos(o)*Math.cos(l)*c,up:Math.sin(l)*c},gravityMultiplier:1.2,drag:1.1,fadePower:.6})}},update(s){if(!this.viewer)return;const e=this.viewer.camera.viewMatrix;for(let t=this.list.length-1;t>=0;t-=1){const n=this.list[t];if(n.life-=s*(n.isSmoke?.95:1),n.life<=0){this.scene.remove(n),this.list.splice(t,1);continue}if(n._localVel){const h=Math.max(0,1-n._drag*s);n._localVel.east*=h,n._localVel.north*=h,n._localVel.up*=h,n._localVel.up+=(n._riseBias??0)*s,n._localVel.up-=9.81*s*(n._gravityMultiplier??0);const u=Cesium.Math.toRadians(n.lat);n.lon+=n._localVel.east*s/(111320*Math.max(Math.cos(u),.01)),n.lat+=n._localVel.north*s/111320,n.alt+=n._localVel.up*s}const i=n.life/n.maxLife,r=1-i;n.material&&n.material.opacity!==void 0&&(n.material.opacity=n._opacityStart*Math.pow(Math.max(0,i),n._fadePower??(n.isSmoke?1.4:.9))),n.material&&typeof n.material.emissiveIntensity=="number"&&(n.material.emissiveIntensity=(n._emissiveStart??0)*Math.pow(Math.max(0,i),1.2)),n.material&&"rotation"in n.material&&(n.material.rotation+=(n._spinSpeed??0)*s);const a=n._scaleVector?n._scaleVector:new I(Ft.lerp(n._scaleStart??1,n._scaleEnd??n._scaleStart??1,r),Ft.lerp(n._scaleStart??1,n._scaleEnd??n._scaleStart??1,r),Ft.lerp(n._scaleStart??1,n._scaleEnd??n._scaleStart??1,r)),o=Cesium.Cartesian3.fromDegrees(n.lon,n.lat,n.alt,void 0,this._scratchCartesian),l=Cesium.Transforms.eastNorthUpToFixedFrame(o,void 0,this._scratchMatrix),c=Cesium.Matrix4.multiply(e,l,this._scratchCameraMatrix);for(let h=0;h<16;h+=1)this._scratchThreeMatrix.elements[h]=c[h];if(n.matrix.copy(this._scratchThreeMatrix),n._rotEuler&&n._rotVel){n._rotEuler.x+=n._rotVel.x*s,n._rotEuler.y+=n._rotVel.y*s,n._rotEuler.z+=n._rotVel.z*s;const h=new He,u=new Bt().setFromEuler(n._rotEuler);h.compose(new I(0,0,0),u,a),n.matrix.multiply(h)}else n.matrix.scale(a);n.updateMatrixWorld(!0)}}};class tb{constructor(){this.listener=new D0,this.sounds=new Map,this.loader=new I0,this._voicePool=[],this._activeOneShots=new Set,this._lastRandom={},this._userInteracted=!1}init(e){e.add(this.listener)}async unlock(){if(this._userInteracted=!0,this.listener.context.state==="suspended")try{await this.listener.context.resume()}catch{return!1}return this.listener.context.state==="running"}isUnlocked(){return this.listener.context.state==="running"}async loadSound(e,t,n=!1,i=.5){return new Promise((r,a)=>{this.loader.load(t,o=>{const l=new Yu(this.listener);l.setBuffer(o),l.setLoop(n),l.setVolume(i),l._baseVolume=i,l._isLooping=n,this.sounds.set(e,l),r(l)},void 0,a)})}_getVoice(){return this._voicePool.pop()||new Yu(this.listener)}_releaseVoice(e){e.isPlaying&&e.stop(),this._activeOneShots.delete(e),this._voicePool.push(e)}play(e,t=0){const n=e;if(e.endsWith("-random")){const o=e.replace("-random","-"),l=Array.from(this.sounds.keys()).filter(c=>c.startsWith(o));if(l.length>0){const c=this._lastRandom[e]??-1;let h=Math.floor(Math.random()*l.length);l.length>1&&h===c&&(h=(h+1)%l.length),this._lastRandom[e]=h,e=l[h]}}const i=this.sounds.get(e);if(!i)return;const{context:r}=i;if(r.state!=="running")return;const a=i._baseVolume??.5;if(!i._isLooping){const o=this._getVoice();o.setBuffer(i.buffer),o.setVolume(a),o.play(),o._parentName=n||e,this._activeOneShots.add(o),o.source.onended=()=>{o._isPaused||this._releaseVoice(o)};return}if(!i.isPlaying)if(i.play(),t>0){i.setVolume(0);const o=r.currentTime;i.gain.gain.cancelScheduledValues(o),i.gain.gain.setValueAtTime(0,o),i.gain.gain.linearRampToValueAtTime(a,o+t)}else i.setVolume(a)}stop(e,t=0){const n=this.sounds.get(e);if(n){if(n.isPlaying)if(t>0){const i=n.context.currentTime;n.gain.gain.cancelScheduledValues(i),n.gain.gain.linearRampToValueAtTime(0,i+t),setTimeout(()=>{n.isPlaying&&(n.stop(),n.setVolume(n._baseVolume??.5))},t*1e3+50)}else n.stop();this._activeOneShots.forEach(i=>{i._parentName===e&&(i.source.onended=null,this._releaseVoice(i))})}}setVolume(e,t){const n=this.sounds.get(e);n&&n.gain.gain.setValueAtTime(t,n.context.currentTime)}isPlaying(e){const t=this.sounds.get(e);if(!t)return!1;if(t.isPlaying)return!0;for(const n of this._activeOneShots)if(n._parentName===e&&(n.isPlaying||n._isPaused))return!0;return!1}pauseAll(){this.sounds.forEach(e=>{e.isPlaying&&(e.pause(),e._wasPlaying=!0)}),this._activeOneShots.forEach(e=>{e.isPlaying&&(e.pause(),e._isPaused=!0)})}resumeAll(){this.sounds.forEach(e=>{e._wasPlaying&&(e.play(),e._wasPlaying=!1)}),this._activeOneShots.forEach(e=>{e._isPaused&&(e.play(),e._isPaused=!1)})}stopAll(e=0){this.sounds.forEach((t,n)=>this.stop(n,e))}}const Le=new tb,nb=/^[a-zA-Z][a-zA-Z\d+\-.]*:/;function Pd(){return typeof document<"u"&&typeof document.baseURI=="string"&&document.baseURI.length>0?document.baseURI:typeof window<"u"&&typeof window.location?.href=="string"&&window.location.href.length>0?window.location.href:"/"}function rn(s,e="Flight sim"){return typeof s!="string"||s.length===0?(console.warn(`${e} asset path is missing.`,s),Pd()):nb.test(s)||s.startsWith("//")||s.startsWith("/")?s:new URL(s.replace(/^\/+/,""),Pd()).toString()}const jc={sidewinder:{id:"sidewinder",label:"AIM-9B Sidewinder",modelPath:"/3d-bundles/missile/aim-9b_sidewinder.glb",desiredLengthM:3.05,renderScale:2.6,bodyTint:14146786,emissive:1119514,exhaustColor:16751943,glowColor:16773320,smokeColor:9077369,emberColor:16763773,trailIntervalM:9.5,emberIntervalM:18,smokeLife:1.8,smokeStartScale:.56,smokeEndScale:4.6,smokeOpacity:.58,emberLife:.48,emberStartScale:.2,emberEndScale:1,emberOpacity:.92,boostDuration:.62,initialSpeedBonus:300,cruiseSpeedBonus:760,boostSpeedBonus:1110,boostAcceleration:2850,sustainAcceleration:760,turnRateDeg:128,terminalTurnRateDeg:164,proximityRadiusM:92,spinRate:11.4,engineLightIntensity:2.3,engineConeRadius:.24,engineConeLength:2.05,engineGlowScale:2.1},amraamC:{id:"amraamC",label:"AIM-120C AMRAAM",modelPath:"/3d-bundles/missile/aim-120c_amraam.glb",desiredLengthM:3.65,renderScale:2.45,bodyTint:14278373,emissive:1053721,exhaustColor:16755036,glowColor:16774360,smokeColor:8944237,emberColor:16759395,trailIntervalM:10.5,emberIntervalM:20,smokeLife:2.1,smokeStartScale:.62,smokeEndScale:5.2,smokeOpacity:.6,emberLife:.55,emberStartScale:.22,emberEndScale:1.08,emberOpacity:.96,boostDuration:.78,initialSpeedBonus:340,cruiseSpeedBonus:910,boostSpeedBonus:1280,boostAcceleration:3120,sustainAcceleration:840,turnRateDeg:102,terminalTurnRateDeg:136,proximityRadiusM:108,spinRate:8.8,engineLightIntensity:2.6,engineConeRadius:.28,engineConeLength:2.3,engineGlowScale:2.24},amraamLite:{id:"amraamLite",label:"AIM-120 AMRAAM",modelPath:"/3d-bundles/missile/aim-120_amraam.glb",desiredLengthM:3.55,renderScale:2.45,bodyTint:14080478,emissive:987670,exhaustColor:16757871,glowColor:16773074,smokeColor:8682097,emberColor:16762756,trailIntervalM:10,emberIntervalM:19,smokeLife:1.95,smokeStartScale:.58,smokeEndScale:4.9,smokeOpacity:.56,emberLife:.5,emberStartScale:.2,emberEndScale:1.02,emberOpacity:.9,boostDuration:.72,initialSpeedBonus:335,cruiseSpeedBonus:880,boostSpeedBonus:1220,boostAcceleration:3e3,sustainAcceleration:800,turnRateDeg:98,terminalTurnRateDeg:132,proximityRadiusM:104,spinRate:8.1,engineLightIntensity:2.45,engineConeRadius:.27,engineConeLength:2.22,engineGlowScale:2.18}},ib=Object.freeze(Object.keys(jc));function gp(){return"sidewinder"}function sb(){return[...ib]}function Kc(s){return jc[s]??jc[gp()]}function Ga(s=0){return s>6500?"amraamLite":s>3600?"amraamC":"sidewinder"}const rb=new Nh,Fl=new Map,Wa=new Map;let Xa=null;function Ul(s,e){const t=document.createElement("canvas");t.width=s,t.height=s;const n=t.getContext("2d");e(n,s);const i=new Th(t);return i.minFilter=Et,i.magFilter=Et,i}function Id(){return Xa||(Xa={glow:Ul(128,(s,e)=>{const t=e/2,n=s.createRadialGradient(t,t,0,t,t,t);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.18,"rgba(255,242,214,0.98)"),n.addColorStop(.44,"rgba(255,179,92,0.82)"),n.addColorStop(.72,"rgba(255,96,28,0.26)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,e,e)}),smoke:Ul(128,(s,e)=>{const t=e/2,n=s.createRadialGradient(t,t,e*.08,t,t,e*.5);n.addColorStop(0,"rgba(255,255,255,0.92)"),n.addColorStop(.25,"rgba(220,220,220,0.72)"),n.addColorStop(.62,"rgba(104,104,104,0.3)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,e,e)}),spark:Ul(96,(s,e)=>{const t=e/2,n=s.createRadialGradient(t,t,0,t,t,t);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.24,"rgba(255,242,181,0.98)"),n.addColorStop(.48,"rgba(255,177,74,0.84)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,e,e)})},Xa)}function pn(s){s.layers.enable(0),s.layers.enable(1)}function Ld(s,e){if(!s||typeof s.clone!="function")return s;const t=s.clone(),n=new Pe(e.bodyTint);return t.color&&t.color.lerp(n,.28),"metalness"in t&&(t.metalness=Math.max(.28,t.metalness??.28)),"roughness"in t&&(t.roughness=Math.min(.72,t.roughness??.72)),"emissive"in t&&(t.emissive=new Pe(e.emissive),t.emissiveIntensity=.14),t}function ab(s){const t=new _n().setFromObject(s).getSize(new I);if(t.x>t.y&&t.x>t.z){s.rotation.z=-Math.PI/2;return}t.z>t.y&&t.z>t.x&&(s.rotation.x=-Math.PI/2)}function ob(s,e){const t=s.clone(!0);t.traverse(h=>{if(pn(h),!!h.isMesh){if(h.castShadow=!1,h.receiveShadow=!1,Array.isArray(h.material)){h.material=h.material.map(u=>Ld(u,e));return}h.material=Ld(h.material,e)}}),ab(t),t.updateMatrixWorld(!0);let n=new _n().setFromObject(t);const i=n.getSize(new I),r=Math.max(i.x,i.y,i.z)||1,o=e.desiredLengthM*(e.renderScale??1)/r;t.scale.setScalar(o),t.updateMatrixWorld(!0),n=new _n().setFromObject(t);const l=n.getCenter(new I);t.position.sub(l),t.updateMatrixWorld(!0),n=new _n().setFromObject(t);const c=new Wt;return c.add(t),pn(c),c.userData.tailY=n.min.y,c}async function lb(s){if(Fl.has(s.id))return Fl.get(s.id);if(Wa.has(s.id))return Wa.get(s.id);const e=rb.loadAsync(rn(s.modelPath,`Missile ${s.label}`)).then(t=>{const n=t?.scene??t?.scenes?.[0];if(!n)throw new Error(`Missile model ${s.modelPath} is empty.`);const i=ob(n,s);return Fl.set(s.id,i),i}).catch(t=>(console.warn(`Failed to load missile model ${s.modelPath}.`,t),null)).finally(()=>{Wa.delete(s.id)});return Wa.set(s.id,e),e}function cb(s){const e=s.clone(!0);return e.userData={...s.userData},e.traverse(t=>{pn(t)}),e}function hb(s,e,t){const n=e-s;return Math.abs(n)<=t?e:s+Math.sign(n)*t}function ub(s,e,t){let n=e-s;for(;n<-180;)n+=360;for(;n>180;)n-=360;return s+Math.max(-t,Math.min(t,n))}function db(s){const e=new Wt;pn(e);const t=s.desiredLengthM*(s.renderScale??1)*.82,n=t*.052,i=new Gi(n,n,t,18),r=new Vi({color:s.bodyTint,metalness:.42,roughness:.48,emissive:new Pe(s.emissive),emissiveIntensity:.12}),a=new lt(i,r);e.add(a);const o=t*.14,l=new ms(n,o,18);l.translate(0,t*.5+o*.5,0);const c=new lt(l,new Vi({color:3422784,metalness:.64,roughness:.28}));e.add(c);const h=new Gi(n*1.05,n*1.05,t*.06,18);h.translate(0,t*.18,0),e.add(new lt(h,new On({color:16171085})));const u=new Si(n*3.8,t*.16,n*.18);u.translate(n*1.9,-t*.28,0);const d=new Vi({color:5331041,metalness:.3,roughness:.62});for(let f=0;f<4;f+=1){const m=new lt(u,d);m.rotation.y=f*(Math.PI/2),e.add(m)}return{group:e,tailY:-(t*.5)-.04}}class fb{constructor(e,t,n,i,r,a,o=null,l=null,c={}){this.scene=e,this.viewer=t,this.target=o,this.onKill=l,this.onDetonate=c.onDetonate??null,this.visual=Kc(c.visualId??gp()),this.isMissile=!0,this.hasDetonated=!1,this.lon=n.lon,this.lat=n.lat,this.alt=n.alt,this.heading=i,this.pitch=r,this.roll=Math.random()*Math.PI*2,this.speed=Math.max(420,a+this.visual.initialSpeedBonus),this.cruiseSpeed=Math.max(this.speed+120,a+this.visual.cruiseSpeedBonus),this.boostSpeed=Math.max(this.cruiseSpeed+180,a+this.visual.boostSpeedBonus),this.boostTimeRemaining=this.visual.boostDuration,this.maxLife=10,this.life=this.maxLife,this.active=!0,this._scratchMatrix=new Cesium.Matrix4,this._scratchCartesian=new Cesium.Cartesian3,this._scratchThreeMatrix=new He,this._scratchCameraMatrix=new Cesium.Matrix4,this._scratchRight=new Cesium.Cartesian3,this._scratchForward=new Cesium.Cartesian3,this._scratchUp=new Cesium.Cartesian3,this._scratchRollQuaternion=new Cesium.Quaternion,this._scratchRollMatrix=new Cesium.Matrix3,this.trail=[],this.distanceSinceLastTrail=0,this.distanceSinceLastEmber=0,this.initMesh()}emitDetonation(e,t={}){if(this.hasDetonated||typeof this.onDetonate!="function"){this.hasDetonated=!0;return}this.hasDetonated=!0,this.onDetonate({type:e,missile:this,target:t.target??null,lon:this.lon,lat:this.lat,alt:this.alt,heading:this.heading,pitch:this.pitch})}initMesh(){const e=Id();this.mesh=new Wt,pn(this.mesh),this.modelMount=new Wt,pn(this.modelMount),this.mesh.add(this.modelMount);const t=db(this.visual);this.fallbackBody=t.group,this.modelMount.add(this.fallbackBody),this.exhaustAnchor=new Wt,pn(this.exhaustAnchor),this.exhaustAnchor.position.y=t.tailY,this.mesh.add(this.exhaustAnchor);const n=new ms(1,1,18,1,!0);n.rotateX(Math.PI),n.translate(0,-.5,0),this.outerFlame=new lt(n,new On({color:this.visual.exhaustColor,transparent:!0,opacity:.82,side:on,depthWrite:!1,blending:mn})),pn(this.outerFlame),this.exhaustAnchor.add(this.outerFlame);const i=new ms(1,1,14,1,!0);i.rotateX(Math.PI),i.translate(0,-.5,0),this.innerFlame=new lt(i,new On({color:16777215,transparent:!0,opacity:.94,side:on,depthWrite:!1,blending:mn})),pn(this.innerFlame),this.exhaustAnchor.add(this.innerFlame),this.engineGlow=new hs(new Bi({map:e.glow,color:this.visual.glowColor,transparent:!0,opacity:.98,depthWrite:!1,blending:mn})),pn(this.engineGlow),this.engineGlow.position.y=-.08,this.exhaustAnchor.add(this.engineGlow),this.forwardGlow=new hs(new Bi({map:e.glow,color:16774618,transparent:!0,opacity:.34,depthWrite:!1,blending:mn})),pn(this.forwardGlow),this.forwardGlow.position.y=this.visual.desiredLengthM*(this.visual.renderScale??1)*.45,this.mesh.add(this.forwardGlow),this.engineHotCore=new hs(new Bi({map:e.spark,color:16777215,transparent:!0,opacity:.95,depthWrite:!1,blending:mn})),pn(this.engineHotCore),this.engineHotCore.position.y=-.06,this.exhaustAnchor.add(this.engineHotCore),this.engineLight=new Ph(this.visual.exhaustColor,this.visual.engineLightIntensity,22,2),pn(this.engineLight),this.engineLight.position.y=-.02,this.exhaustAnchor.add(this.engineLight),this.mesh.matrixAutoUpdate=!1,this.scene.add(this.mesh),this.loadVisualModel(),this.updateEngineVisuals()}async loadVisualModel(){const e=await lb(this.visual);if(!e||!this.active||!this.mesh)return;const t=cb(e);this.modelMount.clear(),this.modelMount.add(t),this.exhaustAnchor.position.y=t.userData.tailY??this.exhaustAnchor.position.y}updatePropulsion(e){if(this.boostTimeRemaining>0){this.boostTimeRemaining=Math.max(0,this.boostTimeRemaining-e),this.speed=Math.min(this.boostSpeed,this.speed+this.visual.boostAcceleration*e);return}this.speed=Math.min(this.cruiseSpeed,this.speed+this.visual.sustainAcceleration*e)}updateEngineVisuals(){const e=this.visual.boostDuration>0?this.boostTimeRemaining/this.visual.boostDuration:0,t=.9+Math.random()*.18,n=this.visual.engineConeLength*(.92+e*.72)*t,i=this.visual.engineConeRadius*(.96+e*.24),r=n*.62,a=i*.44;this.outerFlame.scale.set(i,n,i),this.outerFlame.material.opacity=.62+e*.22,this.innerFlame.scale.set(a,r,a),this.innerFlame.material.opacity=.9;const o=this.visual.engineGlowScale*(1+e*.4);this.engineGlow.scale.set(o,o,1),this.engineGlow.material.opacity=.74+e*.18,this.forwardGlow.scale.set(o*.86,o*.86,1),this.forwardGlow.material.opacity=.16+e*.08;const l=.46+e*.12;this.engineHotCore.scale.set(l,l,1),this.engineHotCore.material.opacity=.95,this.engineLight.intensity=this.visual.engineLightIntensity*(.92+e*.26)}update(e,t){if(!this.active){this.trail.length>0&&this.updateTrail(e);return}if(this.life-=e,this.life<=0){this.destroy();return}this.updatePropulsion(e),this.roll=(this.roll+e*this.visual.spinRate)%(Math.PI*2),this.updateEngineVisuals(),this.target&&!this.target.destroyed&&this.trackTarget(e);const n=Hi(this.lon,this.lat,this.alt,this.heading,this.pitch,this.speed*e);if(this.lon=n.lon,this.lat=n.lat,this.alt=n.alt,this.updateTrail(e),this.updateThreeMatrix(),t){const i=this.visual.proximityRadiusM*this.visual.proximityRadiusM;for(const r of t)if(this.calculateDistSqToNPC(r)<i){this.hitNPC(r);return}}this.checkTerrainCollision()}trackTarget(e){const t=Cesium.Cartesian3.fromDegrees(this.target.lon,this.target.lat,this.target.alt),n=Cesium.Cartesian3.fromDegrees(this.lon,this.lat,this.alt),i=Cesium.Cartesian3.subtract(t,n,new Cesium.Cartesian3),r=Cesium.Cartesian3.magnitude(i)||1;Cesium.Cartesian3.normalize(i,i);const a=Cesium.Transforms.eastNorthUpToFixedFrame(n),o=Cesium.Matrix4.inverse(a,new Cesium.Matrix4),l=Cesium.Matrix4.multiplyByPointAsVector(o,i,new Cesium.Cartesian3),c=Cesium.Math.toDegrees(Math.atan2(l.x,l.y)),h=Cesium.Math.toDegrees(Math.asin(l.z)),u=this.boostTimeRemaining>.16&&r>2800?Math.max(h,8):h,d=r<1400?this.visual.terminalTurnRateDeg:this.visual.turnRateDeg;this.heading=ub(this.heading,c,d*e),this.pitch=hb(this.pitch,u,d*.82*e)}spawnTrailParticle(e,t,n){const i=Id(),r=t==="smoke",a=new hs(new Bi({map:r?i.smoke:i.spark,color:r?this.visual.smokeColor:this.visual.emberColor,transparent:!0,opacity:r?this.visual.smokeOpacity:this.visual.emberOpacity,blending:r?zi:mn,depthWrite:!1}));pn(a),a.matrixAutoUpdate=!1,a.lon=e.lon,a.lat=e.lat,a.alt=e.alt,a.isSmoke=r,a.life=r?this.visual.smokeLife:this.visual.emberLife,a.maxLife=a.life,a._scaleStart=r?this.visual.smokeStartScale*(.95+n*.1):this.visual.emberStartScale,a._scaleEnd=r?this.visual.smokeEndScale*(.92+n*.18):this.visual.emberEndScale,a._opacityStart=r?this.visual.smokeOpacity:this.visual.emberOpacity,a._spinSpeed=(Math.random()-.5)*(r?.8:3.8),a._localVel=r?{east:(Math.random()-.5)*2.2,north:(Math.random()-.5)*2.2,up:.9+Math.random()*1.8}:{east:(Math.random()-.5)*1.1,north:(Math.random()-.5)*1.1,up:.2+Math.random()*.6},this.scene.add(a),this.trail.push(a)}updateTrail(e){if(this.active){const n=this.speed*e,i=this.visual.boostDuration>0?this.boostTimeRemaining/this.visual.boostDuration:0,r=Ft.lerp(this.visual.trailIntervalM,this.visual.trailIntervalM*.58,i);for(this.distanceSinceLastTrail+=n;this.distanceSinceLastTrail>=r;){const a=this.distanceSinceLastTrail-r,o=Hi(this.lon,this.lat,this.alt,this.heading,this.pitch,-a);this.distanceSinceLastTrail-=r,this.spawnTrailParticle(o,"smoke",i)}if(i>.04||this.life>this.maxLife*.55)for(this.distanceSinceLastEmber+=n;this.distanceSinceLastEmber>=this.visual.emberIntervalM;){const a=this.distanceSinceLastEmber-this.visual.emberIntervalM,o=Hi(this.lon,this.lat,this.alt,this.heading,this.pitch,-a);this.distanceSinceLastEmber-=this.visual.emberIntervalM,this.spawnTrailParticle(o,"ember",i)}}const t=this.viewer.camera.viewMatrix;for(let n=this.trail.length-1;n>=0;n-=1){const i=this.trail[n];if(i.life-=e*(i.isSmoke?.9:1.18),i.life<=0){this.scene.remove(i),this.trail.splice(n,1);continue}i._localVel.east*=i.isSmoke?.994:.972,i._localVel.north*=i.isSmoke?.994:.972,i._localVel.up+=(i.isSmoke?.42:-5.2)*e;const r=Cesium.Math.toRadians(i.lat);i.lon+=i._localVel.east*e/(111320*Math.max(Math.cos(r),.01)),i.lat+=i._localVel.north*e/111320,i.alt+=i._localVel.up*e;const a=1-i.life/i.maxLife,o=Ft.lerp(i._scaleStart,i._scaleEnd,a);i.material.opacity=i._opacityStart*Math.pow(i.life/i.maxLife,i.isSmoke?1.18:.72),i.material.rotation+=i._spinSpeed*e;const l=Cesium.Cartesian3.fromDegrees(i.lon,i.lat,i.alt,void 0,this._scratchCartesian),c=Cesium.Transforms.eastNorthUpToFixedFrame(l,void 0,this._scratchMatrix),h=Cesium.Matrix4.multiply(t,c,this._scratchCameraMatrix);for(let u=0;u<16;u+=1)this._scratchThreeMatrix.elements[u]=h[u];i.matrix.copy(this._scratchThreeMatrix),i.matrix.scale(new I(o,o,o)),i.updateMatrixWorld(!0)}}updateThreeMatrix(){const e=this.viewer.camera.viewMatrix,t=Cesium.Cartesian3.fromDegrees(this.lon,this.lat,this.alt,void 0,this._scratchCartesian),n=Cesium.Transforms.eastNorthUpToFixedFrame(t,void 0,this._scratchMatrix),i=Cesium.Math.toRadians(this.heading),r=Cesium.Math.toRadians(this.pitch),a=new Cesium.Cartesian3(Math.sin(i)*Math.cos(r),Math.cos(i)*Math.cos(r),Math.sin(r)),o=Cesium.Matrix4.multiplyByPointAsVector(n,a,this._scratchForward);Cesium.Cartesian3.normalize(o,o);const l=new Cesium.Cartesian3(n[8],n[9],n[10]);let c=this._scratchRight;if(Math.abs(Cesium.Cartesian3.dot(o,l))>.999){const m=new Cesium.Cartesian3(n[4],n[5],n[6]);Cesium.Cartesian3.cross(o,m,c)}else Cesium.Cartesian3.cross(o,l,c);Cesium.Cartesian3.normalize(c,c);const h=Cesium.Cartesian3.cross(c,o,this._scratchUp);Cesium.Cartesian3.normalize(h,h),Cesium.Quaternion.fromAxisAngle(o,this.roll,this._scratchRollQuaternion),Cesium.Matrix3.fromQuaternion(this._scratchRollQuaternion,this._scratchRollMatrix),c=Cesium.Matrix3.multiplyByVector(this._scratchRollMatrix,c,c);const u=Cesium.Matrix3.multiplyByVector(this._scratchRollMatrix,h,h),d=this._scratchMatrix;d[0]=c.x,d[1]=c.y,d[2]=c.z,d[3]=0,d[4]=o.x,d[5]=o.y,d[6]=o.z,d[7]=0,d[8]=u.x,d[9]=u.y,d[10]=u.z,d[11]=0,d[12]=t.x,d[13]=t.y,d[14]=t.z,d[15]=1;const f=Cesium.Matrix4.multiply(e,d,this._scratchCameraMatrix);for(let m=0;m<16;m+=1)this._scratchThreeMatrix.elements[m]=f[m];this.mesh.matrix.copy(this._scratchThreeMatrix),this.mesh.updateMatrixWorld(!0)}calculateDistSqToNPC(e){const t=(e.lon-this.lon)*111320*Math.cos(Cesium.Math.toRadians(this.lat)),n=(e.lat-this.lat)*111320,i=e.alt-this.alt;return t*t+n*n+i*i}hitNPC(e){e.destroyed=!0,this.onKill&&this.onKill(e),this.emitDetonation("npc",{target:e});try{Xn.spawnExplosion(this.lon,this.lat,this.alt,{count:84,smokeCount:22,sparkCount:38,big:!0}),Xn.spawnSpark(this.lon,this.lat,this.alt,{count:24}),Xn.spawnWreckage(this.lon,this.lat,this.alt,this.heading,this.pitch,{count:56,sizeMultiplier:1.45,speedMultiplier:1.3,lifeMultiplier:1.2,hotShardRatio:.55}),Le.play("explosion-random")}catch(t){console.warn("Missile hit effect failed.",t)}this.destroy()}checkTerrainCollision(){const e=Cesium.Cartographic.fromDegrees(this.lon,this.lat),t=this.viewer.scene.globe.getHeight(e);if(t!==void 0&&this.alt<t){this.emitDetonation("terrain");try{Xn.spawnExplosion(this.lon,this.lat,this.alt,{count:68,smokeCount:24,sparkCount:28,big:!1}),Xn.spawnSpark(this.lon,this.lat,this.alt,{count:18}),Xn.spawnWreckage(this.lon,this.lat,this.alt,this.heading,this.pitch,{count:28,sizeMultiplier:1.2,speedMultiplier:1.15,lifeMultiplier:1.08,fallMultiplier:2.8,hotShardRatio:.42}),Le.play("explosion-random")}catch(n){console.warn("Missile terrain impact effect failed.",n)}this.destroy()}}destroy(){this.active=!1,this.mesh&&this.scene.remove(this.mesh)}}class pb{constructor(e,t,n,i,r,a,o=null){this.scene=e,this.viewer=t,this.onKill=o,this.lon=n.lon,this.lat=n.lat,this.alt=n.alt,this.heading=i,this.pitch=r,this.speed=a+1500,this.life=3,this.active=!0,this._scratchMatrix=new Cesium.Matrix4,this._scratchCartesian=new Cesium.Cartesian3,this._scratchThreeMatrix=new He,this._scratchCameraMatrix=new Cesium.Matrix4,this.initMesh()}initMesh(){const e=(o,l,c)=>new zn({uniforms:{colorStart:{value:new Pe(16724736)},colorMid:{value:new Pe(16763904)},colorEnd:{value:new Pe(16777215)},opacity:{value:l},intensity:{value:c}},vertexShader:`
					varying vec2 vUv;
					void main() {
						vUv = uv;
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,fragmentShader:`
					uniform vec3 colorStart;
					uniform vec3 colorMid;
					uniform vec3 colorEnd;
					uniform float opacity;
					uniform float intensity;
					varying vec2 vUv;
					void main() {
						float t = clamp(vUv.y, 0.0, 1.0);
						vec3 a = mix(colorStart, colorMid, smoothstep(0.0, 0.5, t));
						vec3 b = mix(colorMid, colorEnd, smoothstep(0.5, 1.0, t));
						vec3 col = mix(a, b, smoothstep(0.0, 1.0, t));
						float alpha = opacity * pow(t, 0.6) * intensity;
						float edge = 1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5) * 2.0);
						alpha *= edge;
						gl_FragColor = vec4(col, alpha);
					}
				`,transparent:!0,depthWrite:!1,blending:mn,side:on});this.mesh=new Wt;const n=(o,l,c,h)=>{const u=new ta(o,l,1,1);u.translate(0,-l/2,0);const d=e(o,c,h);return new lt(u,d)};for(let o=0;o<3;o++){const l=n(.6,20,1,1);l.rotateY(o*Math.PI*2/3),this.mesh.add(l)}for(let o=0;o<3;o++){const l=n(1.6,22,.35,.65);l.rotateY(o*Math.PI*2/3+Math.PI/6),this.mesh.add(l)}const i=new ms(.12,.8,12);i.translate(0,-.4,0);const r=new On({color:16777215,transparent:!0,opacity:1,blending:mn,depthWrite:!1}),a=new lt(i,r);this.mesh.add(a),this.mesh.matrixAutoUpdate=!1,this.scene.add(this.mesh)}update(e,t){if(!this.active)return;if(this.life-=e,this.life<=0){this.destroy();return}const n=Hi(this.lon,this.lat,this.alt,this.heading,this.pitch,this.speed*e);if(this.lon=n.lon,this.lat=n.lat,this.alt=n.alt,this.updateThreeMatrix(),t){for(const i of t)if(this.calculateDistSqToNPC(i)<400){this.hitNPC(i);return}}this.checkTerrainCollision()}updateThreeMatrix(){const e=this.viewer.camera.viewMatrix,t=Cesium.Cartesian3.fromDegrees(this.lon,this.lat,this.alt,void 0,this._scratchCartesian),n=Cesium.Transforms.eastNorthUpToFixedFrame(t,void 0,this._scratchMatrix),i=Cesium.Math.toRadians(this.heading),r=Cesium.Math.toRadians(this.pitch),a=new Cesium.Cartesian3(Math.sin(i)*Math.cos(r),Math.cos(i)*Math.cos(r),Math.sin(r)),o=Cesium.Matrix4.multiplyByPointAsVector(n,a,new Cesium.Cartesian3);Cesium.Cartesian3.normalize(o,o);const l=new Cesium.Cartesian3(n[8],n[9],n[10]);let c=new Cesium.Cartesian3;if(Math.abs(Cesium.Cartesian3.dot(o,l))>.999){const f=new Cesium.Cartesian3(n[4],n[5],n[6]);Cesium.Cartesian3.cross(o,f,c)}else Cesium.Cartesian3.cross(o,l,c);Cesium.Cartesian3.normalize(c,c);const h=Cesium.Cartesian3.cross(c,o,new Cesium.Cartesian3),u=this._scratchMatrix;u[0]=c.x,u[1]=c.y,u[2]=c.z,u[3]=0,u[4]=o.x,u[5]=o.y,u[6]=o.z,u[7]=0,u[8]=h.x,u[9]=h.y,u[10]=h.z,u[11]=0,u[12]=t.x,u[13]=t.y,u[14]=t.z,u[15]=1;const d=Cesium.Matrix4.multiply(e,u,this._scratchCameraMatrix);for(let f=0;f<16;f++)this._scratchThreeMatrix.elements[f]=d[f];this.mesh.matrix.copy(this._scratchThreeMatrix),this.mesh.updateMatrixWorld(!0)}calculateDistSqToNPC(e){const t=(e.lon-this.lon)*111320*Math.cos(Cesium.Math.toRadians(this.lat)),n=(e.lat-this.lat)*111320,i=e.alt-this.alt;return t*t+n*n+i*i}hitNPC(e){e.destroyed=!0,this.onKill&&this.onKill(e);try{Xn.spawnExplosion(this.lon,this.lat,this.alt,{count:36,smokeCount:8,big:!0}),Xn.spawnWreckage(this.lon,this.lat,this.alt,this.heading,this.pitch,{count:18});try{Le.play("explosion-random")}catch{}}catch{}this.destroy()}checkTerrainCollision(){const e=Cesium.Cartographic.fromDegrees(this.lon,this.lat),t=this.viewer.scene.globe.getHeight(e);if(t!==void 0&&this.alt<t){try{Xn.spawnSpark(this.lon,this.lat,this.alt,{count:10})}catch{}this.destroy()}}destroy(){this.active=!1,this.scene.remove(this.mesh)}}class mb{constructor(e,t,n,i,r,a){this.scene=e,this.viewer=t,this.lon=n.lon,this.lat=n.lat,this.alt=n.alt,this.heading=i+180+(Math.random()-.5)*40,this.pitch=r-15-Math.random()*20,this.speed=a*.5,this.gravity=5,this.verticalVelocity=0,this.life=4,this.maxLife=4,this.active=!0,this._scratchCartesian=new Cesium.Cartesian3,this._scratchMatrix=new Cesium.Matrix4,this._scratchCameraMatrix=new Cesium.Matrix4,this._scratchThreeMatrix=new He,this.trail=[],this.distanceSinceLastTrail=0,this.initMesh()}initMesh(){this.group=new Wt,this.group.matrixAutoUpdate=!1;const e=64,t=document.createElement("canvas");t.width=e,t.height=e;const n=t.getContext("2d"),i=n.createRadialGradient(e/2,e/2,0,e/2,e/2,e/2);i.addColorStop(0,"#ffffff"),i.addColorStop(.2,"#ffff66"),i.addColorStop(.5,"#ffff00"),i.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=i,n.fillRect(0,0,e,e);const r=new Th(t),a=new Bi({map:r,color:16777028,transparent:!0,blending:mn,depthWrite:!1});this.flareSprite=new hs(a),this.flareSprite.scale.set(1.5,1.5,1),this.group.add(this.flareSprite);const o=new Bi({map:r,color:16755200,transparent:!0,opacity:.8,blending:mn,depthWrite:!1});this.glowSprite=new hs(o),this.glowSprite.scale.set(4,4,1),this.group.add(this.glowSprite),this.scene.add(this.group)}update(e){if(!this.active)return;if(this.life-=e,this.life<=0){this.destroy();return}const t=this.speed*e,n=this.calculateMove(t);this.lon=n.lon,this.lat=n.lat,this.alt=n.alt,this.verticalVelocity-=this.gravity*e,this.alt+=this.verticalVelocity*e,this.speed*=.98,this.updateThreeMatrix(),this._spawnTrailIfNeeded(e),this._updateTrail(e);const i=this.life/this.maxLife;if(this.flareSprite){this.flareSprite.material.opacity=Math.min(1,i*1.5);const r=.9+Math.random()*.2;this.flareSprite.scale.set(1.5*r,1.5*r,1)}if(this.glowSprite){this.glowSprite.material.opacity=Math.min(.8,i*1.2);const r=.8+Math.random()*.4;this.glowSprite.scale.set(4*r,4*r,1)}}calculateMove(e){const t=Cesium.Math.toRadians(this.heading),n=Cesium.Math.toRadians(this.pitch),i=6371e3,r=e*Math.cos(t)*Math.cos(n)/i,a=e*Math.sin(t)*Math.cos(n)/(i*Math.cos(Cesium.Math.toRadians(this.lat))),o=e*Math.sin(n);return{lon:this.lon+Cesium.Math.toDegrees(a),lat:this.lat+Cesium.Math.toDegrees(r),alt:this.alt+o}}updateThreeMatrix(){const e=this.viewer.camera.viewMatrix,t=Cesium.Cartesian3.fromDegrees(this.lon,this.lat,this.alt),n=Cesium.Transforms.eastNorthUpToFixedFrame(t,void 0,this._scratchMatrix),i=Cesium.Matrix4.multiply(e,n,this._scratchCameraMatrix);for(let r=0;r<16;r++)this._scratchThreeMatrix.elements[r]=i[r];this.group.matrix.copy(this._scratchThreeMatrix),this.group.updateMatrixWorld(!0)}_spawnTrailIfNeeded(e){this.distanceSinceLastTrail+=(this.speed+Math.abs(this.verticalVelocity))*e;const t=3;for(;this.distanceSinceLastTrail>=t;){const i=(this.distanceSinceLastTrail-t)/((this.speed+Math.abs(this.verticalVelocity))*e||1),r=this.lon,a=this.lat,o=this.alt-this.verticalVelocity*e*i;this.distanceSinceLastTrail-=t;const l=new Ro(1,12,12),c=.4+Math.random()*.4,h=new On({color:new Pe(c,c,c),transparent:!0,opacity:.5+Math.random()*.2}),u=new lt(l,h);u.lon=r,u.lat=a,u.alt=o,u.life=2+Math.random()*1.5,u.maxLife=u.life,u.matrixAutoUpdate=!1,this.scene.add(u),this.trail.push(u)}}_updateTrail(e){const t=this.viewer.camera.viewMatrix;for(let n=this.trail.length-1;n>=0;n--){const i=this.trail[n];if(i.life-=e,i.life<=0){this.scene.remove(i),this.trail.splice(n,1);continue}i.randomScale||(i.randomScale=.5+Math.random()*.5);const r=i.life/i.maxLife,a=i.randomScale*(1+(1-r)*8);i.scale.set(a,a,a),i.material.opacity=r*.4;const o=Cesium.Cartesian3.fromDegrees(i.lon,i.lat,i.alt,void 0,this._scratchCartesian),l=Cesium.Transforms.eastNorthUpToFixedFrame(o,void 0,this._scratchMatrix),c=Cesium.Matrix4.multiply(t,l,this._scratchCameraMatrix);for(let h=0;h<16;h++)this._scratchThreeMatrix.elements[h]=c[h];i.matrix.copy(this._scratchThreeMatrix),i.matrix.scale(new I(a,a,a)),i.updateMatrixWorld(!0),i.alt+=.5*e}}destroy(){this.active=!1,this.group&&this.scene.remove(this.group);for(const e of this.trail)this.scene.remove(e);this.trail=[]}}class gb{constructor(e,t,n){this.viewer=e,this.scene=t,this.playerModel=n,this.weapons=[{id:"gun",name:"M61A1 기관포",ammo:1/0,maxAmmo:1/0,fireRate:.05,lastFire:0},{id:"missile",name:"AAM 미사일",ammo:50,maxAmmo:50,fireRate:1,lastFire:0,type:"AAM"}],this.flareWeapon={id:"flare",name:"MJU-7A 플레어",ammo:30,maxAmmo:30,fireRate:.2,lastFire:0},this.selectedWeaponIndex=0,this.projectiles=[],this.flares=[],this.onKill=null,this.target=null,this.isGunOverheated=!1,this.gunHeat=0,this.lockTime=0,this.lockRequiredTime=2,this.lockStatus="NONE",this.lockingTarget=null,this.flareQueue=0,this.flareInterval=.15,this.lastFlarePulse=0,this.lastMissileSide=!1,this.missileSelectionMode="auto",this.missileSelectionIds=sb(),this.manualMissileVisualIndex=0,this.lastLaunchedMissile=null,this.onMissileLaunch=null,this.onMissileDetonate=null,this.emptyWarningTimers={gun:0,missile:0,flare:0},this.lastEmptyWarningSoundTime=0}resetAmmo(){this.selectedWeaponIndex=0;for(const e of this.weapons)typeof e.maxAmmo<"u"&&(e.ammo=e.maxAmmo);this.flareWeapon&&typeof this.flareWeapon.maxAmmo<"u"&&(this.flareWeapon.ammo=this.flareWeapon.maxAmmo),this.gunHeat=0,this.isGunOverheated=!1,this.emptyWarningTimers={gun:0,missile:0,flare:0}}clearProjectiles(){for(const e of this.projectiles)if(e.active=!1,e.mesh&&this.scene.remove(e.mesh),e.group&&this.scene.remove(e.group),Array.isArray(e.trail)){for(const t of e.trail)this.scene.remove(t);e.trail=[]}for(const e of this.flares)typeof e.destroy=="function"&&e.destroy();this.projectiles=[],this.flares=[],this.lastLaunchedMissile=null}getCurrentWeapon(){return this.weapons[this.selectedWeaponIndex]}toggleWeapon(){this.selectedWeaponIndex=(this.selectedWeaponIndex+1)%this.weapons.length;try{Le.play("weapon-switch")}catch{}}selectWeapon(e){e>=0&&e<this.weapons.length&&(this.selectedWeaponIndex=e);try{Le.play("weapon-switch")}catch{}}cycleMissileProfile(){const e=["auto",...this.missileSelectionIds],t=e.indexOf(this.getCurrentMissileSelectionMode()),n=e[(t+1)%e.length];n==="auto"?this.missileSelectionMode="auto":(this.missileSelectionMode="manual",this.manualMissileVisualIndex=Math.max(0,this.missileSelectionIds.indexOf(n)));try{Le.play("weapon-switch")}catch{}}getCurrentMissileSelectionMode(){return this.missileSelectionMode!=="manual"?"auto":this.missileSelectionIds[this.manualMissileVisualIndex]??this.missileSelectionIds[0]??Ga(0)}getManualMissileVisualId(){return this.missileSelectionIds[this.manualMissileVisualIndex]??this.missileSelectionIds[0]??Ga(0)}getMissileProfileStatus(e=null,t=null){const n=this.getCurrentMissileSelectionMode(),i=n==="auto"?this.getAutoMissileVisualId(e,t):this.getManualMissileVisualId(),r=Kc(i),a=n==="auto"?`AUTO · ${r.label}`:`MAN · ${r.label}`;return{mode:n==="auto"?"auto":"manual",selectedVisualId:n==="auto"?"auto":i,resolvedVisualId:i,label:r.label,shortLabel:a}}getActiveMissiles(){return this.projectiles.filter(e=>e?.isMissile===!0)}getLatestActiveMissile(){if(this.lastLaunchedMissile?.active)return this.lastLaunchedMissile;for(let e=this.projectiles.length-1;e>=0;e-=1){const t=this.projectiles[e];if(t?.isMissile===!0&&t.active)return this.lastLaunchedMissile=t,t}return null}calculateWeaponPos(e){if(!this.playerModel||!this.viewer)return null;const t=this.playerModel.scale.x,n=e.clone().multiplyScalar(t);n.applyQuaternion(this.playerModel.quaternion),n.add(this.playerModel.position);const i=75,r=Cesium.Math.toDegrees(this.viewer.camera.frustum.fovy),a=Math.tan(Cesium.Math.toRadians(r)*.5)/Math.tan(Cesium.Math.toRadians(i)*.5);n.x*=a,n.y*=a;const o=this.viewer.camera,l=o.right,c=o.up,h=o.direction,u=new Cesium.Cartesian3,d=Cesium.Cartesian3.multiplyByScalar(l,n.x,new Cesium.Cartesian3),f=Cesium.Cartesian3.multiplyByScalar(c,n.y,new Cesium.Cartesian3),m=Cesium.Cartesian3.multiplyByScalar(h,-n.z,new Cesium.Cartesian3);Cesium.Cartesian3.add(d,f,u),Cesium.Cartesian3.add(u,m,u);const _=o.positionWC,g=new Cesium.Cartesian3;Cesium.Cartesian3.add(_,u,g);const p=Cesium.Cartographic.fromCartesian(g);return{lon:Cesium.Math.toDegrees(p.longitude),lat:Cesium.Math.toDegrees(p.latitude),alt:p.height}}fire(e,t=null){const n=t?this.weapons.find(a=>a.id===t):this.weapons[this.selectedWeaponIndex];if(!n)return;const i=performance.now()*.001;if(n.ammo<=0){if(i-this.lastEmptyWarningSoundTime>2){this.emptyWarningTimers[n.id]=1,this.lastEmptyWarningSoundTime=i;try{Le.play("weapon-warning")}catch{}}return}if(n.id==="gun"&&this.isGunOverheated||i-n.lastFire<n.fireRate||n.id==="missile"&&this.lockStatus!=="LOCKED")return;n.lastFire=i,n.ammo!==1/0&&n.ammo--;const r={lon:e.lon,lat:e.lat,alt:e.alt};if(n.id==="gun"){if(this.gunHeat+=.02,this.gunHeat>=1){this.isGunOverheated=!0;try{Le.play("weapon-warning")}catch{}}const a=new I(0,0,0),o=this.calculateWeaponPos(a)||Hi(r.lon,r.lat,r.alt,e.heading,e.pitch,5),l=new pb(this.scene,this.viewer,o,e.heading,e.pitch,e.speed,this.onKill);this.projectiles.push(l)}else if(n.id==="missile"){this.lastMissileSide=!this.lastMissileSide;const a=this.lastMissileSide?1:-1,o=new I(18*a,-11,-34),l=this.calculateWeaponPos(o)||r,c=this.target,h=this.getMissileVisualId(e,c),u=Kc(h),d=new fb(this.scene,this.viewer,l,e.heading,e.pitch,e.speed,c,this.onKill,{visualId:h,onDetonate:f=>{typeof this.onMissileDetonate=="function"&&this.onMissileDetonate({...f,visualId:h,visualLabel:u.label})}});this.projectiles.push(d),this.lastLaunchedMissile=d,typeof this.onMissileLaunch=="function"&&this.onMissileLaunch({missile:d,visualId:h,visualLabel:u.label,target:c});try{Le.play("missile-fire")}catch{}}}getMissileVisualId(e,t){return this.missileSelectionMode==="manual"?this.getManualMissileVisualId():this.getAutoMissileVisualId(e,t)}getAutoMissileVisualId(e,t){return Ga(!t||!e?0:this.calculateDist(e,t))}fireFlare(e){const t=this.flareWeapon,n=performance.now()*.001;if(!t||t.ammo<=0){if(n-this.lastEmptyWarningSoundTime>2){this.emptyWarningTimers.flare=1,this.lastEmptyWarningSoundTime=n;try{Le.play("weapon-warning")}catch{}}return}n-t.lastFire<1||(t.ammo--,t.lastFire=n,this.flareQueue=6,this.lastFlarePulse=0)}_spawnSingleFlare(e){const t=new I(0,-10,6),n=this.calculateWeaponPos(t)||{lon:e.lon,lat:e.lat,alt:e.alt},i=new mb(this.scene,this.viewer,n,e.heading,e.pitch,e.speed);this.flares.push(i)}update(e,t,n=null){const i=this.lockStatus,r=this.getCurrentWeapon();try{n&&n.fire&&r.id==="gun"&&!this.isGunOverheated&&r.ammo>0?Le.isPlaying("m61-firing")||Le.play("m61-firing"):Le.isPlaying("m61-firing")&&Le.stop("m61-firing")}catch{}if(r.id==="missile"){const o=this.findPotentialTarget(t);o?this.lockingTarget===o?(this.lockTime+=e,this.lockTime>=this.lockRequiredTime?(this.lockStatus="LOCKED",this.target=o):this.lockStatus="LOCKING"):(this.lockingTarget=o,this.lockTime=0,this.lockStatus="LOCKING",this.target=null):(this.lockingTarget=null,this.lockTime=0,this.lockStatus="NONE",this.target=null)}else this.lockingTarget=null,this.lockTime=0,this.lockStatus="NONE",this.target=null;try{this.lockStatus==="LOCKING"?Le.isPlaying("rwr-tws")||Le.play("rwr-tws"):Le.isPlaying("rwr-tws")&&Le.stop("rwr-tws"),i!==this.lockStatus&&this.lockStatus==="LOCKED"&&Le.play("rwr-lock"),i==="LOCKED"&&this.lockStatus!=="LOCKED"&&Le.isPlaying("rwr-lock")&&Le.stop("rwr-lock")}catch{}this.flareQueue>0&&(this.lastFlarePulse+=e,(this.lastFlarePulse>=this.flareInterval||this.flareQueue===6)&&(this._spawnSingleFlare(t),this.flareQueue--,this.lastFlarePulse=0)),this.gunHeat>0&&(this.gunHeat-=e*.2,this.gunHeat<=0&&(this.gunHeat=0,this.isGunOverheated=!1),this.isGunOverheated&&this.gunHeat<.3&&(this.isGunOverheated=!1));for(const o in this.emptyWarningTimers)this.emptyWarningTimers[o]>0&&(this.emptyWarningTimers[o]-=e,this.emptyWarningTimers[o]<0&&(this.emptyWarningTimers[o]=0));const a=t.npcs||[];for(let o=this.projectiles.length-1;o>=0;o--){const l=this.projectiles[o];l.update(e,a);const c=l.trail&&l.trail.length>0;!l.active&&!c&&(this.lastLaunchedMissile===l&&(this.lastLaunchedMissile=null),this.projectiles.splice(o,1))}for(let o=this.flares.length-1;o>=0;o--){const l=this.flares[o];l.update(e),l.active||this.flares.splice(o,1)}}findPotentialTarget(e){if(!e.npcs||e.npcs.length===0)return null;let t=null,n=.985;for(const i of e.npcs){if(i.destroyed)continue;const r=this.calculateDotProduct(e,i);r>n&&this.calculateDist(e,i)<1e4&&(t=i,n=r)}return t}calculateDotProduct(e,t){const n=Cesium.Math.toRadians(e.heading),i=Cesium.Math.toRadians(e.pitch),r=new I(Math.sin(n)*Math.cos(i),Math.sin(i),Math.cos(n)*Math.cos(i)),a=(t.lon-e.lon)*111320*Math.cos(Cesium.Math.toRadians(e.lat)),o=(t.lat-e.lat)*111320,l=t.alt-e.alt,c=new I(a,l,o).normalize();return r.dot(c)}calculateDist(e,t){const n=(t.lon-e.lon)*111320*Math.cos(Cesium.Math.toRadians(e.lat)),i=(t.lat-e.lat)*111320,r=t.alt-e.alt;return Math.sqrt(n*n+i*i+r*r)}}const Nd=6378137,_b=1e-4,Nn={projectiles:{artillery:"/3d-bundles/artillery/models/artillery_shell.glb",aircraft:"/3d-bundles/missile/aim-120c_amraam.glb",armor:"/3d-bundles/artillery/models/artillery_shell.glb"},textures:{headGlow:"/3d-bundles/effects/textures/focus-fire/head_glow.png",launchMuzzle:"/3d-bundles/effects/textures/focus-fire/launch_muzzle.png",trailTrace:"/3d-bundles/effects/textures/focus-fire/trail_trace.png",trailSmoke:"/3d-bundles/effects/textures/focus-fire/trail_smoke.png",impactExplosion:"/3d-bundles/effects/textures/impact/explosion.png",impactFlash:"/3d-bundles/effects/textures/focus-fire/impact_flash.png",impactSmoke:"/3d-bundles/effects/textures/focus-fire/impact_smoke.png",impactDust:"/3d-bundles/effects/textures/focus-fire/impact_dust.png"}},Dd=new Cesium.Matrix4,Fd=new Cesium.Matrix4,Er=new Cesium.Cartesian3,Vs=new Cesium.Cartesian3,qa=new Cesium.HeadingPitchRoll;function xt(s,e,t){return Math.max(e,Math.min(t,s))}function Sn(s,e,t){return s+(e-s)*t}function ss(s,e){return s+Math.random()*(e-s)}function _p(s){return(s%360+360)%360}function je(s,e=1){return Cesium.Color.fromCssColorString(s).withAlpha(e)}function Ud(s,e,t,n){const i=Cesium.Math.toRadians(_p(n)),r=Cesium.Math.toRadians(e),a=t*Math.cos(i)/Nd,o=t*Math.sin(i)/(Nd*Math.max(.2,Math.cos(r)));return{lon:s+Cesium.Math.toDegrees(o),lat:e+Cesium.Math.toDegrees(a)}}function Di(s){return Cesium.Cartesian3.fromDegrees(s.lon,s.lat,s.alt)}function Ol(s,e){const t=new Cesium.EllipsoidGeodesic(Cesium.Cartographic.fromDegrees(s.lon,s.lat),Cesium.Cartographic.fromDegrees(e.lon,e.lat));return Number.isFinite(t.surfaceDistance)?t.surfaceDistance:0}function Od(s,e,t={}){if(Cesium.Cartesian3.subtract(e,s,Er),Cesium.Cartesian3.magnitudeSquared(Er)<_b)return Cesium.Quaternion.IDENTITY;Cesium.Cartesian3.normalize(Er,Er),Cesium.Transforms.eastNorthUpToFixedFrame(s,void 0,Dd),Cesium.Matrix4.inverseTransformation(Dd,Fd),Cesium.Matrix4.multiplyByPointAsVector(Fd,Er,Vs);const n=Math.hypot(Vs.x,Vs.y);return qa.heading=Math.atan2(Vs.x,Vs.y)+(t.heading??0),qa.pitch=Math.atan2(Vs.z,Math.max(n,1e-4))+(t.pitch??0),qa.roll=t.roll??0,Cesium.Transforms.headingPitchRollQuaternion(s,qa)}function Bd(s){switch(s){case"aircraft":return{color:"#7fe7ff",modelUri:Nn.projectiles.aircraft,modelScale:2.2,minimumPixelSize:64,maximumScale:240,modelColorAlpha:.92,colorBlendAmount:.22,silhouetteAlpha:.66,silhouetteSize:1.9,trailWidth:2.5,trailGlowPower:.18,headGlowScale:.92,headGlowAlpha:.94,headCoreSize:10,trailSpriteImage:Nn.textures.trailTrace,trailSpriteScale:.72,trailSpriteAlpha:.82,trailLag:.05,launchScale:.4,impactScale:.82,impactFlashScale:.68,smokeScale:.84,dustScale:.5,impactRadius:132,impactLifetime:1.45,orientationOffsets:{roll:0}};case"armor":return{color:"#ffd166",modelUri:Nn.projectiles.armor,modelScale:.82,minimumPixelSize:28,maximumScale:96,modelColorAlpha:.8,colorBlendAmount:.28,silhouetteAlpha:.58,silhouetteSize:1.25,trailWidth:2.1,trailGlowPower:.26,headGlowScale:.44,headGlowAlpha:.82,headCoreSize:7,trailSpriteImage:Nn.textures.trailSmoke,trailSpriteScale:.36,trailSpriteAlpha:.46,trailLag:.035,launchScale:.26,impactScale:.58,impactFlashScale:.5,smokeScale:.72,dustScale:.48,impactRadius:90,impactLifetime:1.2,orientationOffsets:{roll:0}};default:return{color:"#ffb347",modelUri:Nn.projectiles.artillery,modelScale:1.08,minimumPixelSize:34,maximumScale:112,modelColorAlpha:.84,colorBlendAmount:.26,silhouetteAlpha:.6,silhouetteSize:1.4,trailWidth:3.25,trailGlowPower:.32,headGlowScale:.58,headGlowAlpha:.88,headCoreSize:8,trailSpriteImage:Nn.textures.trailSmoke,trailSpriteScale:.42,trailSpriteAlpha:.52,trailLag:.045,launchScale:.32,impactScale:.92,impactFlashScale:.58,smokeScale:1,dustScale:.62,impactRadius:165,impactLifetime:1.55,orientationOffsets:{roll:0}}}}function xb(){return{objectiveLon:null,objectiveLat:null,objectiveName:"집중포격 목표",active:!1,captureProgress:0,aircraftCount:0,artilleryCount:0,armorCount:0,weaponsInFlight:0,launchPlatforms:[],weaponTracks:[],statusLabel:"대기"}}class vb{constructor(e){this.viewer=e,this.focusState=xb(),this.projectiles=[],this.impacts=[],this.renderedTrackIds=new Set,this.launchPlatformMarkers=new Map,this.objectiveMarker=null,this.objectiveRing=null,this.objectiveLabel=null}hasObjective(){return Number.isFinite(this.focusState.objectiveLon)&&Number.isFinite(this.focusState.objectiveLat)}getTerrainHeight(e,t,n=0){const i=this.viewer?.scene?.globe;if(!i)return n;const r=i.getHeight(Cesium.Cartographic.fromDegrees(e,t));return Number.isFinite(r)?r:n}clearProjectiles(){for(const e of this.projectiles)this.viewer.entities.remove(e.headEntity),this.viewer.entities.remove(e.headCoreEntity),this.viewer.entities.remove(e.headGlowEntity),this.viewer.entities.remove(e.trailEntity),this.viewer.entities.remove(e.trailSpriteEntity),e.launchFlash&&this.viewer.entities.remove(e.launchFlash);this.projectiles=[],this.renderedTrackIds.clear();for(const e of this.impacts)this.viewer.entities.remove(e.ringEntity),this.viewer.entities.remove(e.flashEntity),this.viewer.entities.remove(e.fireballEntity),this.viewer.entities.remove(e.smokeEntity),this.viewer.entities.remove(e.dustEntity);this.impacts=[]}removeObjectiveEntities(){this.objectiveMarker&&(this.viewer.entities.remove(this.objectiveMarker),this.objectiveMarker=null),this.objectiveRing&&(this.viewer.entities.remove(this.objectiveRing),this.objectiveRing=null),this.objectiveLabel&&(this.viewer.entities.remove(this.objectiveLabel),this.objectiveLabel=null)}removeLaunchPlatformEntities(){for(const e of this.launchPlatformMarkers.values())e.pointEntity&&this.viewer.entities.remove(e.pointEntity),e.ringEntity&&this.viewer.entities.remove(e.ringEntity),e.labelEntity&&this.viewer.entities.remove(e.labelEntity);this.launchPlatformMarkers.clear()}setState(e={}){const t=this.focusState,n={objectiveLon:Number.isFinite(Number(e.objectiveLon))?Number(e.objectiveLon):null,objectiveLat:Number.isFinite(Number(e.objectiveLat))?Number(e.objectiveLat):null,objectiveName:typeof e.objectiveName=="string"&&e.objectiveName.trim().length>0?e.objectiveName.trim():"집중포격 목표",active:e.active===!0,captureProgress:xt(Number(e.captureProgress)||0,0,100),aircraftCount:Math.max(0,Math.floor(Number(e.aircraftCount)||0)),artilleryCount:Math.max(0,Math.floor(Number(e.artilleryCount)||0)),armorCount:Math.max(0,Math.floor(Number(e.armorCount)||0)),weaponsInFlight:Math.max(0,Math.floor(Number(e.weaponsInFlight)||0)),launchPlatforms:Array.isArray(e.launchPlatforms)?e.launchPlatforms.filter(r=>Number.isFinite(Number(r?.latitude))&&Number.isFinite(Number(r?.longitude))):[],weaponTracks:Array.isArray(e.weaponTracks)?e.weaponTracks.filter(r=>typeof r?.id=="string"&&Number.isFinite(Number(r?.launcherLatitude))&&Number.isFinite(Number(r?.launcherLongitude))&&Number.isFinite(Number(r?.targetLatitude))&&Number.isFinite(Number(r?.targetLongitude))):[],statusLabel:typeof e.statusLabel=="string"&&e.statusLabel.trim().length>0?e.statusLabel.trim():"대기"},i=n.objectiveLon!==t.objectiveLon||n.objectiveLat!==t.objectiveLat;if(this.focusState=n,!this.hasObjective()){this.clearProjectiles(),this.removeObjectiveEntities(),this.removeLaunchPlatformEntities();return}i&&this.clearProjectiles(),this.ensureObjectiveEntities(),this.syncLaunchPlatformMarkers(),this.syncWeaponTrackProjectiles(t,n)}ensureObjectiveEntities(){if(!this.hasObjective()){this.removeObjectiveEntities();return}const e=this.getTerrainHeight(this.focusState.objectiveLon,this.focusState.objectiveLat,0),t=Cesium.Cartesian3.fromDegrees(this.focusState.objectiveLon,this.focusState.objectiveLat,e+18);this.objectiveMarker||(this.objectiveMarker=this.viewer.entities.add({position:t,point:{pixelSize:10,color:je("#ffb347",.95),outlineColor:Cesium.Color.WHITE,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY}})),this.objectiveRing||(this.objectiveRing=this.viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(this.focusState.objectiveLon,this.focusState.objectiveLat,e+2),ellipse:{semiMajorAxis:650,semiMinorAxis:650,material:je("#ff8c42",.12),outline:!0,outlineColor:je("#ffd166",.95),outlineWidth:2,height:0}})),this.objectiveLabel||(this.objectiveLabel=this.viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(this.focusState.objectiveLon,this.focusState.objectiveLat,e+320),label:{text:"",font:"700 15px Bahnschrift, sans-serif",fillColor:Cesium.Color.WHITE,outlineColor:je("#241003",.98),outlineWidth:5,style:Cesium.LabelStyle.FILL_AND_OUTLINE,verticalOrigin:Cesium.VerticalOrigin.BOTTOM,disableDepthTestDistance:Number.POSITIVE_INFINITY,pixelOffset:new Cesium.Cartesian2(0,-10)}})),this.objectiveMarker.position=t,this.objectiveRing.position=Cesium.Cartesian3.fromDegrees(this.focusState.objectiveLon,this.focusState.objectiveLat,e+2),this.objectiveLabel.position=Cesium.Cartesian3.fromDegrees(this.focusState.objectiveLon,this.focusState.objectiveLat,e+320),this.objectiveLabel.label.text=[this.focusState.objectiveName,`${this.focusState.statusLabel} · 점령 ${Math.round(this.focusState.captureProgress)}%`,`탄체 ${this.focusState.weaponsInFlight} · 포대 ${this.focusState.artilleryCount} / 기갑 ${this.focusState.armorCount} / 항공 ${this.focusState.aircraftCount}`].join(`
`)}getLaunchPlatformMarkerStyle(e,t){switch(e){case"armor":return{color:t?"#ffd166":"#d4a94d",ringColor:t?"#ffd166":"#c7952e",labelColor:"#ffe7a2",labelPrefix:"기갑"};case"aircraft":return{color:t?"#7fe7ff":"#4db7df",ringColor:t?"#7fe7ff":"#4db7df",labelColor:"#bfefff",labelPrefix:"항공"};default:return{color:t?"#ffb347":"#ff8c42",ringColor:t?"#ffd166":"#ff9f63",labelColor:"#fff1da",labelPrefix:"포대"}}}getDisplayedLaunchPlatforms(){return this.focusState.launchPlatforms}getDisplayedWeaponTracks(e=this.focusState){return e.weaponTracks}getActiveLaunchPlatforms(e=[],t={}){const n=t.launchedOnly===!0,i=e.filter(a=>!a||typeof a.id!="string"?!1:n?a.launched===!0:!0);if(n)return i;const r=i.filter(a=>a.launched===!0);return r.length>0?r:i}getLaunchPlatformVolleyWeight(e){switch(e?.variant){case"aircraft":return 1;case"armor":return 2;default:return 3}}getLaunchPlatformVolleyPattern(e=[],t={}){const n=this.getActiveLaunchPlatforms(e,t),i=[];return n.forEach(r=>{const a=this.getLaunchPlatformVolleyWeight(r);for(let o=0;o<a;o+=1)i.push(r)}),i}getNewlyLaunchedPlatforms(e=[],t=[]){const n=new Map(e.filter(i=>i&&typeof i.id=="string").map(i=>[i.id,i.launched===!0]));return t.filter(i=>i&&typeof i.id=="string"&&i.launched===!0&&n.get(i.id)!==!0)}syncLaunchPlatformMarkers(){if(!this.hasObjective()){this.removeLaunchPlatformEntities();return}const e=this.getDisplayedLaunchPlatforms();if(e.length===0){this.removeLaunchPlatformEntities();return}const t=new Set(e.map(n=>n.id));for(const[n,i]of this.launchPlatformMarkers.entries())t.has(n)||(i.pointEntity&&this.viewer.entities.remove(i.pointEntity),i.ringEntity&&this.viewer.entities.remove(i.ringEntity),i.labelEntity&&this.viewer.entities.remove(i.labelEntity),this.launchPlatformMarkers.delete(n));e.forEach(n=>{const i=this.getLaunchPlatformMarkerStyle(n.variant,n.launched),r=this.getTerrainHeight(n.longitude,n.latitude,n.altitudeMeters),a=Cesium.Cartesian3.fromDegrees(n.longitude,n.latitude,r+20),o=Cesium.Cartesian3.fromDegrees(n.longitude,n.latitude,r+2),l=Cesium.Cartesian3.fromDegrees(n.longitude,n.latitude,r+170);let c=this.launchPlatformMarkers.get(n.id);c||(c={pointEntity:this.viewer.entities.add({position:a,point:{pixelSize:9,color:je(i.color,.95),outlineColor:Cesium.Color.WHITE,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY}}),ringEntity:this.viewer.entities.add({position:o,ellipse:{semiMajorAxis:210,semiMinorAxis:210,material:je(i.ringColor,.08),outline:!0,outlineColor:je(i.ringColor,.85),outlineWidth:2,height:0}}),labelEntity:this.viewer.entities.add({position:l,label:{text:"",font:"600 12px Bahnschrift, sans-serif",fillColor:je(i.labelColor,.96),outlineColor:je("#221204",.95),outlineWidth:4,style:Cesium.LabelStyle.FILL_AND_OUTLINE,verticalOrigin:Cesium.VerticalOrigin.BOTTOM,pixelOffset:new Cesium.Cartesian2(0,-10),disableDepthTestDistance:Number.POSITIVE_INFINITY}})},this.launchPlatformMarkers.set(n.id,c)),c.pointEntity.position=a,c.pointEntity.point.pixelSize=n.launched?11:9,c.pointEntity.point.color=je(i.color,.95),c.ringEntity.position=o,c.ringEntity.ellipse.semiMajorAxis=n.launched?260:210,c.ringEntity.ellipse.semiMinorAxis=n.launched?260:210,c.ringEntity.ellipse.material=je(i.ringColor,n.launched?.12:.08),c.ringEntity.ellipse.outlineColor=je(i.ringColor,n.launched?.95:.82),c.labelEntity.position=l,c.labelEntity.label.text=`${i.labelPrefix} · ${n.name}`,c.labelEntity.label.fillColor=je(i.labelColor,.96)})}createProjectileVariant(e){const t=Math.max(1,this.focusState.artilleryCount),n=Math.max(0,this.focusState.aircraftCount),i=Math.max(0,this.focusState.armorCount),r=[];for(let a=0;a<t;a+=1)r.push("artillery");for(let a=0;a<Math.min(n,3);a+=1)r.push("aircraft");for(let a=0;a<Math.min(i,2);a+=1)r.push("armor");return r[e%Math.max(r.length,1)]??"artillery"}buildProjectileArc(e,t,n,i=0){const r=Math.max(Ol(e,t),120),a=n==="aircraft"?xt(r*.18,520,2800):n==="armor"?xt(r*.11,180,820):xt(r*.16,460,2400),o=n==="aircraft"?xt(r/1100,2.1,7.2):n==="armor"?xt(r/750,1.4,5.4):xt(r/900,2.2,6.5);return{duration:o,apexHeight:a,elapsed:xt(i,0,.96)*o}}createProjectileEntity(e){const t=xt(e.elapsed/e.duration,0,1),n=this.sampleArc(e,t),i=Di(n),r=Di(this.sampleArc(e,Math.min(t+.05,1)));e.headEntity=this.viewer.entities.add({position:i,orientation:Od(i,r,e.visual.orientationOffsets),model:{uri:rn(e.visual.modelUri,"Focus fire projectile"),scale:e.visual.modelScale,minimumPixelSize:e.visual.minimumPixelSize,maximumScale:e.visual.maximumScale,color:je(e.visual.color,e.visual.modelColorAlpha),colorBlendMode:Cesium.ColorBlendMode.MIX,colorBlendAmount:e.visual.colorBlendAmount??.3,silhouetteColor:je("#ffffff",e.visual.silhouetteAlpha??.5),silhouetteSize:e.visual.silhouetteSize}}),e.headCoreEntity=this.viewer.entities.add({position:i,point:{pixelSize:e.visual.headCoreSize??8,color:je("#ffffff",.98),outlineColor:je(e.visual.color,.98),outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY}}),e.headGlowEntity=this.viewer.entities.add({position:i,billboard:{image:rn(Nn.textures.headGlow,"Focus fire glow"),scale:e.visual.headGlowScale,color:je(e.visual.color,e.visual.headGlowAlpha??.78),disableDepthTestDistance:Number.POSITIVE_INFINITY}}),e.trailEntity=this.viewer.entities.add({polyline:{positions:this.buildArcSamples(e,40),width:e.visual.trailWidth,material:new Cesium.PolylineGlowMaterialProperty({glowPower:e.visual.trailGlowPower,color:je(e.visual.color,.88)}),clampToGround:!1}}),e.trailSpriteEntity=this.viewer.entities.add({position:i,billboard:{image:rn(e.visual.trailSpriteImage,"Focus fire trail"),scale:e.visual.trailSpriteScale,color:e.variant==="aircraft"?je(e.visual.color,e.visual.trailSpriteAlpha):je("#f4d9b0",e.visual.trailSpriteAlpha),disableDepthTestDistance:Number.POSITIVE_INFINITY}}),e.launchFlash=t<=.08?this.viewer.entities.add({position:Di(e.start),billboard:{image:rn(Nn.textures.launchMuzzle,"Focus fire launch"),scale:e.visual.launchScale,color:je(e.visual.color,.86),disableDepthTestDistance:Number.POSITIVE_INFINITY}}):null,this.projectiles.push(e)}spawnProjectileFromTrack(e){const t=e.variant??"artillery",n=Bd(t),i=this.getTerrainHeight(e.targetLongitude,e.targetLatitude,0),r={lon:e.launcherLongitude,lat:e.launcherLatitude,alt:t==="aircraft"?Math.max(e.launcherAltitudeMeters,i+620):this.getTerrainHeight(e.launcherLongitude,e.launcherLatitude,e.launcherAltitudeMeters)+(t==="armor"?8:16)},a={lon:e.targetLongitude,lat:e.targetLatitude,alt:i+(t==="aircraft"?34:10)},o=Math.max(Ol(r,a),1),l=Ol(r,{lon:e.longitude,lat:e.latitude,alt:e.altitudeMeters}),c=xt(l/o,0,.94),h=this.buildProjectileArc(r,a,t,c),u=c>.04&&c<.96?(e.altitudeMeters-Sn(r.alt,a.alt,c))/Math.max(4*c*(1-c),.08):h.apexHeight;this.createProjectileEntity({id:e.id,variant:t,visual:n,elapsed:h.elapsed,duration:h.duration,apexHeight:xt(Number.isFinite(u)?u:h.apexHeight,t==="armor"?120:260,h.apexHeight*1.9),start:r,end:a})}spawnProjectileFromLaunchPlatform(e,t,n){const i=this.focusState.objectiveLon,r=this.focusState.objectiveLat;if(!Number.isFinite(i)||!Number.isFinite(r))return;const a=this.getTerrainHeight(i,r,0),o=e?.variant??this.createProjectileVariant(t),l=Bd(o),c=_p(360/Math.max(n,1)*t+ss(-18,18)),h=Number.isFinite(Number(e?.longitude))&&Number.isFinite(Number(e?.latitude));let u;if(h)u={lon:Number(e.longitude),lat:Number(e.latitude),alt:o==="aircraft"?Math.max(Number(e.altitudeMeters)||0,a+640):this.getTerrainHeight(Number(e.longitude),Number(e.latitude),Number(e.altitudeMeters)||0)+(o==="armor"?7:15)};else{const _=o==="aircraft"?ss(2500,4200):o==="armor"?ss(1400,2600):ss(4200,7600),g=Ud(i,r,_,c);u={lon:g.lon,lat:g.lat,alt:o==="aircraft"?ss(2200,4200):this.getTerrainHeight(g.lon,g.lat,0)+(o==="armor"?9:18)}}const d=Ud(i,r,ss(16,140),c),f={lon:d.lon,lat:d.lat,alt:a+ss(4,16)},m=this.buildProjectileArc(u,f,o,0);this.createProjectileEntity({id:crypto.randomUUID(),variant:o,visual:l,elapsed:0,duration:m.duration,apexHeight:m.apexHeight,start:u,end:f})}sampleArc(e,t){const n=Sn(e.start.lon,e.end.lon,t),i=Sn(e.start.lat,e.end.lat,t),r=Sn(e.start.alt,e.end.alt,t)+e.apexHeight*4*t*(1-t);return{lon:n,lat:i,alt:r}}buildArcSamples(e,t=28){const n=[];for(let i=0;i<=t;i+=1){const r=i/t,a=this.sampleArc(e,r);n.push(Di(a))}return n}syncWeaponTrackProjectiles(e,t){const n=this.getDisplayedWeaponTracks(t),i=new Set(n.map(u=>u.id));for(const u of[...this.renderedTrackIds])i.has(u)||this.renderedTrackIds.delete(u);let r=0;n.forEach(u=>{this.renderedTrackIds.has(u.id)||(this.spawnProjectileFromTrack(u),this.renderedTrackIds.add(u.id),r+=1)});const a=Math.max(0,t.weaponsInFlight-e.weaponsInFlight),o=this.getActiveLaunchPlatforms(t.launchPlatforms);if(o.length===0)return;const l=this.getNewlyLaunchedPlatforms(e.launchPlatforms,o);if(a<=0&&l.length===0)return;const c=this.getLaunchPlatformVolleyPattern(l.length>0?l:o),h=Math.max(Math.max(0,a-r),Math.min(c.length,12));for(let u=0;u<h;u+=1){const d=c[u%Math.max(c.length,1)]??null;this.spawnProjectileFromLaunchPlatform(d,u,h)}}createImpact(e){const t=e.variant==="aircraft"?"#7fe7ff":e.variant==="armor"?"#ffd166":"#ff8c42",n=Di(e.end),i=e.variant==="aircraft"?55:32,r=this.viewer.entities.add({position:n,ellipse:{semiMajorAxis:40,semiMinorAxis:40,material:je(t,.22),outline:!0,outlineColor:je(t,.92),outlineWidth:2,height:0}}),a=this.viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(e.end.lon,e.end.lat,e.end.alt+i),billboard:{image:rn(Nn.textures.impactFlash,"Focus fire impact"),scale:e.visual.impactFlashScale,color:je("#fff5d6",.92),disableDepthTestDistance:Number.POSITIVE_INFINITY}}),o=this.viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(e.end.lon,e.end.lat,e.end.alt+i*.9),billboard:{image:rn(Nn.textures.impactExplosion,"Focus fire explosion"),scale:e.visual.impactScale,color:je(t,.9),disableDepthTestDistance:Number.POSITIVE_INFINITY}}),l=this.viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(e.end.lon,e.end.lat,e.end.alt+i*1.1),billboard:{image:rn(Nn.textures.impactSmoke,"Focus fire smoke"),scale:e.visual.smokeScale,color:je("#2d221b",.62),disableDepthTestDistance:Number.POSITIVE_INFINITY}}),c=this.viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(e.end.lon,e.end.lat,e.end.alt+8),billboard:{image:rn(Nn.textures.impactDust,"Focus fire dust"),scale:e.visual.dustScale,color:je("#cca16b",.52),disableDepthTestDistance:Number.POSITIVE_INFINITY}});this.impacts.push({elapsed:0,lifetime:e.visual.impactLifetime,radius:e.visual.impactRadius,flashScale:e.visual.impactFlashScale,fireballScale:e.visual.impactScale,smokeScale:e.visual.smokeScale,dustScale:e.visual.dustScale,ringEntity:r,flashEntity:a,fireballEntity:o,smokeEntity:l,dustEntity:c,color:t})}triggerBarrage(e={}){if(!this.hasObjective())return!1;const t=xt(Math.floor(e.bursts??Math.max(3,this.focusState.artilleryCount+Math.ceil(this.focusState.aircraftCount/2)+Math.ceil(this.focusState.armorCount/2))),1,10),n=Array.isArray(e.launchPlatforms)&&e.launchPlatforms.length>0?e.launchPlatforms:this.getDisplayedLaunchPlatforms(),i=Array.isArray(e.weaponTracks)&&e.weaponTracks.length>0?this.getDisplayedWeaponTracks({...this.focusState,weaponTracks:e.weaponTracks}):this.getDisplayedWeaponTracks();let r=0;i.length>0&&i.forEach(l=>{this.renderedTrackIds.has(l.id)||(this.spawnProjectileFromTrack(l),this.renderedTrackIds.add(l.id),r+=1)});const a=this.getLaunchPlatformVolleyPattern(n),o=a.length>0?Math.max(Math.min(a.length,12),Math.max(0,t-r)):0;for(let l=0;l<o;l+=1){const c=a[l%Math.max(a.length,1)]??null;this.spawnProjectileFromLaunchPlatform(c,l,o)}return i.length>0||o>0}updateProjectiles(e){for(let t=this.projectiles.length-1;t>=0;t-=1){const n=this.projectiles[t];n.elapsed+=e;const i=xt(n.elapsed/n.duration,0,1),r=this.sampleArc(n,i),a=Di(r),o=this.sampleArc(n,Math.min(i+.04,1)),l=Di(o);n.headEntity.position=a,n.headEntity.orientation=Od(a,l,n.visual.orientationOffsets),n.headCoreEntity.position=a,n.headCoreEntity.point.pixelSize=Sn(n.visual.headCoreSize??8,Math.max((n.visual.headCoreSize??8)*.72,5),i),n.headCoreEntity.point.color=je("#ffffff",xt(.98-i*.26,.62,.98)),n.headCoreEntity.point.outlineColor=je(n.visual.color,xt(.95-i*.22,.52,.95)),n.headGlowEntity.position=a,n.headGlowEntity.billboard.scale=Sn(n.visual.headGlowScale,n.visual.headGlowScale*.72,i),n.headGlowEntity.billboard.color=je(n.visual.color,xt((n.visual.headGlowAlpha??.78)-i*.32,.3,n.visual.headGlowAlpha??.78));const c=this.sampleArc(n,xt(i-n.visual.trailLag,0,1));if(n.trailSpriteEntity.position=Di(c),n.trailSpriteEntity.billboard.scale=Sn(n.visual.trailSpriteScale,n.visual.trailSpriteScale*.65,i),n.trailSpriteEntity.billboard.color=n.variant==="aircraft"?je(n.visual.color,xt(n.visual.trailSpriteAlpha*(1-i*.4),.18,.75)):je("#f4d9b0",xt(n.visual.trailSpriteAlpha*(1-i*.55),.12,.6)),n.launchFlash){const h=xt(.86-i*4,0,.86);n.launchFlash.billboard.scale=Sn(n.visual.launchScale,n.visual.launchScale*1.8,xt(i*4,0,1)),n.launchFlash.billboard.color=je(n.visual.color,h),h<=.02&&(this.viewer.entities.remove(n.launchFlash),n.launchFlash=null)}i<1||(this.viewer.entities.remove(n.headEntity),this.viewer.entities.remove(n.headCoreEntity),this.viewer.entities.remove(n.headGlowEntity),this.viewer.entities.remove(n.trailEntity),this.viewer.entities.remove(n.trailSpriteEntity),n.launchFlash&&this.viewer.entities.remove(n.launchFlash),this.projectiles.splice(t,1),this.createImpact(n))}}updateImpacts(e){for(let t=this.impacts.length-1;t>=0;t-=1){const n=this.impacts[t];n.elapsed+=e;const i=xt(n.elapsed/n.lifetime,0,1),r=Sn(40,n.radius,i),a=xt(.25*(1-i),0,.25),o=xt(.95*(1-i*.7),0,.95);n.ringEntity.ellipse.semiMajorAxis=r,n.ringEntity.ellipse.semiMinorAxis=r,n.ringEntity.ellipse.material=je(n.color,a),n.ringEntity.ellipse.outlineColor=je(n.color,o),n.flashEntity.billboard.scale=Sn(n.flashScale,n.flashScale*2.4,i),n.flashEntity.billboard.color=je("#fff5d6",xt(.95*(1-i*1.05),0,.95)),n.fireballEntity.billboard.scale=Sn(n.fireballScale,n.fireballScale*2.05,i),n.fireballEntity.billboard.color=je(n.color,xt(.9*(1-i*.9),0,.9)),n.smokeEntity.billboard.scale=Sn(n.smokeScale,n.smokeScale*2.2,i),n.smokeEntity.billboard.color=je("#2d221b",xt(.62*(1-i*.55),0,.62)),n.dustEntity.billboard.scale=Sn(n.dustScale,n.dustScale*2.1,i),n.dustEntity.billboard.color=je("#cca16b",xt(.52*(1-i),0,.52)),!(n.elapsed<n.lifetime)&&(this.viewer.entities.remove(n.ringEntity),this.viewer.entities.remove(n.flashEntity),this.viewer.entities.remove(n.fireballEntity),this.viewer.entities.remove(n.smokeEntity),this.viewer.entities.remove(n.dustEntity),this.impacts.splice(t,1))}}update(e){this.hasObjective()&&(this.ensureObjectiveEntities(),this.updateProjectiles(e),this.updateImpacts(e))}}const yb={blue:"#7fe7ff",red:"#ff6b6b",silver:"#dce5f2",yellow:"#ffd166",green:"#80ed99",black:"#f1f5f9"},Mb=[[/\b(kf-21|boramae)\b/i,"/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb"],[/\b(f-35|lightning|stealth|raptor)\b/i,"/3d-bundles/aircraft/models/f-35_lightning_ii_-_fighter_jet_-_free.glb"],[/\b(f-16|kf-16|falcon|fa-50|ta-50|t-50)\b/i,"/3d-bundles/aircraft/models/lockheed_martin_f-16ef_fighting_falcon.glb"],[/\b(f-15|strike eagle|eagle)\b/i,"/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb"],[/\b(apache|ah-64)\b/i,"/3d-bundles/aircraft/models/boeing_ah-64d_apache_combat_helicopter.glb"],[/\b(black hawk|blackhawk|uh-60|helicopter|helo|chinook)\b/i,"/3d-bundles/aircraft/models/sikorsky_uh-60m_blackhawk.glb"],[/\b(drone|uav|mq-|rq-|reaper|predator|global hawk)\b/i,"/3d-bundles/drone/models/animated_drone.glb"]],Sb=[[/\b(submarine|ssn|sss|sub)\b/i,"/3d-bundles/ships/uss_texas_ssn-775_submarine.glb"],[/\b(carrier|dokdo|amphibious|lhd)\b/i,"/3d-bundles/ships/hms_queen_elizabeth_r08_aircraft_carrier.glb"]],bb=[[/\b(patriot|mim-104)\b/i,"/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb"],[/\b(nasams)\b/i,"/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb"],[/\b(thaad|l-sam)\b/i,"/3d-bundles/artillery/models/thaad-2.glb"],[/\b(hyunmoo|ballistic|surface-to-surface|surface to surface|launcher)\b/i,"/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb"],[/\b(chunmoo|mlrs|himars|rocket)\b/i,"/3d-bundles/artillery/models/k9_thunder_artillery (1).glb"],[/\b(k9|k55|howitzer|artillery|paladin|m109)\b/i,"/3d-bundles/artillery/models/k9_thunder_artillery.glb"],[/\b(command vehicle|command post|m577)\b/i,"/3d-bundles/tank/models/m577_command_vehicle.glb"],[/\b(km900|humvee|hmmwv|wheeled)\b/i,"/3d-bundles/tank/models/south_korean_km900_apc.glb"],[/\b(m113|apc)\b/i,"/3d-bundles/tank/models/m113a1.glb"],[/\b(k2|tank|armor|tracked)\b/i,"/3d-bundles/tank/models/t-50_war_thunder.glb"]],Tb=[[/\b(aim-|agm-|jassm|tomahawk|missile)\b/i,"/3d-bundles/missile/aim-120c_amraam.glb"],[/\b(shell|round|rocket|artillery)\b/i,"/3d-bundles/artillery/models/artillery_shell.glb"]],Bl={aircraft:"/3d-bundles/aircraft/models/f-15.glb",ship:"/3d-bundles/ships/type-45_destroyer_class.glb",facility:"/3d-bundles/tank/models/t-50_war_thunder.glb"},kh="balanced",wb=.35,Eb=.28,$c={cinematic:{facilityModelBudget:90,labelDistance:14e4,weaponTrailTime:6,weaponPathWidth:5,weaponGlowPower:.24,weaponModelScale:1.18,weaponMinimumPixelSize:28,weaponMaximumScale:180,weaponPointSize:8,impactLifetimeSeconds:1.8},balanced:{facilityModelBudget:40,labelDistance:9e4,weaponTrailTime:4.2,weaponPathWidth:4,weaponGlowPower:.2,weaponModelScale:1.05,weaponMinimumPixelSize:22,weaponMaximumScale:140,weaponPointSize:6,impactLifetimeSeconds:1.35},performance:{facilityModelBudget:8,labelDistance:6e4,weaponTrailTime:2.8,weaponPathWidth:3,weaponGlowPower:.16,weaponModelScale:.92,weaponMinimumPixelSize:18,weaponMaximumScale:100,weaponPointSize:5,impactLifetimeSeconds:1}},Cb=new Cesium.Cartesian3,Ya=new Cesium.HeadingPitchRoll,Ab=new Cesium.Quaternion;function Cr(s){return $c[s]??$c[kh]}function Lr(s,e,t){return Math.max(e,Math.min(t,s))}function Rb(s){return(s%360+360)%360}function Ut(s,e=1){const t=typeof s=="string"&&s.trim().length>0?s.trim().toLowerCase():"silver",n=yb[t]??t;return Cesium.Color.fromCssColorString(n).withAlpha(e)}function xp(s){return`${s?.className??""} ${s?.name??""}`.toLowerCase()}function Oo(s,e=Cb){return Cesium.Cartesian3.fromDegrees(Number(s?.longitude)||0,Number(s?.latitude)||0,Math.max(0,Number(s?.altitudeMeters)||0),void 0,e)}function kd(s,e){const t=Oo(s);return Ya.heading=Cesium.Math.toRadians(Rb(e||0)),Ya.pitch=0,Ya.roll=0,Cesium.Transforms.headingPitchRollQuaternion(t,Ya,void 0,void 0,Ab)}function zd(s){const e=new Cesium.SampledPositionProperty;return e.forwardExtrapolationType=Cesium.ExtrapolationType.HOLD,e.setInterpolationOptions({interpolationDegree:1,interpolationAlgorithm:Cesium.LinearApproximation}),e.addSample(Cesium.JulianDate.now(),Oo(s)),e}function Vd(s,e,t){const n=Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(),t,new Cesium.JulianDate);s.addSample(n,Oo(e))}function ro(s,e,t){for(const[n,i]of e)if(n.test(s))return i;return t}function Pb(s,e,t){if(s.entityType==="airbase")return null;const n=xp(s);return s.entityType==="aircraft"?{uri:ro(n,Mb,Bl.aircraft),scale:/\b(drone|uav|mq-|rq-)\b/i.test(n)?1.2:.9,minimumPixelSize:34,maximumScale:220}:s.entityType==="ship"?{uri:ro(n,Sb,Bl.ship),scale:/\b(submarine|ssn|sss|sub)\b/i.test(n)?1.1:1.9,minimumPixelSize:36,maximumScale:280}:s.entityType==="facility"&&e<=t.facilityModelBudget?{uri:ro(n,bb,Bl.facility),scale:/\b(patriot|nasams|thaad|hyunmoo|launcher)\b/i.test(n)?1.15:.9,minimumPixelSize:28,maximumScale:180}:null}function Ib(s){return ro(xp(s),Tb,"/3d-bundles/artillery/models/artillery_shell.glb")}function Lb(s,e,t){return new Cesium.LabelGraphics({text:s,scale:.55,showBackground:!0,backgroundColor:Ut(e,.18),fillColor:Cesium.Color.WHITE,font:"600 24px Bahnschrift, sans-serif",pixelOffset:new Cesium.Cartesian2(0,-24),distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,t),disableDepthTestDistance:Number.POSITIVE_INFINITY})}function ao(s){return typeof s=="string"&&s.length>0?s:null}function Nb(s){const e=ao(s);return e?e.startsWith("weapon:")?{type:"weapon",id:e.slice(7)}:e.startsWith("unit:")?{type:"unit",id:e.slice(5)}:{type:"unit",id:e}:null}function Db(s){return!s||typeof s.id!="string"||typeof s.name!="string"||typeof s.entityType!="string"||!Number.isFinite(Number(s.latitude))||!Number.isFinite(Number(s.longitude))?null:{id:s.id,name:s.name,className:typeof s.className=="string"?s.className:"Unknown",entityType:s.entityType,sideId:typeof s.sideId=="string"?s.sideId:"unknown",sideName:typeof s.sideName=="string"?s.sideName:"미상",sideColor:typeof s.sideColor=="string"?s.sideColor:"silver",latitude:Number(s.latitude),longitude:Number(s.longitude),altitudeMeters:Math.max(0,Number(s.altitudeMeters)||0),headingDeg:Number(s.headingDeg)||0,speedKts:Math.max(0,Number(s.speedKts)||0),weaponCount:Math.max(0,Number(s.weaponCount)||0),hpFraction:Lr(Number(s.hpFraction)||0,0,1),selected:s.selected===!0}}function Fb(s){return!s||typeof s.id!="string"||typeof s.name!="string"||!Number.isFinite(Number(s.latitude))||!Number.isFinite(Number(s.longitude))?null:{id:s.id,name:s.name,className:typeof s.className=="string"?s.className:s.name,launcherId:typeof s.launcherId=="string"?s.launcherId:"unknown-launcher",launcherName:typeof s.launcherName=="string"?s.launcherName:"발사 플랫폼",sideId:typeof s.sideId=="string"?s.sideId:"unknown",sideName:typeof s.sideName=="string"?s.sideName:"미상",sideColor:typeof s.sideColor=="string"?s.sideColor:"silver",latitude:Number(s.latitude),longitude:Number(s.longitude),altitudeMeters:Math.max(0,Number(s.altitudeMeters)||0),launchLatitude:Number.isFinite(Number(s.launchLatitude))?Number(s.launchLatitude):Number(s.latitude),launchLongitude:Number.isFinite(Number(s.launchLongitude))?Number(s.launchLongitude):Number(s.longitude),launchAltitudeMeters:Math.max(0,Number(s.launchAltitudeMeters)||0),headingDeg:Number(s.headingDeg)||0,speedKts:Math.max(0,Number(s.speedKts)||0),targetId:typeof s.targetId=="string"?s.targetId:null,targetLatitude:Number.isFinite(Number(s.targetLatitude))?Number(s.targetLatitude):void 0,targetLongitude:Number.isFinite(Number(s.targetLongitude))?Number(s.targetLongitude):void 0}}function Hd(){return{scenarioId:"unknown-scenario",scenarioName:"전장 관전자",currentTime:0,currentSideId:"",currentSideName:"",units:[],weapons:[],recentEvents:[],stats:{aircraft:0,facilities:0,airbases:0,ships:0,weaponsInFlight:0,sides:0},view:{followTargetId:null,lodLevel:kh}}}class vp{constructor(e){this.viewer=e,this.dataSource=new Cesium.CustomDataSource("firescope-battle-spectator"),this.viewer.dataSources.add(this.dataSource),this.state=Hd(),this.unitRecords=new Map,this.weaponRecords=new Map,this.effects=[],this.trackedBattleEntityId=null}normalizeState(e={}){return{scenarioId:typeof e.scenarioId=="string"?e.scenarioId:"unknown-scenario",scenarioName:typeof e.scenarioName=="string"?e.scenarioName:"전장 관전자",currentTime:Number(e.currentTime)||0,currentSideId:typeof e.currentSideId=="string"?e.currentSideId:"",currentSideName:typeof e.currentSideName=="string"?e.currentSideName:"",units:Array.isArray(e.units)?e.units.map(Db).filter(Boolean):[],weapons:Array.isArray(e.weapons)?e.weapons.map(Fb).filter(Boolean):[],recentEvents:Array.isArray(e.recentEvents)?e.recentEvents:[],stats:{aircraft:Math.max(0,Number(e.stats?.aircraft)||0),facilities:Math.max(0,Number(e.stats?.facilities)||0),airbases:Math.max(0,Number(e.stats?.airbases)||0),ships:Math.max(0,Number(e.stats?.ships)||0),weaponsInFlight:Math.max(0,Number(e.stats?.weaponsInFlight)||0),sides:Math.max(0,Number(e.stats?.sides)||0)},view:{followTargetId:ao(e.view?.followTargetId),lodLevel:typeof e.view?.lodLevel=="string"&&$c[e.view.lodLevel]?e.view.lodLevel:kh}}}setState(e={}){const t=this.normalizeState(e),n=t.view.lodLevel!==this.state.view?.lodLevel;this.state=t,n&&this.rebuildEntities(),this.syncUnits(),this.syncWeapons(),this.syncCameraTracking()}createUnitRecord(e,t){const n=Cr(this.state.view?.lodLevel),i=Pb(e,t,n),r=zd(e),a=Ut(e.sideColor,.95);return{entity:this.dataSource.entities.add({id:`battle-unit-${e.id}`,position:r,orientation:new Cesium.CallbackProperty(()=>kd(e,e.headingDeg),!1),model:i?{uri:rn(i.uri,"Battle spectator model"),scale:i.scale,minimumPixelSize:i.minimumPixelSize,maximumScale:i.maximumScale,color:Ut(e.sideColor,.86),colorBlendAmount:.2,silhouetteColor:Ut(e.sideColor,.62),silhouetteSize:e.selected?2.2:1.2}:void 0,point:i?void 0:{pixelSize:e.selected?12:9,color:a,outlineColor:Cesium.Color.BLACK.withAlpha(.72),outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY},label:Lb(e.name,e.sideColor,n.labelDistance)}),positionProperty:r,unit:e,useModel:!!i}}updateUnitRecord(e,t){const n=Cr(this.state.view?.lodLevel);e.unit=t,Vd(e.positionProperty,t,wb),e.entity.label&&(e.entity.label.text=t.name,e.entity.label.backgroundColor=Ut(t.sideColor,.18),e.entity.label.distanceDisplayCondition=new Cesium.DistanceDisplayCondition(0,n.labelDistance)),e.entity.point&&(e.entity.point.color=Ut(t.sideColor,.95),e.entity.point.pixelSize=t.selected?12:9),e.entity.model&&(e.entity.model.color=Ut(t.sideColor,.86),e.entity.model.silhouetteColor=Ut(t.sideColor,t.selected?.88:.62),e.entity.model.silhouetteSize=t.selected?2.2:1.2),e.entity.orientation=new Cesium.CallbackProperty(()=>kd(t,t.headingDeg),!1)}syncUnits(){const e=new Set,t=this.state.units.length;this.state.units.forEach(n=>{e.add(n.id);const i=this.unitRecords.get(n.id);if(!i){this.unitRecords.set(n.id,this.createUnitRecord(n,t));return}this.updateUnitRecord(i,n)});for(const[n,i]of this.unitRecords.entries())e.has(n)||(this.dataSource.entities.remove(i.entity),this.unitRecords.delete(n))}createWeaponRecord(e){const t=Cr(this.state.view?.lodLevel),n=zd(e),i=Ut(e.sideColor,.92);return{entity:this.dataSource.entities.add({id:`battle-weapon-${e.id}`,position:n,orientation:new Cesium.VelocityOrientationProperty(n),model:{uri:rn(Ib(e),"Battle spectator weapon"),scale:t.weaponModelScale,minimumPixelSize:t.weaponMinimumPixelSize,maximumScale:t.weaponMaximumScale,color:Ut(e.sideColor,.84),colorBlendAmount:.26,silhouetteColor:Cesium.Color.WHITE.withAlpha(.72),silhouetteSize:1.2},path:new Cesium.PathGraphics({show:!0,leadTime:0,trailTime:t.weaponTrailTime,width:t.weaponPathWidth,material:new Cesium.PolylineGlowMaterialProperty({glowPower:t.weaponGlowPower,color:i})}),point:{pixelSize:t.weaponPointSize,color:i,outlineColor:Cesium.Color.WHITE.withAlpha(.82),outlineWidth:1.5,disableDepthTestDistance:Number.POSITIVE_INFINITY}}),positionProperty:n,lastWeapon:e}}updateWeaponRecord(e,t){const n=Cr(this.state.view?.lodLevel);e.lastWeapon=t,Vd(e.positionProperty,t,Eb),e.entity.model&&(e.entity.model.color=Ut(t.sideColor,.84),e.entity.model.scale=n.weaponModelScale,e.entity.model.minimumPixelSize=n.weaponMinimumPixelSize,e.entity.model.maximumScale=n.weaponMaximumScale),e.entity.point&&(e.entity.point.color=Ut(t.sideColor,.92),e.entity.point.pixelSize=n.weaponPointSize),e.entity.path&&(e.entity.path.trailTime=n.weaponTrailTime,e.entity.path.width=n.weaponPathWidth,e.entity.path.material=new Cesium.PolylineGlowMaterialProperty({glowPower:n.weaponGlowPower,color:Ut(t.sideColor,.92)}))}createImpactEffect(e){const t=Cr(this.state.view?.lodLevel),n={longitude:typeof e.targetLongitude=="number"?e.targetLongitude:e.longitude,latitude:typeof e.targetLatitude=="number"?e.targetLatitude:e.latitude,altitudeMeters:0},i=Oo(n),r=this.dataSource.entities.add({position:i,ellipse:{semiMajorAxis:45,semiMinorAxis:45,height:0,material:Ut(e.sideColor,.16),outline:!0,outlineColor:Ut(e.sideColor,.92)}}),a=this.dataSource.entities.add({position:i,point:{pixelSize:18,color:Ut(e.sideColor,.95),outlineColor:Cesium.Color.WHITE.withAlpha(.92),outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY}});this.effects.push({elapsed:0,lifetime:t.impactLifetimeSeconds,ringEntity:r,flashEntity:a,sideColor:e.sideColor})}syncWeapons(){const e=new Set;this.state.weapons.forEach(t=>{e.add(t.id);const n=this.weaponRecords.get(t.id);if(!n){this.weaponRecords.set(t.id,this.createWeaponRecord(t));return}this.updateWeaponRecord(n,t)});for(const[t,n]of this.weaponRecords.entries())e.has(t)||(this.createImpactEffect(n.lastWeapon),this.dataSource.entities.remove(n.entity),this.weaponRecords.delete(t))}rebuildEntities(){for(const e of this.unitRecords.values())this.dataSource.entities.remove(e.entity);for(const e of this.weaponRecords.values())this.dataSource.entities.remove(e.entity);for(const e of this.effects)this.dataSource.entities.remove(e.ringEntity),this.dataSource.entities.remove(e.flashEntity);this.unitRecords.clear(),this.weaponRecords.clear(),this.effects=[],this.clearBattleTracking()}clearBattleTracking(){this.viewer.trackedEntity&&String(this.viewer.trackedEntity.id??"").startsWith("battle-")&&(this.viewer.trackedEntity=void 0),this.trackedBattleEntityId=null}resolveFollowTargetEntity(){const e=Nb(this.state.view?.followTargetId);return e?e.type==="weapon"?this.weaponRecords.get(e.id)?.entity??null:this.unitRecords.get(e.id)?.entity??null:null}syncCameraTracking(){if(!ao(this.state.view?.followTargetId)){this.clearBattleTracking();return}const t=this.resolveFollowTargetEntity();t&&this.trackedBattleEntityId!==t.id&&(this.viewer.trackedEntity=t,this.trackedBattleEntityId=t.id)}applyCommand(e={}){if(e.command==="jump-to-point"){const t=Number(e.longitude),n=Number(e.latitude),i=Math.max(1200,Number(e.altitudeMeters)||2500);if(!Number.isFinite(t)||!Number.isFinite(n))return;ao(this.state.view?.followTargetId)||this.clearBattleTracking(),this.viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(t,n,i),duration:Math.max(.4,Number(e.durationSeconds)||1.4)})}}updateEffects(e){for(let t=this.effects.length-1;t>=0;t-=1){const n=this.effects[t];n.elapsed+=e;const i=Lr(n.elapsed/n.lifetime,0,1),r=45+i*180,a=Lr(.18*(1-i),0,.18),o=Lr(.92*(1-i*.85),0,.92);n.ringEntity.ellipse.semiMajorAxis=r,n.ringEntity.ellipse.semiMinorAxis=r,n.ringEntity.ellipse.material=Ut(n.sideColor,a),n.ringEntity.ellipse.outlineColor=Ut(n.sideColor,o),n.flashEntity.point.pixelSize=18+i*40,n.flashEntity.point.color=Ut(n.sideColor,Lr(.95*(1-i),0,.95)),!(n.elapsed<n.lifetime)&&(this.dataSource.entities.remove(n.ringEntity),this.dataSource.entities.remove(n.flashEntity),this.effects.splice(t,1))}}clear(){this.dataSource.entities.removeAll(),this.unitRecords.clear(),this.weaponRecords.clear(),this.effects=[],this.state=Hd(),this.clearBattleTracking()}update(e){this.state.view?.followTargetId?this.syncCameraTracking():this.trackedBattleEntityId&&this.clearBattleTracking(),this.effects.length>0&&this.updateEffects(e)}}const Gd=["/3d-bundles/aircraft/models/f-15.glb","/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb","/3d-bundles/aircraft/models/lockheed_martin_f-16ef_fighting_falcon.glb","/3d-bundles/aircraft/models/f-35_lightning_ii_-_fighter_jet_-_free.glb","/3d-bundles/aircraft/models/low_poly_f-15.glb"];class Ub{constructor(e,t,n){this.viewer=e,this.scene=t,this.loader=n,this.npcs=[],this.npcNames=["봉황","비호","매","유령","까마귀","독수리","청룡","칼날","돌격","폭풍","기사","흑표"],this.lastSpawnTime=0,this.modelTemplate=null,this.animations=[],this.loaded=!1,this._scratchMatrix=new Cesium.Matrix4,this._scratchHPR=new Cesium.HeadingPitchRoll,this._scratchCartesian=new Cesium.Cartesian3,this._scratchThreeMatrix=new He,this._scratchCameraMatrix=new Cesium.Matrix4,this.loadModel()}loadModel(e=0){if(e>=Gd.length){console.warn("Unable to load any NPC aircraft model.");return}this.loader.load(rn(Gd[e]),t=>{this.modelTemplate=t.scene,this.animations=t.animations,this.modelTemplate.traverse(n=>{n.isMesh&&(n.castShadow=!0,n.receiveShadow=!0)}),this.loaded=!0},void 0,()=>{this.loadModel(e+1)})}spawnNPC(e,t,n){if(!this.loaded)return null;const i=Math.random()*Math.PI*2,r=5e3+Math.random()*15e3,a=r*Math.cos(i)/(111320*Math.cos(Cesium.Math.toRadians(t))),o=r*Math.sin(i)/111320,l=this.npcNames[Math.floor(Math.random()*this.npcNames.length)]+" "+(100+Math.floor(Math.random()*900)),c=e+a,h=t+o,u=Math.max(n+(Math.random()-.5)*1e3,1500);return this.createNPCMesh(l,c,h,u,Math.random()*360,250+Math.random()*100)}createNPCMesh(e,t,n,i,r,a){if(!this.modelTemplate)return null;const o=new Wt,l=this.modelTemplate.clone();l.rotation.x=Math.PI/2,l.scale.set(1,1,1),o.add(l),o.matrixAutoUpdate=!1,this.scene.add(o);const c=new $f(l),h=Jr.findByName(this.animations,"flight_mode");if(h){const d=c.clipAction(h);d.setLoop(fh),d.clampWhenFinished=!0,d.play()}const u={id:e+"_"+Math.random().toString(36).substr(2,9),mesh:o,mixer:c,name:e,lon:t,lat:n,alt:i,heading:r,pitch:0,roll:0,speed:a,throttle:.7,isBoosting:!1,targetHeading:r,targetPitch:0,behaviorTimer:5+Math.random()*10,terrainCheckTimer:Math.random()*2,time:Math.random()*100};return this.npcs.push(u),u}update(e,t){if(!this.loaded)return;const n=this.viewer.camera.viewMatrix;for(let i=this.npcs.length-1;i>=0;i--){const r=this.npcs[i];if(r.destroyed){this.scene.remove(r.mesh),this.npcs.splice(i,1);continue}if(r.time+=e,r.behaviorTimer-=e,r.terrainCheckTimer-=e,r.behaviorTimer<=0&&(r.targetHeading=(r.heading+(Math.random()-.5)*120)%360,r.targetPitch=(Math.random()-.5)*25,r.behaviorTimer=8+Math.random()*15,r.isBoosting=Math.random()>.7,r.throttle=.6+Math.random()*.4),r.terrainCheckTimer<=0){r.terrainCheckTimer=.5;const T=Cesium.Cartographic.fromDegrees(r.lon,r.lat),S=this.viewer.scene.globe.getHeight(T);if(S!==void 0){const y=r.alt-S;y<500&&(r.targetPitch=Math.max(r.targetPitch,25),r.isBoosting=!0,r.throttle=1,y<100&&(r.targetPitch=45))}}let a=r.targetHeading-r.heading;for(;a<-180;)a+=360;for(;a>180;)a-=360;const h=(r.isBoosting?90:30)*e,u=Math.max(-h,Math.min(h,a));r.heading=(r.heading+u+360)%360,r.pitch+=(r.targetPitch-r.pitch)*e*.6;let d=0;if(Math.abs(a)>.5){const T=Math.sign(a),S=Math.min(1,Math.abs(a)/45);d=-T*90*S}const f=3;r.roll+=(d-r.roll)*Math.min(1,e*f),r.roll=Math.max(-90,Math.min(90,r.roll));const m=Hi(r.lon,r.lat,r.alt,r.heading,r.pitch,r.speed*e);r.lon=m.lon,r.lat=m.lat,r.alt=m.alt;const _=Cesium.Cartesian3.fromDegrees(r.lon,r.lat,r.alt,void 0,this._scratchCartesian);this._scratchHPR.heading=Cesium.Math.toRadians(r.heading),this._scratchHPR.pitch=Cesium.Math.toRadians(r.roll),this._scratchHPR.roll=Cesium.Math.toRadians(r.pitch);const g=Cesium.Transforms.headingPitchRollToFixedFrame(_,this._scratchHPR,Cesium.Ellipsoid.WGS84,Cesium.Transforms.eastNorthUpToFixedFrame,this._scratchMatrix),p=Cesium.Matrix4.multiply(n,g,this._scratchCameraMatrix);for(let T=0;T<16;T++)this._scratchThreeMatrix.elements[T]=p[T];r.mesh.matrix.copy(this._scratchThreeMatrix),r.mesh.updateMatrixWorld(!0),r.mixer&&r.mixer.update(e)}this.npcs.length<3&&Date.now()-this.lastSpawnTime>5e3&&(this.spawnNPC(t.lon,t.lat,t.alt),this.lastSpawnTime=Date.now())}clear(){this.npcs.forEach(e=>{this.scene.remove(e.mesh)}),this.npcs=[]}}class Ob{constructor(e={id:"jet",mode:"jet"}){this.container=document.getElementById("dialogue-container"),this.textElem=document.getElementById("dialogue-text"),this.dialogues=[],this.tutorialStorageKey="tutorialCompleted:jet",this.currentIndex=0,this.isActive=!1,this.isPaused=!1,this.currentCharIndex=0,this.isWaitingForNext=!1,this.lastSoundIndex=-1,this.glitchSounds=["glitch-1","glitch-2","glitch-3","glitch-4"],this.setCraftProfile(e)}setCraftProfile(e={id:"jet",mode:"jet"}){const t=e.id||"jet",n=e.label||"전투기";if(this.tutorialStorageKey=`tutorialCompleted:${t}`,e.mode==="drone"){this.dialogues=["드론 모드 준비가 끝났습니다. 먼저 기본 조작부터 익히겠습니다.","드론은 전투기보다 낮고 느리게 움직이므로 작은 입력이 더 안정적입니다.","W와 S로 전진과 후진을 조절합니다.","위와 아래 화살표로 상승과 하강을 제어합니다.","왼쪽과 오른쪽 화살표로 좌우 이동을 합니다.","A와 D로 기수를 좌우로 회전합니다.","마우스를 드래그하면 주변을 둘러볼 수 있습니다.","ESC 또는 P를 누르면 언제든 일시 정지할 수 있습니다.","지면과 전선에 충분한 거리를 두고, 천천히 안정적으로 비행하십시오."];return}this.dialogues=["조종사님, 전술 조언관 디마르 타르미지입니다. 오늘 비행을 안내하겠습니다.",`현재 ${n} 기체를 조종 중입니다.`,"HUD 왼쪽은 속도, 오른쪽은 고도를 보여줍니다.","상단 나침반은 현재 방위를, 중앙 조준선은 자세 유지를 돕습니다.","무장은 준비되어 있습니다. M61A1 기관포와 공대공 미사일을 사용할 수 있습니다.","W와 S로 추력을 조절하면서 속도와 에너지를 관리하십시오.","화살표 키로 기수와 롤을 조정하고, A와 D로 방향타를 제어합니다.","스페이스를 누르면 순간 가속이 가능하지만 속도 변화에 주의해야 합니다.","1, 2 또는 Q로 무기를 바꾸고, F 또는 엔터로 목표를 공격합니다.","위협을 감지하면 V를 눌러 플레어를 살포하고 락온을 끊으십시오.","하단 미니맵에는 주변 표적과 현재 지역이 표시됩니다.","행운을 빕니다. 전술 조언관 디마르 타르미지, 이상입니다."]}start(){localStorage.getItem(this.tutorialStorageKey)||(this.stop(),this.currentIndex=0,this.currentCharIndex=0,this.isActive=!0,this.isPaused=!1,this.isWaitingForNext=!1,this.startTimeout=setTimeout(()=>{!this.isActive||this.isPaused||(this.container.classList.remove("hidden"),this.showNext())},7e3))}pause(){this.isActive&&(this.isPaused=!0,this.container.classList.add("hidden"),this.startTimeout&&clearTimeout(this.startTimeout),this.typewriterTimeout&&clearTimeout(this.typewriterTimeout),this.nextTimeout&&clearTimeout(this.nextTimeout))}resume(){!this.isActive||!this.isPaused||(this.isPaused=!1,this.container.classList.remove("hidden"),this.isWaitingForNext?this.nextTimeout=setTimeout(()=>{this.currentIndex++,this.currentCharIndex=0,this.showNext()},2e3):this.typeWriter())}stop(){this.isActive=!1,this.isPaused=!1,this.container.classList.add("hidden"),this.startTimeout&&clearTimeout(this.startTimeout),this.typewriterTimeout&&clearTimeout(this.typewriterTimeout),this.nextTimeout&&clearTimeout(this.nextTimeout)}showNext(){if(!(!this.isActive||this.isPaused)){if(this.currentIndex>=this.dialogues.length){this.finish();return}this.textElem.textContent="",this.currentCharIndex=0,this.isWaitingForNext=!1,this.playRandomGlitch(),this.typeWriter()}}typeWriter(){if(!this.isActive||this.isPaused)return;const e=this.dialogues[this.currentIndex];this.currentCharIndex<e.length?(this.textElem.textContent=e.substring(0,this.currentCharIndex+1),this.currentCharIndex++,this.typewriterTimeout=setTimeout(()=>this.typeWriter(),30)):(this.isWaitingForNext=!0,this.nextTimeout=setTimeout(()=>{this.currentIndex++,this.currentCharIndex=0,this.showNext()},4e3))}playRandomGlitch(){let e;do e=Math.floor(Math.random()*this.glitchSounds.length);while(e===this.lastSoundIndex);this.lastSoundIndex=e,Le.play(this.glitchSounds[e])}skip(){if(!this.isActive||this.isPaused)return;const e=this.dialogues[this.currentIndex];e&&(this.isWaitingForNext?(this.nextTimeout&&clearTimeout(this.nextTimeout),this.currentIndex++,this.currentCharIndex=0,this.showNext()):(this.typewriterTimeout&&clearTimeout(this.typewriterTimeout),this.textElem.textContent=e,this.currentCharIndex=e.length,this.isWaitingForNext=!0,this.nextTimeout&&clearTimeout(this.nextTimeout),this.nextTimeout=setTimeout(()=>{this.currentIndex++,this.currentCharIndex=0,this.showNext()},4e3)))}finish(){this.isActive=!1,this.container.classList.add("hidden"),localStorage.setItem(this.tutorialStorageKey,"true")}}const cr=window.__FLIGHT_SIM_CONFIG__??{},sa=new URLSearchParams(window.location.search),yp="flightSimSettings",Jc=ea("jet")?.id??"f15",kl={graphicsQuality:"medium",antialiasing:!0,fogEffects:!0,mouseSensitivity:.2,showHud:!0,showHorizonLines:!1,soundEnabled:!0,minimapRange:10,selectedJetCraftId:Jc};function Mp(){try{const s=localStorage.getItem(yp);if(!s)return{...kl};const e=JSON.parse(s);return{...kl,...e}}catch(s){return console.error("Failed to load settings",s),{...kl}}}function Bb(s,e){return s==="jet"?ea(e)?.id??Jc:ea(s)?.id??Jc}const kb=Number(sa.get("lon")??cr.initialPosition?.lon),zb=Number(sa.get("lat")??cr.initialPosition?.lat),Wd=Number(sa.get("alt")??cr.initialPosition?.alt),Sp=sa.get("craft")??cr.craft??"jet",bp=sa.get("battleSpectator")==="1";let st=Mp();const Tp=!!(cr.vworldApiKey??"").trim(),wp=!!(cr.mapTilerApiKey??"").trim(),Vb={lon:126.978,lat:37.5665},Hb=(s,e)=>s>=124.5&&s<=132.5&&e>=33&&e<=39.5,Ep=(s,e)=>Number.isFinite(s)&&Number.isFinite(e)&&Hb(s,e)?{lon:s,lat:e}:{...Vb},Xd=Ep(kb,zb);let be=Gb(ea(Bb(Sp,st.selectedJetCraftId)));const Ze={MENU:"MENU",PICK_SPAWN:"PICK_SPAWN",TRANSITIONING:"TRANSITIONING",FLYING:"FLYING",PAUSED:"PAUSED",CRASHED:"CRASHED"},Qt={CHASE:"CHASE",MISSILE:"MISSILE",CINEMATIC:"CINEMATIC"},zl=[Qt.CHASE,Qt.MISSILE,Qt.CINEMATIC],ra={[Qt.CHASE]:"추적",[Qt.MISSILE]:"미사일 캠",[Qt.CINEMATIC]:"시네마틱"};let et=Ze.MENU;function Gb(s){const e=ea("jet"),t=s??e,n=Array.isArray(t.modelCandidates)?t.modelCandidates.filter(i=>typeof i=="string"&&i.length>0):[];return{...e,...t,modelCandidates:n.length>0?n:e.modelCandidates.filter(i=>typeof i=="string"&&i.length>0),iconPath:typeof t.iconPath=="string"&&t.iconPath.length>0?t.iconPath:null,visual:{...e.visual,...t.visual??{},basePosition:{...e.visual.basePosition,...t.visual?.basePosition??{}},baseRotation:{...e.visual.baseRotation,...t.visual?.baseRotation??{}}},animation:{...e.animation,...t.animation??{}}}}function Wb(){st=Mp(),Cp(),Zc()}function Xb(){localStorage.setItem(yp,JSON.stringify(st))}function qb(){const s=document.getElementById("jetCraftSelect");!s||s.dataset.initialized==="true"||(s.innerHTML="",JS.forEach(e=>{const t=document.createElement("option");t.value=e.id,t.textContent=e.label,s.appendChild(t)}),s.dataset.initialized="true")}function Yb(){const s=document.getElementById("jetCraftSettingsHeading"),e=document.getElementById("jetCraftSettingRow"),t=be.mode==="jet";s&&(s.style.display=t?"":"none"),e&&(e.style.display=t?"grid":"none")}function Zc(){qb(),Yb(),document.getElementById("graphicsQuality").value=st.graphicsQuality,document.getElementById("antialiasing").checked=st.antialiasing,document.getElementById("fogEffects").checked=st.fogEffects,document.getElementById("sensitivitySlider").value=st.mouseSensitivity,document.getElementById("sensitivityValue").textContent=st.mouseSensitivity,document.getElementById("showHud").checked=st.showHud,document.getElementById("showHorizonLines").checked=st.showHorizonLines,document.getElementById("soundEnabled").checked=st.soundEnabled,document.getElementById("minimapRange").value=st.minimapRange.toString();const s=document.getElementById("jetCraftSelect");s&&(s.value=be.mode==="jet"?be.id:st.selectedJetCraftId)}function Cp(){To&&To.setSensitivity(st.mouseSensitivity),Pt&&(Pt.setMinimapRange(st.minimapRange),Pt.setShowHorizonLines(st.showHorizonLines)),Le&&Le.listener&&Le.listener.setMasterVolume(st.soundEnabled?1:0);const s=Xt();if(s){st.graphicsQuality==="low"?(s.resolutionScale=.5,s.scene.globe.maximumScreenSpaceError=4):st.graphicsQuality==="medium"?(s.resolutionScale=.75,s.scene.globe.maximumScreenSpaceError=2):(s.resolutionScale=1,s.scene.globe.maximumScreenSpaceError=1.3),s.scene.postProcessStages?.fxaa&&(s.scene.postProcessStages.fxaa.enabled=st.antialiasing),s.scene.fog&&(s.scene.fog.enabled=st.fogEffects);const t=s.scene.skyAtmosphere??s.scene.atmosphere;t&&"show"in t&&(t.show=st.fogEffects)}[document.getElementById("hud-top-left"),document.getElementById("hud-top-right"),document.getElementById("hud-speed-box"),document.getElementById("hud-alt-box"),document.getElementById("coords"),document.getElementById("minimap-container")].forEach(t=>{t&&(t.style.display=st.showHud?"block":"none")})}let j={lon:Xd.lon,lat:Xd.lat,alt:Number.isFinite(Wd)?Wd:be.initialAltitude,heading:0,pitch:0,roll:0,speed:be.initialSpeed,throttle:0,score:0,weaponSystem:null,cameraModeLabel:ra[Qt.CHASE],renderPlayerOverlay:!0};async function jb(){}jb();let Mo=null,Qc=0,oo={lon:0,lat:0};const Kb=1e4,$b=1e3;let So=0;const Jb=1800;let ja=!1,Ap=0,vi,bn,Yn,fn,eh=[],kr,bo,th=Pp(be),To=new YS(be.mode),Pt=new eb,wn,It,jt,An,Rt=new Ob(be),qd=0,Vl=0,Hl=0,Qn=Zb(be),Fi=new I().copy(Qn),Jn=new Kt(0,0,0),Hs=0,lo=0,Ka=1,co=!1,Rp=null,Yd=0,Nt={mode:Qt.CHASE,killCam:null};function Zb(s){const{x:e,y:t,z:n}=s.visual.basePosition;return new I(e,t,n)}function Pp(s){return s.mode==="drone"?new jS:new qS(s.physics)}function Qb(){const s=zl.indexOf(Nt.mode);Nt.mode=zl[(s+1)%zl.length],Nt.mode===Qt.CHASE&&(Nt.killCam=null)}function Ip(s,e){const t=Cesium.Math.toRadians((s.lat+e.lat)*.5),n=(e.lon-s.lon)*111320*Math.max(Math.cos(t),.01),i=(e.lat-s.lat)*111320,r=(e.alt??0)-(s.alt??0),a=Math.sqrt(n*n+i*i)||1e-4;return{heading:Cesium.Math.toDegrees(Math.atan2(n,i)),pitch:Cesium.Math.toDegrees(Math.atan2(r,a)),roll:0}}function Gl(s){const e=new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(j.heading),Cesium.Math.toRadians(j.pitch),Cesium.Math.toRadians(j.roll)),t=Cesium.Quaternion.fromHeadingPitchRoll(e),n=new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(s.cameraYaw),Cesium.Math.toRadians(-s.cameraPitch),0),i=Cesium.Quaternion.fromHeadingPitchRoll(n),r=Cesium.Quaternion.multiply(t,i,new Cesium.Quaternion),a=Cesium.HeadingPitchRoll.fromQuaternion(r);return Oh(j.lon,j.lat,j.alt,Cesium.Math.toDegrees(a.heading),Cesium.Math.toDegrees(a.pitch),Cesium.Math.toDegrees(a.roll)),{label:ra[Qt.CHASE],renderPlayerOverlay:!0}}function jd(s,e=ra[Qt.MISSILE]){const t=Bh(s.lon,s.lat,s.alt,s.heading,-22,2.8,5.5),n=Hi(s.lon,s.lat,s.alt,s.heading,s.pitch,220),i=Ip(t,n);return Oh(t.lon,t.lat,t.alt,i.heading,i.pitch,0),{label:e,renderPlayerOverlay:!1}}function eT(s){const e=1-s.timeRemaining/s.duration,t=s.baseHeading+28+e*70*s.orbitDirection,n=Bh(s.lon,s.lat,s.alt,t,-58+e*14,0,22+Math.sin(e*Math.PI)*10),i={lon:s.lon,lat:s.lat,alt:s.alt+8},r=Ip(n,i);return Oh(n.lon,n.lat,n.alt,r.heading,r.pitch,0),{label:"킬캠",renderPlayerOverlay:!1}}function tT(s,e){if(Nt.killCam&&(Nt.killCam.timeRemaining=Math.max(0,Nt.killCam.timeRemaining-s),Nt.killCam.timeRemaining<=0&&(Nt.killCam=null)),Nt.mode===Qt.CINEMATIC&&Nt.killCam)return eT(Nt.killCam);const t=It?.getLatestActiveMissile?.()??null;return Nt.mode===Qt.MISSILE?t?jd(t):{...Gl(e),label:"미사일 대기"}:Nt.mode===Qt.CINEMATIC?t?jd(t,"시네마틱 추적"):{...Gl(e),label:ra[Qt.CINEMATIC]}:Gl(e)}function nT(){const s=document.getElementById("aircraft-label"),e=document.querySelector("#aircraft-icon img"),t=document.getElementById("weapons-hud");s&&(s.textContent=be.hudLabel,s.style.marginTop=be.iconPath?"":"0"),e&&(be.iconPath?(e.src=rn(be.iconPath),e.alt=`${be.label} 아이콘`,e.style.display=""):e.style.display="none"),t&&(t.dataset.craft=be.id)}function iT(s){return Number.isFinite(Number(s?.objectiveLon))&&Number.isFinite(Number(s?.objectiveLat))}function Lp(s){switch(s){case"aircraft":case"armor":case"artillery":return s;default:return"artillery"}}function sT(s){return Array.isArray(s)?s.map(e=>{const t=Number(e?.latitude),n=Number(e?.longitude);return!Number.isFinite(t)||!Number.isFinite(n)?null:{id:typeof e?.id=="string"&&e.id.length>0?e.id:crypto.randomUUID(),name:typeof e?.name=="string"&&e.name.trim().length>0?e.name.trim():"집중포격 발사대",className:typeof e?.className=="string"&&e.className.trim().length>0?e.className.trim():"Launcher",latitude:t,longitude:n,altitudeMeters:Math.max(0,Number(e?.altitudeMeters)||0),variant:Lp(e?.variant),launched:e?.launched===!0}}).filter(e=>e!==null):[]}function rT(s){return Array.isArray(s)?s.map(e=>{const t=Number(e?.latitude),n=Number(e?.longitude),i=Number(e?.launcherLatitude),r=Number(e?.launcherLongitude),a=Number(e?.targetLatitude),o=Number(e?.targetLongitude);return!Number.isFinite(t)||!Number.isFinite(n)||!Number.isFinite(i)||!Number.isFinite(r)||!Number.isFinite(a)||!Number.isFinite(o)?null:{id:typeof e?.id=="string"&&e.id.length>0?e.id:crypto.randomUUID(),launcherId:typeof e?.launcherId=="string"&&e.launcherId.length>0?e.launcherId:"focus-fire-launcher",launcherName:typeof e?.launcherName=="string"&&e.launcherName.trim().length>0?e.launcherName.trim():"집중포격 발사대",latitude:t,longitude:n,altitudeMeters:Math.max(0,Number(e?.altitudeMeters)||0),launcherLatitude:i,launcherLongitude:r,launcherAltitudeMeters:Math.max(0,Number(e?.launcherAltitudeMeters)||0),targetLatitude:a,targetLongitude:o,variant:Lp(e?.variant)}}).filter(e=>e!==null):[]}function Np(s={}){return iT(s)?{objectiveLon:Number(s.objectiveLon),objectiveLat:Number(s.objectiveLat),objectiveName:typeof s.objectiveName=="string"&&s.objectiveName.trim().length>0?s.objectiveName.trim():"집중포격 목표",active:s.active===!0,captureProgress:Number(s.captureProgress)||0,aircraftCount:Number(s.aircraftCount)||0,artilleryCount:Number(s.artilleryCount)||0,armorCount:Number(s.armorCount)||0,weaponsInFlight:Number(s.weaponsInFlight)||0,launchPlatforms:sT(s.launchPlatforms),weaponTracks:rT(s.weaponTracks),statusLabel:typeof s.statusLabel=="string"&&s.statusLabel.trim().length>0?s.statusLabel.trim():"대기"}:null}function zh(){if(!Wl||!$d||!Jd||!Zd||!wo)return;if(!(!!Dt&&(et===Ze.FLYING||et===Ze.PAUSED))||!Dt){Wl.classList.add("hidden");return}Wl.classList.remove("hidden"),$d.textContent=Dt.statusLabel,Jd.textContent=Dt.objectiveName,Zd.textContent=`탄체 ${Dt.weaponsInFlight} · 점령 ${Math.round(Dt.captureProgress)}% · 포대 ${Dt.artilleryCount} / 기갑 ${Dt.armorCount} / 항공 ${Dt.aircraftCount}`,wo.disabled=!Dt||et!==Ze.FLYING}function aT(s){Dt=Np(s),jt&&jt.setState(Dt??{}),zh()}function Dp(s=null,e=Dt){if(!e)return;const t=Number.isFinite(Number(s))&&Number(s)>0?Number(s):Math.max(3,e.artilleryCount+Math.ceil(e.aircraftCount/2)+Math.ceil(e.armorCount/2));jt&&jt.triggerBarrage({bursts:t,launchPlatforms:e.launchPlatforms,weaponTracks:e.weaponTracks})}function Fp(){const s=Xt();!s||An||(An=new vp(s))}function Wi(){return bp||!!En}function oT(s){if(!s||typeof s!="object"){En=null,An&&An.clear();return}En=s,Fp(),An&&An.setState(En)}window.addEventListener("message",s=>{if(!(s.origin!==window.location.origin||!s.data)){if(s.data.type==="firescope-battle-spectator-update"){oT(s.data.payload);return}if(s.data.type==="firescope-battle-spectator-command"){Fp(),An&&An.applyCommand(s.data.payload);return}if(s.data.type==="firescope-focus-fire-update"){aT(s.data.payload);return}if(s.data.type==="firescope-focus-fire-command"&&s.data.payload?.command==="start-barrage"){const e=Number(s.data.payload.bursts)||null,t=Np({...Dt??{},...s.data.payload});t&&(Dt=t,jt&&jt.setState(t)),jt&&(t??Dt)?Dp(e,t??Dt):Ui={bursts:e,focusState:t??Dt}}}});function lT(){const s=document.querySelector("#helpModal .modal-title"),e=document.querySelector("#helpModal .modal-body");if(s&&(s.textContent=be.mode==="drone"?"드론 안내":"비행 안내"),!!e){if(be.mode==="drone"){e.innerHTML=`
			<h3>기본 조작</h3>
			<div class="control-grid">
				<div class="key">W / S</div>
				<div>앞으로 / 뒤로 이동</div>
				<div class="key">↑ / ↓</div>
				<div>상승 / 하강</div>
				<div class="key">← / →</div>
				<div>좌우 이동</div>
				<div class="key">A / D</div>
				<div>좌우 회전</div>
			</div>
			<h3>시야</h3>
			<div class="control-grid">
				<div class="key">마우스 드래그</div>
				<div>주변 둘러보기</div>
				<div class="key">ESC / P</div>
				<div>잠시 멈추기</div>
			</div>
		`;return}e.innerHTML=`
		<h3>비행 조작</h3>
		<div class="control-grid">
			<div class="key">↑ / ↓</div>
			<div>기수 내리기 / 올리기</div>
			<div class="key">← / →</div>
			<div>좌우 기울이기</div>
			<div class="key">A / D</div>
			<div>좌우 방향 돌리기</div>
			<div class="key">W / S</div>
			<div>속도 올리기 / 내리기</div>
			<div class="key">스페이스</div>
			<div>순간 가속</div>
		</div>
		<h3>전투</h3>
		<div class="control-grid">
			<div class="key">1 / 2 / Q</div>
			<div>무기 바꾸기</div>
			<div class="key">F / 엔터</div>
			<div>선택한 무기 발사</div>
			<div class="key">R</div>
			<div>미사일 형식 바꾸기</div>
			<div class="key">V</div>
			<div>기만체 뿌리기</div>
			<div class="key">C</div>
			<div>카메라 모드 바꾸기</div>
		</div>
		<h3>시야</h3>
		<div class="control-grid">
			<div class="key">마우스 드래그</div>
			<div>주변 둘러보기</div>
			<div class="key">ESC / P</div>
			<div>잠시 멈추기</div>
		</div>
	`}}function cT(s){if(s.mode!=="drone")return null;const e=new Wt,t=new Vi({color:5597999,metalness:.45,roughness:.5}),n=new Vi({color:1843480,metalness:.2,roughness:.8}),i=new lt(new Si(1.25,.18,.42),t);e.add(i);const r=new lt(new Si(1.75,.05,.12),t);e.add(r);const a=new lt(new Si(.12,.05,1.75),t);e.add(a);const o=new lt(new Ro(.14,18,18),n);return o.position.set(0,-.16,.22),e.add(o),[[.85,.04,.85],[-.85,.04,.85],[.85,.04,-.85],[-.85,.04,-.85]].forEach(([c,h,u])=>{const d=new lt(new Gi(.025,.025,.14,12),n);d.position.set(c,h,u),e.add(d);const f=new lt(new Gi(.22,.22,.015,18),n);f.rotation.x=Math.PI/2,f.position.set(c,h+.08,u),e.add(f)}),e}function Kd(s,e=[]){fn=new Wt,fn.add(s),vi.add(fn),fn.layers.set(1),fn.traverse(l=>{l.layers.set(1)});const{x:t,y:n,z:i}=be.visual.baseRotation;s.rotation.x+=t,s.rotation.y+=n,s.rotation.z+=i,s.updateMatrixWorld(!0);const a=new _n().setFromObject(s).getCenter(new I);if(s.position.sub(a),fn.position.copy(Qn),fn.scale.setScalar(be.visual.scale),be.enableJetFlames){const l=new Rd,c=new Rd;l.group.position.set(-.4,-.065,5),c.group.position.set(.4,-.065,5),fn.add(l.group),fn.add(c.group),eh.push(l,c)}It=be.enableWeapons?new gb(Xt(),vi,fn):null,It&&(It.onKill=l=>{j.score+=1e3;try{Le.play("glitch-random")}catch{}Pt&&Pt.showKillNotification(l.name,1e3)},It.onMissileDetonate=l=>{Nt.mode===Qt.CINEMATIC&&(Nt.killCam={lon:l.lon,lat:l.lat,alt:l.alt,baseHeading:l.heading,duration:l.type==="npc"?1.8:1.35,timeRemaining:l.type==="npc"?1.8:1.35,orbitDirection:Math.random()>.5?1:-1})}),fn.traverse(l=>{l.layers.set(1)}),kr=null;const o=be.animation.name?Jr.findByName(e,be.animation.name):e[0];if(o){kr=new $f(s);const l=kr.clipAction(o);l.setLoop(be.animation.loop==="repeat"?_f:fh),l.clampWhenFinished=be.animation.loop!=="repeat",l.play()}dt.model=!0,bi()}function nh(s){const e=typeof s=="number"?s:s?.height;j.alt=Math.max(0,e||0)+be.spawnAltitudeOffset}function Up(s,e,t,n,i=0){const r=Array.isArray(e)?e.filter(o=>typeof o=="string"&&o.length>0):[];if(i>=r.length){n(new Error(`Unable to load any model from: ${r.join(", ")}`));return}const a=r[i];s.load(rn(a),o=>t(o,a),void 0,o=>{console.warn(`Failed to load model ${a}`,o),Up(s,r,t,n,i+1)})}const Vh=document.getElementById("mainMenu"),_s=document.getElementById("pauseMenu"),Hh=document.getElementById("crashMenu"),ai=document.getElementById("uiContainer"),Xi=document.getElementById("threeContainer"),Bo=document.getElementById("spawnInstruction"),hr=document.getElementById("confirmSpawnBtn");let Yt=null;const Wn=document.getElementById("startBtn"),Wl=document.getElementById("focus-fire-main-control"),$d=document.getElementById("focus-fire-main-status"),Jd=document.getElementById("focus-fire-main-objective"),Zd=document.getElementById("focus-fire-main-metrics"),wo=document.getElementById("focus-fire-main-start"),Zt=document.getElementById("loadingIndicator"),In=document.getElementById("loadingText");let Dt=null,Ui=null,En=null,ih=!1;const dt={audio:!1,model:!1,cesium:!1,globe:!1,failed:!1};function Op(){Vh.classList.add("hidden"),Bo.classList.add("hidden"),hr.classList.add("hidden"),ai.classList.add("hidden"),Xi.classList.add("hidden"),_s.classList.add("hidden"),Hh.classList.add("hidden");const s=document.getElementById("weapons-hud");s&&s.classList.add("hidden")}function hT(){const s=Array.isArray(En?.recentEvents)?[...En.recentEvents].reverse().find(i=>Number.isFinite(Number(i?.focusLongitude))&&Number.isFinite(Number(i?.focusLatitude))):null,e=Number.isFinite(Number(s?.focusLongitude))?Number(s.focusLongitude):Number.isFinite(Number(En?.centerLongitude))?Number(En.centerLongitude):j.lon,t=Number.isFinite(Number(s?.focusLatitude))?Number(s.focusLatitude):Number.isFinite(Number(En?.centerLatitude))?Number(En.centerLatitude):j.lat,n=Math.max(2600,Number(s?.focusAltitudeMeters)||0,j.alt+be.spawnAltitudeOffset+1600);return{longitude:e,latitude:t,altitudeMeters:n}}function uT(){if(!Wi()||ih)return;const s=Xt();if(!s)return;ih=!0,Tn(),Op(),ko(.2),ia(!1),lr(!1),Nt.killCam=null,j.cameraModeLabel="관전자",j.renderPlayerOverlay=!1,et=Ze.TRANSITIONING;const e=hT();s.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(e.longitude,e.latitude,e.altitudeMeters),orientation:{heading:Cesium.Math.toRadians(0),pitch:Cesium.Math.toRadians(-55),roll:0},duration:1.2,easingFunction:Cesium.EasingFunction.QUADRATIC_IN_OUT,complete:()=>{et=Ze.FLYING,Zt&&Zt.classList.add("hidden")}})}function bi(){if(!Zt||!In||!Wn)return;if(et===Ze.FLYING||et===Ze.TRANSITIONING){Zt.classList.add("hidden");return}if(Wi()){const t=dt.cesium&&dt.globe;if(dt.failed&&(!dt.cesium||!dt.globe)){In.textContent="전장 관전자 3D를 불러오지 못했습니다. 새로고침해 주세요.",In.style.color="#f00",Wn.disabled=!0,Wn.style.pointerEvents="none",Zt.classList.remove("hidden");return}if(t){In.textContent="전장 관전자 시점을 여는 중...",In.style.color="",Wn.disabled=!0,Wn.style.pointerEvents="none",Zt.classList.remove("hidden"),ih||window.setTimeout(()=>{uT()},0);return}In.textContent=dt.cesium?"지형 표면을 불러오는 중...":"위성 지도를 불러오는 중...",In.style.color="",Wn.disabled=!0,Wn.style.pointerEvents="none",Zt.classList.remove("hidden");return}let s="";const e=dt.audio&&dt.model&&dt.cesium&&dt.globe;if(dt.failed?s="불러오기에 실패했습니다. 새로고침해 주세요.":e||(dt.audio?dt.model?dt.cesium?dt.globe||(s="지형 표면을 불러오는 중..."):s="위성 지도를 불러오는 중...":s=be.loadingLabel:s="오디오를 불러오는 중..."),s){if(In.textContent=s,Wn.disabled=!0,Wn.style.pointerEvents="none",Zt.classList.remove("hidden"),dt.failed){In.style.color="#f00";const t=Zt.querySelector(".spinner");t&&(t.style.borderColor="rgba(255, 0, 0, 0.3)",t.style.borderTopColor="#f00")}}else Zt.classList.add("hidden"),Wn.disabled=!1,Wn.style.pointerEvents="auto",In.style.color=""}Wi()&&Op();async function dT(){Le.init(bn);const e=[{name:"boost",path:"assets/sounds/boost.mp3",loop:!1,volume:.35},{name:"throttle",path:"assets/sounds/throttle.mp3",loop:!1,volume:.4},{name:"explode",path:"assets/sounds/explode.mp3",loop:!1,volume:.75},{name:"explosion-1",path:"assets/sounds/explosion-1.mp3",loop:!1,volume:.8},{name:"explosion-2",path:"assets/sounds/explosion-2.mp3",loop:!1,volume:.8},{name:"explosion-3",path:"assets/sounds/explosion-3.mp3",loop:!1,volume:.8},{name:"ambient-crash",path:"assets/sounds/ambient.mp3",loop:!0,volume:.5},{name:"weapon-warning",path:"assets/sounds/weapon-warning-1.mp3",loop:!1,volume:1},{name:"jet-engine",path:"assets/sounds/jet-engine.mp3",loop:!0,volume:.5},{name:"spawn",path:"assets/sounds/spawn.mp3",loop:!1,volume:.5},{name:"roll",path:"assets/sounds/roll.mp3",loop:!0,volume:.75},{name:"pitch",path:"assets/sounds/pitch.mp3",loop:!0,volume:.75},{name:"button-click",path:"assets/sounds/button-click.mp3",loop:!1,volume:1},{name:"weapon-switch",path:"assets/sounds/weapon-switch.mp3",loop:!1,volume:.75},{name:"button-hover",path:"assets/sounds/button-hover.mp3",loop:!1,volume:.25},{name:"zoom-in",path:"assets/sounds/zoom-in.mp3",loop:!1,volume:.5},{name:"missile-fire",path:"assets/sounds/missile-firing-1.mp3",loop:!1,volume:.75},{name:"m61-firing",path:"assets/sounds/m61-firing.mp3",loop:!0,volume:.75},{name:"rwr-tws",path:"assets/sounds/rwr-tws.mp3",loop:!0,volume:.2},{name:"rwr-lock",path:"assets/sounds/rwr-lock.mp3",loop:!1,volume:.2},{name:"wind",path:"assets/sounds/wind.mp3",loop:!0,volume:.25},{name:"terrain-pull-up",path:"assets/sounds/terrain-pull-up.mp3",loop:!1,volume:.9},{name:"warning",path:"assets/sounds/warning.mp3",loop:!1,volume:.6},{name:"glitch-1",path:"assets/sounds/glitch-transition-1.mp3",loop:!1,volume:.25},{name:"glitch-2",path:"assets/sounds/glitch-transition-2.mp3",loop:!1,volume:.25},{name:"glitch-3",path:"assets/sounds/glitch-transition-3.mp3",loop:!1,volume:.25},{name:"glitch-4",path:"assets/sounds/glitch-transition-4.mp3",loop:!1,volume:.25}].map(i=>({...i,url:rn(i.path)})),n=(await Promise.allSettled(e.map(({name:i,url:r,loop:a,volume:o})=>Le.loadSound(i,r,a,o)))).flatMap((i,r)=>i.status==="rejected"?[{name:e[r].name,url:e[r].url,reason:i.reason}]:[]);if(n.length>0&&console.error("Failed to load one or more flight simulator sounds.",n),n.length===e.length)throw dt.failed=!0,bi(),new Error("Unable to load any flight simulator audio assets.");dt.audio=!0,bi(),fT()}function ko(s=.5){Le.stopAll(s)}function Gh(){Ap=Date.now(),Le.pauseAll()}function Bp(){const s=Date.now()-Ap;So>0&&(So+=s),Le.resumeAll()}function fT(){document.addEventListener("mouseover",s=>{const e=s.target.closest("button, .menu-btn, .clickable-ui");e&&!e._hovered&&Le.isUnlocked()&&(Le.play("button-hover"),e._hovered=!0,e.addEventListener("mouseleave",()=>{e._hovered=!1},{once:!0}))},!0),document.addEventListener("click",s=>{s.target.closest("button, .menu-btn, .clickable-ui, #search-toggle-btn")&&Le.play("button-click")},!0)}function pT(){bo=new Kf,vi=new xg,bn=new an(75,window.innerWidth/window.innerHeight,.1,1e5),Yn=new HM({alpha:!0,antialias:!0}),Yn.setSize(window.innerWidth,window.innerHeight),Yn.setPixelRatio(window.devicePixelRatio),Yn.setClearColor(0,0),Xi.appendChild(Yn.domElement),Xi.classList.add("hidden");const s=new R0(16777215,1);vi.add(s);const e=new Yf(16777215,1);e.position.set(5,10,5),vi.add(e),s.layers.enable(1),e.layers.enable(1),nT(),lT();try{Xn.init(vi,Xt())}catch{}dT().catch(n=>{console.error("Failed to init sounds",n),dt.audio||(dt.failed=!0,bi())});const t=new Nh;Up(t,be.modelCandidates,n=>{Kd(n.scene,n.animations)},n=>{const i=cT(be);if(i){console.warn("Drone GLB asset not found. Using built-in fallback drone model.",n),Kd(i,[]);return}console.error("Error loading model:",n),dt.failed=!0,bi()})}function mT(s){if(et!==Ze.FLYING)return;if(Wi()){j.cameraModeLabel="관전자",j.renderPlayerOverlay=!1;return}const e=To.update(),t=th.update(e,s),n=j.speed;j.speed=t.speed,j.pitch=t.pitch,j.roll=t.roll,j.heading=t.heading,j.throttle=e.throttle,j.yaw=e.yaw,j.isBoosting=t.isBoosting,j.weaponSystem=It,j.npcs=wn?wn.npcs:[],It&&(e.weaponIndex!==-1&&It.selectWeapon(e.weaponIndex),e.toggleWeapon&&It.toggleWeapon(),e.cycleMissileProfile&&It.cycleMissileProfile(),e.fire&&It.fire(j),e.fireFlare&&It.fireFlare(j),It.update(s,j,e)),e.cycleCameraMode&&Qb();const i=be.mode==="drone"?Bh(j.lon,j.lat,j.alt,j.heading,t.forwardSpeed*s,t.lateralSpeed*s,t.verticalSpeed*s):Hi(j.lon,j.lat,j.alt,j.heading,j.pitch,j.speed*s);j.lon=i.lon,j.lat=i.lat,j.alt=i.alt;const r=Date.now(),a=mp(j.lon,j.lat,oo.lon,oo.lat);if((r-Qc>Kb||a>$b)&&(Qc=r,oo={lon:j.lon,lat:j.lat},pp(j.lon,j.lat).then(l=>{l&&l!==Mo&&(Mo=l,Pt.showRegion(l))})),_T(),gT(),be.enableJetAudio&&Le.isPlaying("jet-engine")){const f=.5+Math.max(0,Math.min(1,(j.speed-100)/900))*(.6-.5);Le.setVolume("jet-engine",f)}be.enableBoost&&j.isBoosting&&!co&&Le.play("boost"),be.enableJetAudio&&j.throttle>Yd+.01&&(Le.isPlaying("throttle")||Le.play("throttle")),Yd=j.throttle,be.enableJetAudio&&Math.abs(e.pitch)>.5?Le.isPlaying("pitch")||Le.play("pitch",.1):Le.isPlaying("pitch")&&Le.stop("pitch",.1),be.enableJetAudio&&(Math.abs(e.roll)>.5||Math.abs(e.yaw)>.5)?Le.isPlaying("roll")||Le.play("roll",.1):Le.isPlaying("roll")&&Le.stop("roll",.1);const o=tT(s,e);if(j.cameraModeLabel=o.label,j.renderPlayerOverlay=o.renderPlayerOverlay,wn&&wn.update(s,j),Pt.update(j,et===Ze.FLYING?wn?wn.npcs:[]:[]),fn){const l=(j.speed-n)/s,c=e.isDragging?0:Math.max(-.5,Math.min(1.5,l*.001));let h=Qn.z-c,u=0;if(be.enableBoost&&t.isBoosting){co||(Ka=Math.random()>.5?1:-1);const F=t.boostDuration,U=Math.max(0,Math.min(1,1-t.boostTimeRemaining/F));if(Math.PI*2*t.boostRotations*Ka,U<.2){const B=U/.2;u=-(B*B)*1.5,Hs=0}else if(U<.8){const B=(U-.2)/.6;u=-1.5,Hs=(B<.5?4*B*B*B:1-Math.pow(-2*B+2,3)/2)*(Math.PI*2*t.boostRotations)*Ka}else{const B=(U-.8)/.2;u=-1.5+B*B*(3-2*B)*.7,Hs=Math.PI*2*t.boostRotations*Ka}}else Hs=0,u=0;co=t.isBoosting;const d=t.isBoosting?10*s:2*s;lo+=(u-lo)*d,h+=lo;const f=performance.now()*.001,m=Math.sin(f*.8)*(be.mode==="drone"?.015:.035),_=Math.cos(f*.6)*(be.mode==="drone"?.012:.025),g=Math.sin(f*.5)*(be.mode==="drone"?.01:.015),p=Math.cos(f*.4)*(be.mode==="drone"?.01:.015),T=Math.sin(f*.7)*(be.mode==="drone"?.012:.025),S=e.isDragging?Qn.x:be.mode==="drone"?Qn.x-e.strafe*.28-e.yaw*.1+m:Qn.x-e.roll*.6-e.yaw*.12+m,y=e.isDragging?Qn.y:be.mode==="drone"?Qn.y+e.vertical*.2-e.forward*.08+_:Qn.y-e.pitch*.1+_;let w=e.isDragging?0:be.mode==="drone"?Ft.degToRad(t.roll)+T:Ft.degToRad(-e.roll*15)+T;const P=e.isDragging?0:be.mode==="drone"?Ft.degToRad(t.pitch)+g:Ft.degToRad(e.pitch*10)+g,C=e.isDragging?0:be.mode==="drone"?Ft.degToRad(-e.yaw*8)+p:Ft.degToRad(-e.yaw*4)+p,L=be.enableBoost&&t.isBoosting?3*s:be.mode==="drone"?7*s:5*s;Fi.x+=(S-Fi.x)*L,Fi.y+=(y-Fi.y)*L,Fi.z+=(h-Fi.z)*L,Jn.z+=(w-Jn.z)*L,Jn.x+=(P-Jn.x)*L,Jn.y+=(C-Jn.y)*L;const v=new Bt().setFromEuler(new Kt(Ft.degToRad(-e.cameraPitch),Ft.degToRad(-e.cameraYaw),0,"YXZ"));fn.position.copy(Fi);const b=new Bt().setFromEuler(new Kt(Jn.x,Jn.y,Jn.z+Hs)),R=v.clone().invert().multiply(b);fn.quaternion.copy(R),be.enableJetFlames&&eh.length>0&&eh.forEach(F=>{F.update(j.throttle,j.isBoosting,bo.getElapsedTime(),s)})}}function gT(){if(et!==Ze.FLYING){Pt.setPullUpWarning(!1);return}if(!be.enableGpws){Pt.setPullUpWarning(!1);return}const s=Xt();if(!s)return;const e=Cesium.Cartographic.fromDegrees(j.lon,j.lat),t=s.scene.globe.getHeight(e);if(t===void 0)return;const n=j.alt-t,i=Cesium.Math.toRadians(j.pitch),r=j.speed*Math.sin(i);let a=!1;if(j.pitch<-1&&n<450&&(n<150&&(a=!0),r<-20&&(a=!0)),Pt.setPullUpWarning(a),a){const o=Date.now();(!ja||o-So>Jb&&!Le.isPlaying("terrain-pull-up"))&&(Le.play("terrain-pull-up"),So=o),ja=!0}else ja&&(Le.stop("terrain-pull-up",.1),ja=!1)}let Qd=0,kp=0;function _T(){if(et!==Ze.FLYING)return;const s=Date.now();if(s-Qd<100||(Qd=s,s-kp<3e3))return;const e=Xt();if(!e)return;const t=Cesium.Cartographic.fromDegrees(j.lon,j.lat),n=e.scene.globe.getHeight(t);if(n!==void 0&&j.alt<=n+be.crashClearance){et=Ze.CRASHED,Rt&&Rt.stop(),ai.classList.add("hidden");const i=document.getElementById("weapons-hud");i&&i.classList.add("hidden"),Xi.classList.add("hidden"),Hh.classList.remove("hidden"),Pt.update(j,[]),ko(.1),setTimeout(()=>{Le.play("explode"),Le.play("ambient-crash")},50)}}function zp(){requestAnimationFrame(zp);const s=bo?bo.getDelta():.016,e=performance.now();if(Vl++,e-Hl>=1e3){qd=Vl*1e3/(e-Hl),Vl=0,Hl=e,Pt.updateFPS(qd);const t=document.getElementById("menu-time");t&&(t.textContent=new Date().toISOString().split(".")[0]+"Z")}if(et===Ze.FLYING||et===Ze.PAUSED||et===Ze.TRANSITIONING){const t=Xt();if(Yn.autoClear=!1,Yn.clear(),t&&t.camera&&t.camera.frustum.fovy){const n=Cesium.Math.toDegrees(t.camera.frustum.fovy);bn.fov=n,bn.aspect=window.innerWidth/window.innerHeight,bn.updateProjectionMatrix()}bn.layers.set(0),et===Ze.FLYING?mT(s):et===Ze.PAUSED&&Pt.updatePauseMenu(j,Mo,wn?wn.npcs:[]),jt&&jt.update(et===Ze.FLYING?s:0),An&&An.update(et===Ze.FLYING?s:s*.3),zh(),kr&&kr.update(s);try{et===Ze.FLYING&&Xn.update(s)}catch{}Yn.render(vi,bn),Yn.clearDepth(),j.renderPlayerOverlay!==!1&&(bn.fov=75,bn.updateProjectionMatrix(),bn.layers.set(1),Yn.render(vi,bn))}else Xi.classList.add("hidden")}function Tn(){document.querySelectorAll(".modal").forEach(s=>s.classList.add("hidden"))}function xT(){const s=new URL(window.location.href),e=Ep(j.lon,j.lat);s.searchParams.set("lon",e.lon.toFixed(6)),s.searchParams.set("lat",e.lat.toFixed(6)),Number.isFinite(j.alt)&&s.searchParams.set("alt",j.alt.toFixed(0)),Sp!=="drone"&&s.searchParams.set("craft",st.selectedJetCraftId),window.history.replaceState({},"",s.toString()),window.location.reload()}function vT(){document.getElementById("helpBtn").onclick=()=>{Tn(),document.getElementById("helpModal").classList.remove("hidden")},document.getElementById("optionsBtn").onclick=()=>{Tn(),Zc(),document.getElementById("optionsModal").classList.remove("hidden")},document.getElementById("pauseOptionsBtn").onclick=()=>{Tn(),Zc(),document.getElementById("optionsModal").classList.remove("hidden")},document.getElementById("pauseHelpBtn").onclick=()=>{Tn(),document.getElementById("helpModal").classList.remove("hidden")},document.getElementById("creditsBtn").onclick=()=>{Tn(),document.getElementById("creditsModal").classList.remove("hidden")},document.getElementById("aboutBtn").onclick=()=>{Tn(),document.getElementById("aboutBtnModal").classList.remove("hidden")},document.getElementById("sensitivitySlider").oninput=s=>{document.getElementById("sensitivityValue").textContent=s.target.value},document.getElementById("saveOptionsBtn").onclick=()=>{const s=document.getElementById("jetCraftSelect");st.graphicsQuality=document.getElementById("graphicsQuality").value,st.antialiasing=document.getElementById("antialiasing").checked,st.fogEffects=document.getElementById("fogEffects").checked,st.mouseSensitivity=parseFloat(document.getElementById("sensitivitySlider").value),st.showHud=document.getElementById("showHud").checked,st.showHorizonLines=document.getElementById("showHorizonLines").checked,st.soundEnabled=document.getElementById("soundEnabled").checked,st.minimapRange=parseInt(document.getElementById("minimapRange").value,10),s&&be.mode==="jet"&&(st.selectedJetCraftId=s.value),Xb(),Cp(),Tn(),be.mode==="jet"&&st.selectedJetCraftId!==be.id&&xT()},document.querySelectorAll(".close-modal").forEach(s=>{s.onclick=e=>{e.stopPropagation(),s.closest(".modal").classList.add("hidden")}}),window.addEventListener("click",s=>{s.target.classList.contains("modal")&&s.target.classList.add("hidden")})}document.getElementById("startBtn").onclick=()=>{Tn(),Vh.classList.add("hidden"),Wh(!1)};wo&&(wo.onclick=()=>{Dp()});vT();document.getElementById("resumeBtn").onclick=()=>{Tn(),_s.classList.add("hidden"),ai.classList.remove("hidden");const s=document.getElementById("weapons-hud");s&&s.classList.toggle("hidden",!be.enableWeapons),et=Ze.FLYING,Rt&&Rt.resume(),Bp()};document.getElementById("restartBtn").onclick=()=>{Tn(),_s.classList.add("hidden"),Rt&&Rt.stop(),Wh(!0)};document.getElementById("quitBtn").onclick=()=>{Tn(),Rt&&Rt.stop(),lr(!0),location.reload()};document.getElementById("respawnBtn").onclick=()=>{Tn(),Hh.classList.add("hidden"),Rt&&Rt.stop(),Wh(!0)};function Wh(s=!0){j.score=0,wn&&wn.clear(),jt&&jt.clearProjectiles(),It&&typeof It.clearProjectiles=="function"&&It.clearProjectiles(),Nt.killCam=null,ko(.3),Le.play("zoom-in"),Le.play("wind",1);const e=document.getElementById("transition-vignette");s&&e&&(e.style.opacity="1"),setTimeout(()=>{Bo.classList.remove("hidden"),Xi.classList.add("hidden"),ai.classList.add("hidden");const n=document.getElementById("weapons-hud");n&&n.classList.add("hidden"),et=Ze.PICK_SPAWN,hr.classList.add("hidden");const i=document.getElementById("locationSearch"),r=document.getElementById("instruction-text"),a=document.getElementById("search-results");i&&(i.value="",i.style.display="none"),r&&(r.style.display="block",r.textContent="지도의 원하는 위치를 클릭해 출발 지점을 고르세요"),a&&(a.style.display="none"),lr(!1),ia(!0),Yt&&(Xt().entities.remove(Yt),Yt=null),Xt().camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(j.lon,j.lat,15e3),duration:2,complete:()=>{e&&(e.style.opacity="0")}})},s?500:0)}function yT(){Le.play("zoom-in"),Le.stop("wind",1),ko(.3),jt&&jt.clearProjectiles(),Bo.classList.add("hidden"),hr.classList.add("hidden"),Vh.classList.remove("hidden"),et=Ze.MENU,Zt.classList.add("hidden"),lr(!0),ia(!1),Yt&&(Xt().entities.remove(Yt),Yt=null),Xt().camera.flyTo({...Rp,duration:2.5})}function MT(){const s=Xt(),e=new Cesium.ScreenSpaceEventHandler(s.scene.canvas),t=document.getElementById("instruction-text");e.setInputAction(n=>{if(et!==Ze.PICK_SPAWN)return;const i=s.camera.getPickRay(n.position),r=s.scene.globe.pick(i,s.scene);if(r){const a=Cesium.Cartographic.fromCartesian(r),o=Cesium.Math.toDegrees(a.longitude),l=Cesium.Math.toDegrees(a.latitude);j.lon=o,j.lat=l,nh(a),t.textContent="위치 정보를 확인하는 중...",pp(o,l).then(c=>{c&&et===Ze.PICK_SPAWN&&(t.textContent=c,Yt&&(Yt.label.text=c))}).catch(()=>{}),Cesium.sampleTerrainMostDetailed(s.terrainProvider,[a]).then(([c])=>nh(c)).catch(()=>{}),Yt&&s.entities.remove(Yt),Yt=s.entities.add({position:r,point:{pixelSize:15,color:Cesium.Color.RED,outlineColor:Cesium.Color.WHITE,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY},label:{text:"선택한 출격 지점",font:`14pt ${getComputedStyle(document.body).fontFamily}`,style:Cesium.LabelStyle.FILL_AND_OUTLINE,outlineWidth:2,verticalOrigin:Cesium.VerticalOrigin.BOTTOM,pixelOffset:new Cesium.Cartesian2(0,-20),disableDepthTestDistance:Number.POSITIVE_INFINITY}}),hr.classList.remove("hidden")}},Cesium.ScreenSpaceEventType.LEFT_CLICK)}function ST(){const s=document.getElementById("locationSearch"),e=document.getElementById("search-results"),t=document.getElementById("instruction-text"),n=document.getElementById("search-toggle-btn"),i=n?n.innerHTML:"";let r;n&&(n.onclick=a=>{a.stopPropagation(),s.style.display==="block"?(s.style.display="none",t.style.display="block",e.style.display="none"):(s.style.display="block",t.style.display="none",s.focus())}),s.addEventListener("input",a=>{clearTimeout(r);const o=a.target.value.trim();if(o.length<3){e.style.display="none";return}r=setTimeout(async()=>{n&&(n.innerHTML='<div class="loader-spinner"></div>');try{const c=await(await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(o)}&limit=5`)).json();e.innerHTML="",c.length>0?(c.forEach(h=>{const u=document.createElement("div");u.textContent=h.display_name,u.style.padding="10px",u.style.cursor="pointer",u.onclick=()=>{const d=parseFloat(h.lon),f=parseFloat(h.lat),m=Xt(),_=Cesium.Cartesian3.fromDegrees(d,f);j.lon=d,j.lat=f,j.alt=be.spawnAltitudeOffset;const g=Cesium.Cartographic.fromDegrees(d,f);Cesium.sampleTerrainMostDetailed(m.terrainProvider,[g]).then(([p])=>{nh(p)}).catch(()=>{}),m.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(d,f,15e3),duration:1.5}),Yt&&m.entities.remove(Yt),Yt=m.entities.add({position:_,point:{pixelSize:15,color:Cesium.Color.RED,outlineColor:Cesium.Color.WHITE,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY},label:{text:h.display_name.split(",")[0],font:`14pt ${getComputedStyle(document.body).fontFamily}`,style:Cesium.LabelStyle.FILL_AND_OUTLINE,outlineWidth:2,verticalOrigin:Cesium.VerticalOrigin.BOTTOM,pixelOffset:new Cesium.Cartesian2(0,-20),disableDepthTestDistance:Number.POSITIVE_INFINITY}}),hr.classList.remove("hidden"),e.style.display="none",s.style.display="none",t.style.display="block",t.textContent=h.display_name.split(",")[0],s.value=h.display_name},e.appendChild(u)}),e.style.display="block"):e.style.display="none"}catch(l){console.error("Search error:",l)}finally{n&&(n.innerHTML=i)}},500)}),document.addEventListener("click",a=>{!s.contains(a.target)&&!e.contains(a.target)&&!n.contains(a.target)&&(e.style.display="none",s.style.display==="block"&&(s.style.display="none",t.style.display="block"))})}document.getElementById("confirmSpawnBtn").onclick=()=>{const s=document.getElementById("transition-vignette");s&&(s.style.opacity="1"),Le.play("spawn"),setTimeout(()=>{const e=Xt();Yt&&(e.entities.remove(Yt),Yt=null),ia(!1),j.speed=be.initialSpeed,j.pitch=0,j.roll=0,j.cameraModeLabel=ra[Nt.mode],j.renderPlayerOverlay=!0,Nt.killCam=null;try{const t=e&&e.camera;t&&typeof t.heading=="number"?j.heading=Cesium.Math.toDegrees(t.heading):j.heading=0}catch{j.heading=0}Mo=null,Qc=0,oo={lon:0,lat:0},Fi.copy(Qn),Jn.set(0,0,0),Hs=0,lo=0,co=!1,To.reset(),th=Pp(be),th.reset(j.lon,j.lat,j.alt,j.heading,j.pitch,j.roll),Pt.resetTime(),Pt.resizeMinimap(),It&&typeof It.resetAmmo=="function"&&(It.resetAmmo(),typeof It.clearProjectiles=="function"&&It.clearProjectiles()),be.enableNpc&&wn&&wn.spawnNPC(j.lon,j.lat,j.alt),Bo.classList.add("hidden"),hr.classList.add("hidden"),Zt.classList.add("hidden"),et=Ze.TRANSITIONING,lr(!1),e.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(j.lon,j.lat,j.alt),orientation:{heading:Cesium.Math.toRadians(j.heading),pitch:Cesium.Math.toRadians(j.pitch),roll:Cesium.Math.toRadians(j.roll)},duration:2,easingFunction:Cesium.EasingFunction.QUADRATIC_IN_OUT,complete:()=>{kp=Date.now(),ai.classList.remove("hidden");const t=document.getElementById("weapons-hud");t&&t.classList.toggle("hidden",!be.enableWeapons),Xi.classList.remove("hidden"),Pt.resizeMinimap(),et=Ze.FLYING,be.enableJetAudio&&Le.play("jet-engine",1),s&&(s.style.opacity="0"),Rt&&Rt.start()}})},500)};window.addEventListener("keydown",s=>{const e=s.key.toLowerCase();if(e==="escape"){const t=document.querySelectorAll(".modal:not(.hidden)");if(t.length>0){t.forEach(n=>n.classList.add("hidden"));return}}if(e==="escape"||e==="p"){if(Wi())return;if(et===Ze.FLYING){et=Ze.PAUSED,Rt&&Rt.pause(),ai.classList.add("hidden");const t=document.getElementById("weapons-hud");t&&t.classList.add("hidden"),_s.classList.remove("hidden"),Pt.resizeMinimap(),Gh(),Pt.update(j,[])}else if(et===Ze.PAUSED){et=Ze.FLYING,Rt&&Rt.resume(),_s.classList.add("hidden"),ai.classList.remove("hidden");const t=document.getElementById("weapons-hud");t&&t.classList.toggle("hidden",!be.enableWeapons),Bp()}else et===Ze.PICK_SPAWN&&e==="escape"&&yT()}if(e==="z"&&et===Ze.FLYING){if(Wi())return;Rt&&Rt.skip()}});document.addEventListener("visibilitychange",()=>{Wi()||document.hidden&&et===Ze.FLYING&&(et=Ze.PAUSED,Rt&&Rt.pause(),ai.classList.add("hidden"),_s.classList.remove("hidden"),Pt.resizeMinimap(),Gh(),Pt.update(j,[]))});window.addEventListener("blur",()=>{Wi()||et===Ze.FLYING&&(et=Ze.PAUSED,Rt&&Rt.pause(),ai.classList.add("hidden"),_s.classList.remove("hidden"),Pt.resizeMinimap(),Gh(),Pt.update(j,[]))});const Eo=()=>{Le.unlock(),window.removeEventListener("pointerdown",Eo),window.removeEventListener("keydown",Eo)};window.addEventListener("pointerdown",Eo);window.addEventListener("keydown",Eo);let ef=!1;function bT(s){ef||(ef=!0,pT(),wn=be.enableNpc?new Ub(s,vi,new Nh):null,jt=new vb(s),(bp||En)&&(An=new vp(s)),Dt&&jt.setState(Dt),An&&En&&An.setState(En),Ui&&(Ui.focusState&&jt.setState(Ui.focusState),jt.triggerBarrage({bursts:Ui.bursts,launchPlatforms:Ui.focusState?.launchPlatforms,weaponTracks:Ui.focusState?.weaponTracks}),Ui=null))}function TT(s){const e=()=>bT(s);if(typeof window.requestIdleCallback=="function"){window.requestIdleCallback(e,{timeout:1500});return}window.setTimeout(e,0)}async function wT(){const s=await VS({lon:j.lon,lat:j.lat,alt:Tp&&!wp?Math.max(j.alt+be.spawnAltitudeOffset,2800):Math.max(j.alt+be.spawnAltitudeOffset,12e3)});dt.cesium=!0,bi();const e=s.scene.postRender.addEventListener(()=>{if(s.scene.globe.tilesLoaded){const n=s.scene.globe._surface;n&&n._tilesToRender&&n._tilesToRender.length>0&&(dt.globe=!0,bi(),e())}});s.scene.globe.tileLoadProgressEvent.addEventListener(t=>{Zt&&In&&(et===Ze.PICK_SPAWN?t>0?(In.textContent="지형 데이터를 불러오는 중...",Zt.classList.remove("hidden")):Zt.classList.add("hidden"):dt.audio&&dt.model&&dt.cesium&&dt.globe&&Zt.classList.add("hidden"))}),Rp={destination:s.camera.position.clone(),orientation:{heading:s.camera.heading,pitch:s.camera.pitch,roll:s.camera.roll}},TT(s),MT(),ST(),Wb(),zh(),ai.classList.add("hidden"),Xi.classList.add("hidden"),bi(),lr(!0),zp(),window.addEventListener("resize",()=>{bn.aspect=window.innerWidth/window.innerHeight,bn.updateProjectionMatrix(),Yn.setSize(window.innerWidth,window.innerHeight);const t=Xt();t?.resize&&t.resize()}),window.addEventListener("contextmenu",t=>{t.preventDefault()},!1)}wT().catch(s=>{console.error("Failed to initialize flight simulator.",s),dt.failed=!0,bi()});
