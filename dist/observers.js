class c{update(t,e){const n=e.getProgressState;n!=null&&n.pause&&n.pause!==0?(n.pause=Math.max(n.pause-1,0),n.pause===1&&e.setStepsRemainingInState()):(e.removeKeysFromState(["pause","stepChange"]),e.setStepsRemainingInState()),e.updateComponent(Math.ceil(t.activeStep))}}class m{constructor(){this.queue=[],this.eventListeners=[]}set createQueue(t){this.queue.create=t}get getCreateQueue(){return this.queue.create}set setEvent(t){this.getEvents.push(t)}set updateEventArray(t){this.eventListeners=t}get getEvents(){return this.eventListeners}update(t){this.setEvent=t}createComponentCreationEventLoop(t=null){this.queue.create=[],this.addEventToQueue("create","componentBeforeCreate"),this.addEventToQueue("create","componentCreated"),this.addEventToQueue("create","componentBeforeMount"),this.addEventToQueue("create","componentMounted"),this.getEvents.length>0&&this.interceptEventLoop(this.getEvents)}createComponentDestructionEventLoop(){this.queue.destroy=[],this.addEventToQueue("destroy","componentBeforeUnmount"),this.addEventToQueue("destroy","componentUnmounted")}validateEvent(t,e){const n=Object.getPrototypeOf(this);if(this.getCreateQueue.length>1&&this.getCreateQueue.filter(s=>{if(s.name===e)return s}).length>0)return!1;if(typeof n[e]!="function"){const r=new Error;throw r.name="MethodNotFound",r.message=`You must specify a method that is a function, and exists on this observer. Make sure "${e}" is an event handler method on this observer.`,r}return!0}addEventToQueue(t,e,n=null){let r;try{r=this.validateEvent(t,e)}catch(s){console.error(s)}r&&(typeof n=="number"?this.queue[t].splice(n,0,this[e]):this.queue[t].push(this[e]))}interceptEventLoop(t){t.forEach((e,n,r)=>{const s=e.data.eventLoopTarget;this.addEventToQueue("create",e.name,s)})}removeItemFromEventLoop(t){this.getCreateQueue.splice(this.getCreateQueue.indexOf(this[t]),1)}checkForEvents(){return new Promise((t,e)=>{Object.keys(this.eventListeners).length>0?t(!0):t(!1)})}eventWrapper(t,e,n){return new Promise((r,s)=>{try{t(e,n).then(a=>{r(a)})}catch(a){r(a)}})}dispatchEvents(t,e){var n;(n=this.queue[t])==null||n.reduce(async(r,s)=>{await r;const a=s.bind(this);return this.eventWrapper(a,s.name,e)},Promise.resolve())}componentBeforeCreate(t,e){return new Promise((n,r)=>{e.log("Component before create"),e.componentType==="steps"?(e._progressState.stepIncrement=1,e.setActiveStepInState(1)):e.setActiveStepInState(),n(t)})}componentCreated(t,e){return new Promise(async(n,r)=>{await e.createComponent().then(s=>{e.checkIfComplete()?(e.unmountComponent(),e.log("Component lifecycle cancelled. This is a manual action, most likely because configs.removeOnComplete is set to true."),this.queue.create=[],sessionStorage.setItem("custom-component__done",!0)):(e.notifyStateUpdate(e._progressState),n(t))})})}componentBeforeMount(t,e){return new Promise((n,r)=>{e.log("Component before mount"),n(t)})}componentMounted(t,e){return new Promise((n,r)=>{e.log("Component mounted"),window.top._customComponentProps={},window.top._customComponentProps.element=e,window.top._customComponentProps.anchor=e.configs.anchorPoint,e.getComponentAnchorPoint().then(()=>{e.mountComponent().then(()=>{e.isImpressureEmbedded()&&!e.getProgressState.pageObserverAdded&&e.startPageChangeListener(),e.saveState(),n(t)})})})}componentStepValueChange(t,e){return new Promise((n,r)=>{const s=this.getEvents.filter(u=>{if(u.name===t)return u})[0];e.log("Component step value update");let a;const o=e.getProgressState,i=s.data.addedSteps?s.data.addedSteps:s.data.removedSteps*-1;s.data.removedSteps?(a=Math.max(o.stepsRemaining+1+i,0),a===0?(o.stepsRemaining=0,o.stepIncrementt=o.maxValue/o.numOfSteps,o.activeStep=o.maxValue,o.percentcomplete=o.maxValue):(o.numOfSteps=a,o.stepsRemaining=a,o.stepIncrement=o.maxValue/a,o.activeStep=o.maxValue-o.stepsRemaining*o.stepIncrement,o.percentcomplete=o.activeStep)):(o.pause=s.data.addedSteps+1,o.stepChange=i),s.data.once&&(this.getEvents.splice(this.getEvents.indexOf(s),1),this.removeItemFromEventLoop(t)),n(t)})}}export{m as E,c as S};
