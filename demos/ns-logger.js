/*! NsLogger | (c) Stéphane Francel | https://github.com/avine/ns-logger */
((exports)=>{"use strict";var Severity;Object.defineProperty(exports,"__esModule",{value:!0}),function(e){e[e.Trace=0]="Trace",e[e.Log=1]="Log",e[e.Warn=2]="Warn",e[e.Error=3]="Error",e[e.Silent=4]="Silent"}(Severity=exports.Severity||(exports.Severity={}));const settings={defaultSeverity:Severity.Warn,disabled:!1};exports.setDefaultSeverity=(e=>{settings.defaultSeverity=e}),exports.disableInProduction=(()=>{settings.disabled=!0});const LOG_LEVELS=["trace","log","warn","error"];exports.bindTo={console:(e,t)=>console[e].bind(console,`[${t}]`),noop:function(){}};const loggerBuilder=(e,t)=>LOG_LEVELS.reduce((r,s,o)=>(r[s]=o>=t&&!settings.disabled?exports.bindTo.console(s,e):exports.bindTo.noop,r),{});class Logger{constructor(e,t){this.namespace=e,this.severity=t,this.level=t}get name(){return this.namespace}get level(){return this.severity}set level(e){this.severity=e,Object.assign(this,loggerBuilder(this.namespace,e))}}exports.Logger=Logger,exports.getSeverityState=(e=>e.split(";").reduce((e,t)=>{const r=t.split("="),s=r[0].trim(),o=+r[1];return s&&Severity[o]in Severity&&(e[s]=o),e},{}));const getStoredSeverityState=()=>{try{const e=localStorage.getItem("NsLogger");if(e)return exports.getSeverityState(e)}catch(e){}return{}};exports.state={severity:getStoredSeverityState(),logger:{}},exports.cleanState=(()=>{exports.state.severity={},exports.state.logger={}});const getSeverity=e=>{let t=exports.state.severity[e];if(void 0===t){const[r,s]=e.split(":");s&&(t=exports.state.severity[`${r}:*`]),void 0===t&&(t=exports.state.severity["*"]),void 0===t&&(t=settings.defaultSeverity)}return t};exports.getLogger=(e=>exports.state.logger[e]?exports.state.logger[e]:exports.state.logger[e]=new Logger(e,getSeverity(e)));})(this.NsLogger=this.NsLogger||{});