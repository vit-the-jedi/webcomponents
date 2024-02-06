import{P as a}from"./progress.js";import"./observers.js";class l extends a{constructor(){super(),this.classList.add("component-positioned");const e=this.attachShadow({mode:"open"});e.innerHTML=`<div class="progress-wrapper">
    <div class="single-chart">
      <svg viewBox="0 0 36 36" class="circular-chart orange">
        <path class="circle-bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path class="circle"
          stroke-dasharray="30, 100"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="16.35" class="percentage"></text>
        <text x="18" y="22.35" class="complete">Complete</text>
      </svg>
    </div>`,this.shadow=e,document.dispatchEvent(new Event("componentCreated"))}static get observedAttributes(){return["percentcomplete"]}attributeChangedCallback(e,t,s){const n=this.shadowRoot,c=n.querySelector(".circle"),r=n.querySelector(".percentage");let o=this._percentcomplete-this._stepIncrement;if(e==="percentcomplete"){this._percentcomplete=this.getActiveStepFromState(),r.textContent=`${Math.round(this._percentcomplete)}%`;const i=setInterval(()=>{o<this._percentcomplete?(o=o+1,c.setAttribute("stroke-dasharray",`${o}, ${this._maxValue}`)):clearInterval(i)},50)}}get percentcomplete(){return this._percentcomplete}set percentcomplete(e){this._percentcomplete<=this._maxValue&&this.setAttribute("percentcomplete",e)}createStyles(){const e=`
    .progress-wrapper {
      display: flex;
      flex-flow: row nowrap;
      max-width:300px;
      width: 70%;
      margin:auto;
      justify-content:center;
    }
    
    .single-chart {
      width: 33%;
      justify-content: space-around ;
    }
    
    .circular-chart {
      display: block;
      margin: 10px auto;
      max-width: 250px;
      max-height: 250px;
    }
    
    .circle-bg {
      fill: none;
      stroke: #eee;
      stroke-width: 3.8;
    }
    
    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      animation: progress 1s ease-in-out forwards;
    }
    
    @keyframes progress {
      0% {
        stroke-dasharray: 0 100;
      }
    }
    
    .circular-chart .circle {
      stroke: ${this.getConfigs("mainColor")};
    }

    .percentage {
      fill: #666;
      font-family: ${this.getConfigs("font")};
      font-size: 0.4em;
      text-anchor: middle;
    }
    .complete {
      fill: #666;
      font-family: ${this.getConfigs("font")};
      font-size: 0.3em;
      text-anchor: middle;
    }
    `,t=document.createElement("style");return t.textContent=e,t}getAnchorPoint(e){return new Promise((t,s)=>{function n(){const r=document.querySelector(e);r&&(clearInterval(c),t(r))}const c=setInterval(n,50)})}getComponentAnchorPoint(){return new Promise(async(e,t)=>{this._anchorPoint=await this.getAnchorPoint(this.getConfigs("anchorPoint")),e()})}init(e,t){t(e),this.getAnchorPoint(this.getConfigs("anchorPoint")).then(s=>{s.parentElement.insertBefore(this,s.nextElementSibling)})}createProgressBarComponent(){document.createElement("div").classList.add("progress-container"),this.setAttribute("data-max","100"),this.setAttribute("data-steps",this.getConfigs("steps")),this.shadow.prepend(this.createGlobalStyles()),this.shadow.prepend(this.createStyles()),document.dispatchEvent(new Event("componentMounted"))}connectedCallback(){document.dispatchEvent(new Event("componentBeforeMount")),this.log("component connected");const e=JSON.parse(sessionStorage.getItem("custom-component__state"));if(e){if(e.updated=!1,e._progressState.activeStep=e._progressState.activeStep+1,e._percentcomplete=e._percentcomplete+e._stepIncrement,this.initFromLastKnownState(e),this.shadow.firstChild.nodeName==="STYLE")return;this.shadow.prepend(this.createGlobalStyles()),this.shadow.prepend(this.createStyles())}else this.registerEvents(),this.createProgressBarComponent()}disconnectedCallback(){this.log("component disconnected"),document.dispatchEvent(new Event("componentUnmounted"))}}customElements.define("progress-circle",l);export{l as P};
