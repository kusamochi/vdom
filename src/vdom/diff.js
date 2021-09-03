import { render } from "./render";

const zip = (xs, ys) => {
  const zipped = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
};

const diffAttrs = (oldAttrs, newAttrs) => {
  const patches = [];

  if (newAttrs) {
    //set new attributes
    for (const [k, v] of Object.entries(newAttrs)) {
      if (k !== "children") {
        if (!k.startsWith("on") && oldAttrs[k]!==v) { //need test
          patches.push(($node) => {
            $node.setAttribute(k, v);
            return $node;
          });
        }
        if (k.startsWith("on") && !(k in oldAttrs)) {
          patches.push(($node) => {
            const eventType = k.toLowerCase().substring(2);
            $node.addEventListener(eventType, v);
            return $node;
          });
        }
      }
    }
  }

  if (oldAttrs) {
    //remove old attributes
    for (const k in oldAttrs) {
      if (!(k in newAttrs)) {
        if (k !== "children") {
          if (!k.startsWith("on") && !(k in newAttrs)) {
            patches.push(($node) => {
              $node.removeAttribute(k);
              return $node;
            });
          }
          if (k.startsWith("on") && !(k in newAttrs)) {
            patches.push(($node) => {
              const eventType = k.toLowerCase().substring(2);
              $node.removeEventListener(eventType, v);
              return $node;
            });
          }
        }
      }
    }
  }

  return ($node) => {
    for (const patch of patches) {
      patch($node);
    }
    return $node;
  };
};

const diffChildren = (oldVChildren, newVChildren) => {
  const childPatches = [];

  oldVChildren.forEach((oldVChild, i) => {
    childPatches.push(diff(oldVChild, newVChildren[i]));
  });

  const additionalPatches = [];
  for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
    additionalPatches.push(($node) => {
      $node.appendChild(render(additionalVChild));
      return $node;
    });
  }

  return ($parent) => {
    for (const [patch, child] of zip(childPatches, $parent.childNodes)) {
      patch(child);
    }
    for (const patch of additionalPatches) {
      patch($parent);
    }
    return $parent;
  };
};

const diff = (vOldNode, vNewNode) => {
  if (vNewNode === undefined) {
    return ($node) => {
      $node.remove();
      return undefined;
    };
  }

  if (vOldNode.type === "TEXT" || vNewNode.type === "TEXT") {
    if (vOldNode !== vNewNode) {
      return ($node) => {
        const $newNode = render(vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    } else {
      return ($node) => $node;
    }
  }

  if (vOldNode.type !== vNewNode.type) {
    return ($node) => {
      const $newNode = render(vNewNode);
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  const patchAttrs = diffAttrs(vOldNode.props, vNewNode.props);
  const patchChildren = diffChildren(
    vOldNode.props.children,
    vNewNode.props.children
  );

  return ($node) => {
    patchAttrs($node);
    patchChildren($node);
    return $node;
  };
};

export default diff;
