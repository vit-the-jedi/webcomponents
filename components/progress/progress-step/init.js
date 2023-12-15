"use strict";

import { ProgressStep } from "../progress-step/modules/classes/progress-steps.js";

const initProgressComponent = (formControllers) => {

    for (const control of formControllers){
        control.addEventListener("click", function(){
            document.dispatchEvent(new Event("progressStepUpdate"));
        });
    }

}

window.initProgressComponent = initProgressComponent;