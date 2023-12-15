"use strict";

import { ProgressBar } from "../progress-bar/modules/classes/progress-bar.js";

const initProgressComponent = (formControllers) => {

    for (const control of formControllers){
        control.addEventListener("click", function(){
            document.dispatchEvent(new Event("progressBarUpdate"));
        });
    }

}

window.initProgressComponent = initProgressComponent;