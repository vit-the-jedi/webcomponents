"use strict";

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
  const snapshot = [...survey.querySelector(".container-fluid").children];

  survey.innerHTML = "";

  setTimeout(() => {
    const container = createNode("div", {
        class: "container-fluid",
    })
    snapshot.forEach((snap) => {
        if(snap.nodeName === "FORM"){
            snap.style.paddingTop = `${Math.random() * 100}px`;
        }
      container.appendChild(snap);
    });
    survey.appendChild(container);
  }, 500);
};

const progressBtn = document.getElementById("bar");
progressBtn.addEventListener("click", function () {
  createPageHandler();
  const rand = (Math.random() * 10);
  console.log(rand);
  const prog = document.querySelector("progress-bar");
  if(rand >= 4 && prog){
  prog.parentElement.removeChild(prog);
  }
  document.dispatchEvent(new Event("progressBarUpdate"))
});


