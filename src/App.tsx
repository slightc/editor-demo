import "./App.css";

import { useEffect, useRef, useState } from "react";
import { Controller } from "@local/control";
import { Stage, Box, Image, DomDisplayObject } from "@local/render/dom";
import { DraftData, useDraftState } from "@local/data";

function App() {
  const [draftInstance] = useState(
    () =>
      new DraftData({
        elements: {
          "1": {
            id: "1",
            type: "box",
            start: 0,
            end: 10,
            position: { x: 100, y: 100 },
            size: { width: 100, height: 100 },
            scale: { x: 1, y: 1 },
            rotate: 0,
          },
          "3": {
            id: "3",
            type: "image",
            start: 0,
            end: 10,
            src: "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp",
            position: { x: 280, y: 280 },
            size: { width: 200, height: 200 },
            scale: { x: 1, y: 1 },
            rotate: 0,
          },
        },
        timeline: ["1", "3"],
      })
  );

  const draftState = useDraftState(draftInstance);

  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [instances] = useState(() => {
    const stage = new Stage();
    stage.size = { width: 800, height: 600 };
    stage.scale = { x: zoom, y: zoom };

    const c = new Controller();
    c.getParentInfo = () => {
      const rect = stage.el.getBoundingClientRect();
      return {
        scale: stage.scale,
        size: stage.size,
        offset: {
          x: rect.x + rect.width * 0.0,
          y: rect.y + rect.height * 0.0,
        },
      };
    };

    c.onUpdated = () => {
      const item1 = c.controlItem as DomDisplayObject;
      draftInstance.updateElement(item1.id, {
        position: item1.position,
        size: item1.size,
        rotate: item1.rotate,
      });
    };
    c.el.style.display = "none";

    stage.onClick = (event) => {
      console.log("click", event);
      if (event.target !== stage) {
        const target = event.target;
        c.controlItem = target;
        c.copyBase(target);
        c.el.style.display = "block";
        c.render();
      } else {
        c.controlItem = undefined;
        // c.copyBase(box);
        c.el.style.display = "none";
        c.render();
      }
    };

    return {
      stage,
      controller: c,
    };
  });

  function render() {
    if (!ref.current) {
      return;
    }
    for (let i = ref.current.children.length - 1; i >= 0; i--) {
      ref.current.children[i].remove();
    }
    const stage = instances.stage;
    stage.scale = { x: zoom, y: zoom };

    const cache = new Map<string, DomDisplayObject>();
    stage.children.forEach((child) => {
      cache.set(child.id, child);
    });

    const newItems = new Map<string, DomDisplayObject>();

    stage.children = [];

    const data = draftState.timeline.map((id) => {
      return draftState.elements[id]!;
    });

    data.forEach((item) => {
      let box = cache.get(item.id);
      if (!box) {
        if (item.type === "image") {
          const image = new Image();
          image.setSrc(item.src);
          box = image;
        } else {
          box = new Box();
        }
      }
      box.id = item.id;
      cache.delete(item.id);
      newItems.set(box.id, box);
      box.size = item.size;
      box.position = item.position;
      box.rotate = item.rotate;
      stage.append(box);
    });

    cache.forEach((item) => {
      item.parent = undefined;
      item.remove();
    });

    const c = instances.controller;
    if (c.controlItem) {
      if (!newItems.has((c.controlItem as DomDisplayObject).id)) {
        c.controlItem = undefined;
        c.el.style.display = "none";
      }
      c.render();
    }

    stage.render();
    const cWrapper = document.createElement("div");
    cWrapper.style.position = "absolute";
    cWrapper.style.left = -(stage.size.width / 2) * stage.scale.x + "px";
    cWrapper.style.top = -(stage.size.height / 2) * stage.scale.y + "px";
    cWrapper.append(c.el);
    ref.current.append(stage.el);
    ref.current.append(cWrapper);
  }

  useEffect(() => {
    render();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Backspace") {
        console.log("delete", e.key, instances.controller.controlItem);
        if (instances.controller.controlItem) {
          draftInstance.removeElement(instances.controller.controlItem.id);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  function addItem() {
    draftInstance.addElement({
      id: Math.random().toString(),
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
      rotate: 0,
      type: "box",
      scale: { x: 1, y: 1 },
      start: 0,
      end: 10,
    });
  }

  return (
    <>
      <div
        style={{
          width: 900,
          height: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          ref={ref}
          style={{
            width: 0,
            height: 0,
            position: "relative",
          }}
          draggable={false}
        ></div>
      </div>
      <div>
        <div>
          <input
            type="range"
            min={0.1}
            max={2}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              setZoom(parseFloat(e.target.value));
            }}
          />
        </div>
        <span>zoom: {zoom}</span>
        <button onClick={addItem}>add</button>
      </div>
    </>
  );
}

export default App;
