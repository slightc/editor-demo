import { DisplayObject } from "@local/render";
import { pointRotate, pointToLine } from "@local/render/utils";
import type { Point, Scale, Size } from "@local/render/types";

export class Controller extends DisplayObject {
  public el!: HTMLElement;

  items: Record<string, HTMLElement> = {
    cc: (() => {
      const el = document.createElement("div");
      el.style.width = "100%";
      el.style.height = "100%";
      return el;
    })(),
    l: createControllerLine((el) => {
      el.style.left = "0%";
      el.style.top = "50%";
    }),
    r: createControllerLine((el) => {
      el.style.left = "100%";
      el.style.top = "50%";
    }),
    t: createControllerLine((el) => {
      el.style.height = el.style.width;
      el.style.width = "100%";
      el.style.left = "50%";
      el.style.top = "0%";
    }),
    b: createControllerLine((el) => {
      el.style.height = el.style.width;
      el.style.width = "100%";
      el.style.left = "50%";
      el.style.top = "100%";
    }),
    lc: createControllerDot((el) => {
      el.style.width = "6px";
      el.style.left = "0%";
      el.style.top = "50%";
    }),
    rc: createControllerDot((el) => {
      el.style.width = "6px";
      el.style.left = "100%";
      el.style.top = "50%";
    }),
    tc: createControllerDot((el) => {
      el.style.height = "6px";
      el.style.left = "50%";
      el.style.top = "0%";
    }),
    bc: createControllerDot((el) => {
      el.style.height = "6px";
      el.style.left = "50%";
      el.style.top = "100%";
    }),
    lt: createControllerDot((el) => {
      el.style.left = "0%";
      el.style.top = "0%";
    }),
    rt: createControllerDot((el) => {
      el.style.left = "100%";
      el.style.top = "0";
    }),
    lb: createControllerDot((el) => {
      el.style.left = "0%";
      el.style.top = "100%";
    }),
    rb: createControllerDot((el) => {
      el.style.left = "100%";
      el.style.top = "100%";
    }),
    rotate: createControllerDot((el) => {
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.left = "50%";
      el.style.top = "calc(100% + 20px)";
    }),
  };
  controlItem: DisplayObject | undefined;
  constructor() {
    super();
    this.el = document.createElement("div");

    this.el.style.background = "transport";
    this.el.style.zIndex = "999";
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.position = "relative";

    for (const key in this.items) {
      const item = this.items[key];
      bindDragEvent(
        item,
        () => this.getParentInfo(),
        () => {
          return this.getBase();
        },
        (delta, init) => {
          if (key === "rc" || key === "lc" || key === "tc" || key === "bc") {
            const dir = key === "rc" || key === "bc" ? 1 : -1;
            const mask = key === "rc" || key === "lc" ? [1, 0] : [0, 1];
            const drp = pointRotate(
              { x: delta.dx / init.scale.x, y: delta.dy / init.scale.y },
              -init.rotate
            );
            drp.x = dir * drp.x;
            drp.y = dir * drp.y;
            if (init.size.width + drp.x < 1) {
              drp.x = 1 - init.size.width;
            }
            if (init.size.height + drp.y < 1) {
              drp.y = 1 - init.size.height;
            }
            if (mask[0]) {
              this.size.width = init.size.width + drp.x;
            }
            if (mask[1]) {
              this.size.height = init.size.height + drp.y;
            }

            const drp1 = pointRotate(
              { x: (drp.x * mask[0]) / 2, y: (drp.y * mask[1]) / 2 },
              init.rotate
            );
            console.log("drp", drp, drp1);

            this.position = {
              x: init.position.x + dir * drp1.x * init.scale.x,
              y: init.position.y + dir * drp1.y * init.scale.y,
            };

            this.render();
          }

          if (key === "rotate") {
            const r =
              Math.atan2(delta.y - this.position.y, delta.x - this.position.x) -
              Math.PI / 2;
            this.rotate = r;
            this.render();
          }
          if (key === "cc") {
            this.position = {
              x: init.position.x + delta.dx,
              y: init.position.y + delta.dy,
            };
            this.render();
          }
          if (key === "lt" || key === "rt" || key === "lb" || key === "rb") {
            const dir = {
              x: key === "lt" || key === "lb" ? -1 : 1,
              y: key === "lt" || key === "rt" ? -1 : 1,
            };

            const a = { x: 0, y: 0 };
            const b = {
              x: dir.x * init.size.width * init.scale.x,
              y: dir.y * init.size.height * init.scale.y,
            };
            const drp = pointRotate({ x: delta.dx, y: delta.dy }, -init.rotate);
            const rp = {
              x: b.x + drp.x,
              y: b.y + drp.y,
            };
            const cp = pointToLine(rp, [a, b]);
            let s = cp.x / (dir.x * init.size.width);
            if (init.size.height > init.size.width) {
              s = cp.y / (dir.y * init.size.height);
            }

            if (s < 0.1) return;
            if (s > 12) return;
            const dpo = pointRotate(
              { x: (cp.x - b.x) / 2, y: (cp.y - b.y) / 2 },
              init.rotate
            );

            this.position = {
              x: init.position.x + dpo.x,
              y: init.position.y + dpo.y,
            };
            this.scale = {
              x: s,
              y: s,
            };
            this.render();
            // const newScale =
          }
          this.onUpdate();
        },
        () => {
          this.onUpdated();
        }
      );
      wrapper.appendChild(this.items[key]);
    }
    this.el.appendChild(wrapper);
  }

