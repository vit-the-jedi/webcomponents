import { Progress } from "../globals/classes/progress.js";
import ProgressBar from "./modules/classes/progress-bar.js";

const initProgressComponent = (userConfigs) => {
  if (sessionStorage.getItem("custom-component_done")) {
    return;
  }
  let progressElement = new ProgressBar();
  progressElement.initState(userConfigs);
};
window.__customProgressStepMethods = {};
window.initProgressComponent = initProgressComponent;
