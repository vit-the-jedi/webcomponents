import { ProgressBar } from "./modules/classes/progress-bar";
import {Progress} from "../globals/classes/progress.js";

window.__customProgressBarMethods = {};
window.__customProgressBarProps = {};

const createProgressComponent = () => {
  document.addEventListener("progressBarBeforeMount", async function(e) {
    await createComponentArea(__customProgressBarMethods.progressElement);
    document.body.appendChild(__customProgressBarMethods.progressElement);
    const progressBarMounted = new Event("progressBarMounted");
    //document.dispatchEvent(progressBarMounted);
  });

  document.addEventListener("progressBarMounted", function(){
    console.log("mounted");
    Progress.prototype.componentIsMounted();
  })
  const progressBarBeforeMount = new Event("progressBarBeforeMount");
  const progDiv = document.createElement("div");
  progDiv.classList.add("progress-container");
  progDiv.innerHTML = `<progress-bar data-max="100" data-steps="${__customProgressBarComponentTheme.steps}"></progress-bar>`;
  __customProgressBarMethods.progressElement = progDiv;
  document.dispatchEvent(progressBarBeforeMount);
};

const createComponentArea = () => {
  return new Promise((resolve, reject) => {
    const anchorPoint = 
      document.querySelector(
      __customProgressBarComponentTheme.anchorPoint
    );
    const placeholderSpacingDiv = document.createElement("div");
    placeholderSpacingDiv.setAttribute("style", `height:${window.__customProgressBarComponentTheme.progressBar.height * 4}px;display:block;`);
    anchorPoint.style.marginBottom = `${window.__customProgressBarComponentTheme.progressBar.height * 4}px`;  
    setTimeout(()=>{
      const anchorPointRect = anchorPoint.getBoundingClientRect();
      anchorPoint.parentNode.insertBefore(placeholderSpacingDiv, anchorPoint.nextElementSibling);
      const offset = anchorPointRect.top + anchorPointRect.height + (placeholderSpacingDiv.getBoundingClientRect().height / 2) - window.__customProgressBarComponentTheme.progressBar.height / 2;
        __customProgressBarMethods.progressElement.setAttribute(
          "style",
          `position:absolute;top:${offset}px;width:70%;left: 15%;`
        );
        anchorPoint.style.marginBottom = ``;
    },500)
    resolve();
  });
};
window.__customProgressBarMethods.createProgressComponent = createProgressComponent;
window.__customProgressBarMethods.createComponentArea = createComponentArea;



