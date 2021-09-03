function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // children: children.map((child) =>
      //   typeof child === "object" ? child : createTextElement(child)
      // ),
      children: children
        .flat()
        .map((child) =>
          typeof child === "object" ? child : createTextElement(child)
        ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element) {
  const dom =
    element.type == "TEXT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => {
    const app = render(child, dom);
    dom.appendChild(app);
  });
  return dom;
}

const mount = (node, container) => {
  container.replaceWith(node);
  return node;
};

export { createElement, render, mount };
