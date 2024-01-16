"use strict";

let clickCount = 0;
const ev = new Event("componentStepValueChange");
ev.removedSteps = 2;

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
  const survey = document.querySelector(".survey");
  let snapshot = [...survey.querySelector(".container-fluid").children];

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
};

const progressBtn = document.getElementById("bar");
progressBtn.addEventListener("click", function () {
  clickCount++;
  createPageHandler();
  if (clickCount === 2 || clickCount === 6) {
    document.dispatchEvent(ev2);
  }
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