  onUpdate(): void {
    if (this.controlItem) {
      this.controlItem.copyBase(this);
      this.controlItem.render();
    }
  }

  onUpdated(): void {}

  getParentInfo(): {
    scale: Scale;
    size: Size;
    offset: Point;
  } {
    return {
      scale: { x: 1, y: 1 },
      offset: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
    };
  }

  render(): void {
    super.render();
    const pInfo = this.getParentInfo();
    this.el.style.position = "absolute";
    this.el.style.width = `${this.size.width * this.scale.x * pInfo.scale.x}px`;
    this.el.style.height =
      `${this.size.height * this.scale.y * pInfo.scale.y}px`;
    this.el.style.transformOrigin = `${this.pivot.x * 100}% ${
      this.pivot.y * 100
    }%`;
    this.el.style.transform = [
      `translate(calc(${-50}% + ${
        this.position.x * pInfo.scale.x
      }px), calc(${-50}% + ${this.position.y * pInfo.scale.y}px))`,
      `rotate(${this.rotate}rad)`,
    ].join(" ");
    this.el.style.background = "transport";
  }

  renderChildren(): void {}
}

function createControllerDot(
  modifier?: (el: HTMLElement) => void
): HTMLElement {
  const dot = document.createElement("div");
  dot.style.cursor = "move";
  dot.style.width = "12px";
  dot.style.height = "12px";
  dot.style.background = "#1FAEFF";
  dot.style.borderRadius = "20px";
  dot.style.transform = "translate(-50%, -50%)";
  dot.style.position = "absolute";

  if (modifier) {
    modifier(dot);
  }
  return dot;
}

function createControllerLine(
  modifier?: (el: HTMLElement) => void
): HTMLElement {
  return createControllerDot((el) => {
    el.style.background = "#DDDD";
    el.style.height = "100%";
    el.style.width = "2px";
    modifier?.(el);
  });
}

function bindDragEvent<T>(
  el: HTMLElement,
  getInfo: () => { scale: Scale; offset: Point },
  getInitData: () => T,
  cb: (
    delta: { x: number; y: number; dx: number; dy: number },
    init: T
  ) => void,
  ended: () => void
) {
  el.addEventListener(
    "mousedown",
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      const start = {
        x: e.clientX,
        y: e.clientY,
      };
      const initData = getInitData();
      const onMouseMove = (e: MouseEvent) => {
        const info = getInfo();
        const delta = {
          x: (e.clientX - info.offset.x) / info.scale.x,
          y: (e.clientY - info.offset.y) / info.scale.y,
          dx: (e.clientX - start.x) / info.scale.x,
          dy: (e.clientY - start.y) / info.scale.y,
        };
        cb(delta, initData);
      };
      const stopEvent = (e: MouseEvent) => {
        console.log("stopEvent");
        e.stopPropagation();
        e.preventDefault();
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("click", stopEvent, {
        once: true,
        capture: true,
      });
      window.addEventListener(
        "mouseup",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("click", stopEvent, { capture: true });
          ended();
        },
        { once: true, capture: true }
      );
    },
    { capture: true }
  );
}
