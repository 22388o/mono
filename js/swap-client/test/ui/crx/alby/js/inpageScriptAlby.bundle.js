(() => { 'use strict'; class e {enabled; constructor () { this.enabled = !1 } async enable () { if (this.enabled) return { enabled: !0 }; const e = await this.execute('enable'); return typeof e.enabled === 'boolean' && (this.enabled = e.enabled), e }addAccount (e) { if (!this.enabled) throw new Error('Provider must be enabled before calling addAccount'); return this.execute('addAccount', { name: e.name, connector: e.connector, config: e.config }) }execute (e, a) { return (function (e, a, n) { return new Promise((t, o) => { const r = Math.random().toString().slice(4); window.postMessage({ id: r, application: 'LBE', prompt: !0, action: `${e}/${a}`, scope: e, args: n }, '*'), window.addEventListener('message', function a (n) { n.data && n.data.response && n.data.application === 'LBE' && n.data.scope === e && n.data.id === r && (n.data.data.error ? o(new Error(n.data.data.error)) : t(n.data.data.data), window.removeEventListener('message', a)) }) }) }('alby', e, a)) }}document && (window.alby = new e()) })()