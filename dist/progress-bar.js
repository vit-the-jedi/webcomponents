import{P as d}from"./progress.js";import"./observers.js";class l extends d{constructor(){super()}static get observedAttributes(){return["percentcomplete"]}attributeChangedCallback(t,s,o){let e=[...this.shadowRoot.children].filter(i=>{if(i.classList.contains("progress-wrapper"))return i.querySelector(".progress-bar-inner")});e=e[0];const a=e.querySelector(".progress-bar-inner"),c=this._progressState.percentcomplete;t==="percentcomplete"&&setTimeout(()=>{a.style.width=c+"%"},250)}createStyles(){const t=`
    .progress-wrapper {
      overflow: hidden;
      margin: 2em auto;
    }
    .progress-bar {
      width: 99%;
      height: ${this.configs.height}px;
      background-color: ${this.configs.secondColor||"#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${this.configs.mainColor||"#66c296 "};
      text-align: center;
      transition: width 0.15s;
      border-radius: 10px;
    }`,s=document.createElement("style");return s.textContent=t,s}getAnchorPoint(t){return new Promise((s,o)=>{function n(){const e=document.querySelector(t);e&&(clearInterval(r),s(e))}const r=setInterval(n,50)})}getComponentAnchorPoint(){return new Promise(async(t,s)=>{this._anchorPoint=await this.getAnchorPoint(this.configs.anchorPoint),t()})}createComponent(){return new Promise((t,s)=>{try{this.classList.add("component-positioned");const o=this.attachShadow({mode:"open"}),n=document.createElement("div");n.classList.add("progress-wrapper");const r=document.createElement("div");r.classList.add("progress-bar"),r.max=this.getAttribute("data-max"),r.value=this.getAttribute("data-value"),r.id="progress-bar-component";const e=document.createElement("div");e.classList.add("progress-bar-inner"),e.style.width="0%",r.appendChild(e),n.appendChild(r),o.appendChild(n),this.shadow=o,document.createElement("div").classList.add("progress-container"),this.setAttribute("data-max","100"),this.setAttribute("data-steps",this.configs.steps),this.shadow.prepend(this.createGlobalStyles()),this.shadow.prepend(this.createStyles()),t(this)}catch(o){s(o)}})}}customElements.define("progress-bar",l);export{l as P};
