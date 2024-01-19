import{P as p}from"./progress.js";class d extends p{constructor(){super(),this.classList.add("component-positioned");const e=this.attachShadow({mode:"open"}),t=document.createElement("div");t.classList.add("progress-wrapper");const s=document.createElement("div");s.classList.add("progress-bar"),s.max=this.getAttribute("data-max"),s.value=this.getAttribute("data-value"),s.id="progress-bar-component";const n=document.createElement("div");n.classList.add("progress-bar-inner"),n.style.width="0%",s.appendChild(n),t.appendChild(s),e.appendChild(t),this.shadow=e,document.dispatchEvent(new Event("componentCreated"))}static get observedAttributes(){return["percentcomplete"]}attributeChangedCallback(e,t,s){let o=[...this.shadowRoot.children].filter(a=>{if(a.classList.contains("progress-wrapper"))return a.querySelector(".progress-bar-inner")});o=o[0];const c=o.querySelector(".progress-bar-inner"),i=this._percentcomplete;e==="percentcomplete"&&(this._percentcomplete=i,setTimeout(()=>{c.style.width=i+"%"},250))}get percentcomplete(){return this._percentcomplete}set percentcomplete(e){this._percentcomplete<=this._maxValue&&this.setAttribute("percentcomplete",e)}createStyles(){const e=`
    .progress-wrapper {
      overflow: hidden;
      margin: 2em auto;
    }
    .progress-bar {
      width: 99%;
      height: ${this.getConfigs("height")}px;
      background-color: ${this.getConfigs("secondColor")||"#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${this.getConfigs("mainColor")||"#66c296 "};
      text-align: center;
      transition: width 0.15s;
      border-radius: 10px;
    }`,t=document.createElement("style");return t.textContent=e,t}getAnchorPoint(e){return new Promise((t,s)=>{function n(){const o=document.querySelector(e);o&&(clearInterval(r),t(o))}const r=setInterval(n,50)})}getComponentAnchorPoint(){return new Promise(async(e,t)=>{this._anchorPoint=await this.getAnchorPoint(this.getConfigs("anchorPoint")),e()})}init(e,t){t(e),this.getAnchorPoint(this.getConfigs("anchorPoint")).then(s=>{s.parentElement.insertBefore(this,s.nextElementSibling)})}createProgressBarComponent(){document.createElement("div").classList.add("progress-container"),this.setAttribute("data-max","100"),this.setAttribute("data-steps",this.getConfigs("steps")),this.shadow.prepend(this.createGlobalStyles()),this.shadow.prepend(this.createStyles()),document.dispatchEvent(new Event("componentMounted"))}connectedCallback(){document.dispatchEvent(new Event("componentBeforeMount")),this.log("component connected");const e=JSON.parse(sessionStorage.getItem("custom-component__state"));if(e){if(e.updated=!1,e._progressState.activeStep=e._progressState.activeStep+1,e._percentcomplete=e._percentcomplete+e._stepIncrement,this.initFromLastKnownState(e),this.shadow.firstChild.nodeName==="STYLE")return;this.shadow.prepend(this.createGlobalStyles()),this.shadow.prepend(this.createStyles())}else this.registerEvents(),this.createProgressBarComponent()}disconnectedCallback(){this.log("component disconnected"),document.dispatchEvent(new Event("componentUnmounted"))}}customElements.define("progress-bar",d);export{d as P};
