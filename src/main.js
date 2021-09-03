import { createElement, render, mount } from "./vdom/render";
import diff from "./vdom/diff";

let count = 0;
let containerId = "";
let currentApp;
let currentRt;

const init = (id) => {
  containerId = id;
  const app = createApp();
  const vApp = render(app);
  currentRt = mount(vApp, document.getElementById(containerId));
  currentApp = app;

  setInterval(() => {
    updateCount();
  }, 1000);
};

const updateCount = (e) => {
  //e.target.value
  count++;
  const app = createApp();
  const patch = diff(currentApp, app);
  currentRt = patch(currentRt);
  currentApp = app;
};

const App = {
  createElement,
  init,
};

/** @jsx App.createElement */
const createApp = () => {
  return (
    <div id="app">
      <input></input>
      <br />
      currentCounter is : {count}
      <br />
      <button onclick={updateCount}>upCount</button>
      <br />
      <img src="https://media.giphy.com/media/cuPm4p4pClZVC/giphy.gif"></img>
    </div>
  );
};

App.init("app");