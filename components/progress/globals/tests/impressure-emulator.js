"use strict";

let clickCount = 0;
const ev = new Event("componentStepValueChange");
ev.data = {
  addedSteps: 8,
  once: true,
};

const ev2 = new Event("componentManualProgressStepUpdate");

const createNode = (type, attributes) => {
  const el = document.createElement(type);
  for (const [key, val] of Object.entries(attributes)) {
    el.setAttribute(key, val);
  }
  return el;
};

const createForm = () => {
  const form = createNode("form", {
    id: "generic-form",
    style: "height:300px;background:red",
  });
  console.log(form);
  return form;
};

const createPageHandler = () => {
  return new Promise((resolve) => {
    const survey = document.querySelector(".survey");
    let snapshot = [...survey.querySelector(".container-fluid").children];
    snapshot = snapshot.filter((el) => {
      if (el.nodeName !== "PROGRESS-BAR") {
        return el;
      }
    });
    survey.innerHTML = "";

    setTimeout(() => {
      const page = createNode("div", {
        class: "page",
      });
      const container = createNode("div", {
        class: "container-fluid",
      });
      snapshot.forEach((snap, i, arr) => {
        if (snap.nodeName === "FORM") {
          snap.style.paddingTop = `${Math.random() * 100}px`;
        }
        container.appendChild(snap);
        page.appendChild(container);
      });
      survey.appendChild(page);
    }, 500);
    initProgressComponent({
      type: "bar",
      font: "sans-serif",
      mainColor: "blue",
      //made it this way for now to make it easier - can't think of a better way at the moment
      transitionDuration: 250,
      anchorPoint: ".formheader",
      height: 12,
      steps: 3,
      max: 100,
      // stepLabels: {
      //   1: "Start",
      //   2: "Vehicle Details",
      //   3: "Driver Details",
      //   4: "Compare Quotes",
      // },
      //optionalEvents: ["componentManualProgressStepUpdate"],
      //manualUpdate: true,
      _devMode: true,
      removeOnComplete: true,
    });
    resolve();
  });
};

const progressBtn = document.getElementById("bar");
progressBtn.addEventListener("click", async function () {
  clickCount++;
  if (clickCount === 1) {
    ev.data = {
      addedSteps: 3,
      once: true,
    };
    document.dispatchEvent(ev);
  }

  // else if (clickCount === 3) {
  //   ev.data = {
  //     addedSteps: 1,
  //     once: true,
  //   };
  //   document.dispatchEvent(ev);
  // }

  createPageHandler().then(() => {});
  // const rand = (Math.random() * 10);
  // console.log(rand);
  // const prog = document.querySelector("progress-bar");
  // const prog2 = prog.cloneNode();
  // if(rand >= 4 && prog){
  // setTimeout(()=>{
  //   document.body.appendChild(prog2);
  // },1000)

  // }
  //document.dispatchEvent(new Event("componentUpdate"))
});
