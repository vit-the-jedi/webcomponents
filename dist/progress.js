var h=Object.defineProperty;var m=(n,s,e)=>s in n?h(n,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[s]=e;var c=(n,s,e)=>(m(n,typeof s!="symbol"?s+"":s,e),e);import{E as d,S as l}from"./observers.js";const o=new d;class f extends HTMLElement{constructor(){super();c(this,"startPageChangeListener",e=>{if(!this.getProgressState.pageObserverAdded){const t=(r,g)=>{for(const i of r)if(i.addedNodes.length>0&&i.addedNodes[0].classList.contains("page")){const p=i.addedNodes[0].id.slice(2);if(!Impressure.context.getState().pages[p].name.toLowerCase().includes("integration")){window.initProgressComponent(this.configs);break}}};new MutationObserver(t).observe(document.querySelector(".survey"),{childList:!0}),this.getProgressState.pageObserverAdded=!0}});this._listeners={},this.observers={},this._progressState={},this._configs={},this._devMode=!0,this.addObserver(new l,"state"),this.addObserver(o,"event")}set setProgressState(e){this.log("setting progress state"),this.log(e),this._progressState=e}get getProgressState(){return this._progressState}set percentcomplete(e){this._progressState.percentcomplete=e}get percentcomplete(){return this._progressState.percentcomplete}set setStepsRemaining(e){this._progressState.stepsRemaining=e}get getStepsRemaining(){return this._progressState.stepsRemaining}set configs(e){this._configs=e}get configs(){return this._configs}get componentType(){return this.configs.type}set impressurePageId(e){this.impressurePageHistory.push(e)}addObserver(e,t){this.observers[t]||(this.observers[t]=[]),this.observers[t].push(e)}removeObserver(e){const t=this.observers.indexOf(e);t>-1&&this.observers.splice(t,1)}notifyStateUpdate(e){this.observers.state.forEach(async t=>t.update(e,this))}log(e){this._devMode&&console.log(e)}isImpressureEmbedded(){return!!window.top.Impressure}pushImpressurePageId(){}async initState(e){let t=null;if(Object.keys(o.getEventListeners).length>0)for(const r of Object.keys(o.getEventListeners))t=[],t.push(r);this.isImpressureEmbedded()&&(this.impressurePageHistory=[]),this.configs=e;const a=JSON.parse(sessionStorage.getItem("custom-component__state"));if(a)this.setProgressState=a._progressState,this.configs=a._configs;else{const r=this.configs.steps,g=this.configs.type,i=this.configs.max,p=Number((g==="steps"?1:i/r).toFixed(2));this.setProgressState={activeStep:0,numOfSteps:r,stepIncrement:p,steps:new Map,percentcomplete:0,maxValue:i,stepsRemaining:r}}o.createComponentCreationEventLoop(t),o.dispatchEvents("create",this),this.isImpressureEmbedded()&&this.startPageChangeListener()}setStepToList(e,t){this._progressState.steps.set(e,t)}getStepFromList(e){return this._progressState.steps.get(e)}getStepsListFromState(){return this._progressState.steps}setActiveStepInState(){let e;const t=this.getProgressState;t!=null&&t.pause&&(t==null?void 0:t.pause)!==0?e=Number((t.activeStep+t.stepIncrement/t.stepChange).toFixed(2)):e=t.activeStep+t.stepIncrement>t.maxValue?t.maxValue:t.activeStep+t.stepIncrement,t.activeStep=e}setStepsRemainingInState(){this.setStepsRemaining=Math.max(this.getStepsRemaining-1,0)}updateComponent(e){this.percentcomplete=e,this.setAttribute("percentcomplete",e)}checkIfComplete(){var t;const e=this.getProgressState;return Math.round(e.activeStep)===e.maxValue?(this.deleteState(),(t=this.configs)!=null&&t.removeOnComplete&&o.dispatchEvents("destroy",this),!0):!1}mountComponent(){return new Promise(e=>{this.getAnchorPoint(this.configs.anchorPoint).then(t=>{t.parentElement.insertBefore(this,t.nextElementSibling)}).then(()=>{e()})})}unmountComponent(){this&&this.parentElement&&this.parentElement.removeChild(this)}getState(){return{_progressState:this.getProgressState,_listeners:this._listeners,_configs:this.configs}}saveState(){sessionStorage.setItem("custom-component__state",JSON.stringify(this.getState()))}deleteState(){sessionStorage.removeItem("custom-component__state")}removeKeysFromState(e){for(const t of e)delete this.getProgressState[t]}createGlobalStyles(){const e=`
        .progress-wrapper {
            transition-property: all;
            transition-duration: ${this.configs.transitionDuration/1e3}s;
            transition-timing-function: ease-in;
            opacity: 1;
        }
        .updating {
            opacity: 0;
        }
        `,t=document.createElement("style");return t.textContent=e,t}}export{f as P};
