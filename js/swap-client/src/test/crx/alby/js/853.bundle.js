"use strict";(self.webpackChunklightning_browser_extension=self.webpackChunklightning_browser_extension||[]).push([[853],{9853:(s,e,o)=>{o.r(e),o.d(e,{default:()=>n});const n=class{onopen;onclose;onerror;onmessage;send;close;constructor(s,e){e.on("connect",(()=>{this.onopen&&this.onopen()})),e.on("close",(()=>{this.onclose&&this.onclose()})),e.on("error",(s=>{this.onerror&&this.onerror(s)})),e.on("data",(s=>{this.onmessage&&this.onmessage({data:s})})),this.send=s=>{e.write(s)},this.close=()=>{e.removeAllListeners(),e.destroy()};const o=new URL(s),{host:n}=o,[t,r]=n.split(":");e.connect(parseInt(r),t)}}}}]);