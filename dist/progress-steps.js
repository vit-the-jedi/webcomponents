import{P as c}from"./progress.js";import"./observers.js";class l extends c{constructor(){super();const e=this.attachShadow({mode:"open"});this.shadow=e,document.createElement("div").classList.add("progress-container");const o=document.createElement("div");o.classList.add("progress-wrapper");const i=document.createElement("ul");o.appendChild(i),this.shadow.appendChild(o)}static get observedAttributes(){return["percentcomplete"]}attributeChangedCallback(e,n,o){const i=this.shadowRoot,s=i.querySelector(".progress-wrapper");s.classList.add("updating"),setTimeout(()=>{var r,a;s.classList.remove("updating"),(r=i.querySelector(".active"))==null||r.classList.remove("active"),(a=i.querySelector(".active"))==null||a.classList.remove("inactive");const t=this.getStepFromList(this.getActiveStepFromState());t?(t.classList.remove("inactive"),t.classList.add("active")):this.getStepFromList(1).classList.add("active")},this.getConfigs("transitionDuration"))}get percentcomplete(){return this._percentcomplete}set percentcomplete(e){this._percentcomplete<=this._maxValue&&this.setAttribute("percentcomplete",e)}createStyles(){const e=this.getConfigs("mainColor"),n=`
    .progress-wrapper {
      margin-bottom: 1em;
    }
    ul {
        display: table;
        table-layout: fixed;
        width: 100%;
        margin: 0;
        padding: 0;
        counter-reset: steps 0;
    }
    li {
      text-align: center;
      display: table-cell;
      position: relative;
      list-style-type:none;
      font-family: ${this.getConfigs("font")};
      font-size: 85%;
    }
    li::before{
      color: ${e||"black"};
      display: block;
      margin: 0 auto 4px;
      width: 36px;
      height: 36px;
      line-height: 35px;
      text-align: center;
      font-weight: bold;
      background-color: white;
      border-width: 2px;
      border-style: solid;
      border-color: ${e||"black"};
      border-radius: 50px;
      font-size: 100%;
      content: counter(steps);
      counter-increment: steps;
    }
    li::after {
      content: '';
      height: 2px;
      width: 100%;
      background-color: ${e||"black"};
      position: absolute;
      top: 20px;
      left: 50%;
      z-index: -1;
    }
    li:last-child:after {
      display:none;
    }
    .active {
      opacity: 1;
    }
    .active ~ li:before{
      background-color: #ededed;
      border-color: #ededed;
      color: #808080;
    }
    ul > .active:after {
      background-color: #ededed;
    }
    ul > li.active ~ li:after{
      background-color: #ededed;
    }
    ul > li.active ~ li {
      color: #808080;
    }
   `,o=document.createElement("style");return o.textContent=n,o}getAnchorPoint(e){return new Promise((n,o)=>{function i(){const t=document.querySelector(e);t&&(clearInterval(s),n(t))}const s=setInterval(i,50)})}getComponentAnchorPoint(){return new Promise(async(e,n)=>{this._anchorPoint=await this.getAnchorPoint(this.getConfigs("anchorPoint")),e()})}init(e,n){n(e),this.getAnchorPoint(this.getConfigs("anchorPoint")).then(o=>{o.parentElement.insertBefore(this,o.nextElementSibling)})}createProgressStepsComponent(){this.createProgressStepsComponentInner(),this._listeners.mounted||(this.shadow.prepend(this.createGlobalStyles()),this.shadow.prepend(this.createStyles())),document.dispatchEvent(new Event("componentMounted"))}createProgressStepsComponentInner(){this.setAttribute("data-max",this.getConfigs("steps")),this.setAttribute("data-steps",this.getConfigs("steps")),this.getStepsAndSetToStateList()}getStepsAndSetToStateList(){return new Promise(e=>{const n=Number(this.getConfigs("steps")),o=this.shadow.querySelector("ul"),i=this.shadow.querySelectorAll("li");if(i.length>0)i.forEach((s,t,r)=>this.setStepToList(t+1,s));else for(let s=1;s<=n;s++){const t=document.createElement("li");t.textContent=`${this.getConfigs("stepLabels")[s]}`,t.id=`step-${s}`,t.classList.add(`progress-step-${s}`),t.classList.add("inactive"),s===n&&t.classList.add("last-step"),o.appendChild(t),this.setStepToList(s,t)}e()})}connectedCallback(){this.log("component connected");const e=JSON.parse(sessionStorage.getItem("custom-component__state"));e?(e.updated=!1,e._progressState.activeStep=e._progressState.activeStep,e._percentcomplete=e._percentcomplete+e._stepIncrement,this.getStepsAndSetToStateList().then(()=>{this.initFromLastKnownState(e),this.shadow.firstChild.nodeName!=="STYLE"&&(this.shadow.prepend(this.createGlobalStyles()),this.shadow.prepend(this.createStyles()))})):(this.registerEvents(this.getConfigs("optionalEvents")),this.createProgressStepsComponent())}disconnectedCallback(){this.log("component disconnected"),document.dispatchEvent(new Event("componentUnmounted"))}}customElements.define("progress-steps",l);export{l as P};
