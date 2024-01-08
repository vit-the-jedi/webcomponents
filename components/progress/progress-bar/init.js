import ProgressBar from "./modules/classes/progress-bar";
import { Progress } from "../globals/classes/progress.js";

  const initProgressComponent = (userConfigs) => {
    const progressBar = new ProgressBar();
    progressBar.init(userConfigs);
  };
  window.__customProgressBarMethods = {};
  window.initProgressComponent =
    initProgressComponent;


