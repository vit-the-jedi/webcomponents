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
    resolve();
  });
};

const progressBtn = document.getElementById("bar");
progressBtn.addEventListener("click", async function () {});
