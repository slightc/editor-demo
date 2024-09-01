/* eslint-disable @typescript-eslint/no-this-alias */
import type { Point, Size, Scale } from "./types";

interface BaseObject {}

interface BaseDisplayObject extends BaseObject {
  matrix: [
    scaleX: number,
    skewX: number,
    x: number,
    skewY: number,
    scaleY: number,
    y: number
  ];
  position: Point;
  size: Size;
  scale: Scale;
  pivot: Point;
  rotate: number;
}

export interface StructureDisplayObject extends BaseDisplayObject {
  parent?: StructureDisplayObject;
  children: StructureDisplayObject[];
}

export class DisplayObject implements StructureDisplayObject {
  public matrix: BaseDisplayObject["matrix"] = [1, 0, 0, 0, 1, 0];
  public size: Size = { width: 0, height: 0 };
  public pivot: Point = { x: 0.5, y: 0.5 };
  public position: Point = { x: 0, y: 0 };
  public scale: Scale = { x: 1, y: 1 };
  public rotate: number = 0;
  public children: DisplayObject[] = [];
  public parent?: DisplayObject;
  public id: string = Math.random().toString().slice(2);

  get top() {
    let top: typeof this.parent | this = this;
    while (top.parent !== undefined) {
      top = top.parent;
    }
    return top;
  }

  getBase() {
    return {
      size: { ...this.size },
      pivot: { ...this.pivot },
      position: { ...this.position },
      scale: { ...this.scale },
      rotate: this.rotate,
    };
  }

  copyBase(target: DisplayObject) {
    const base = target.getBase();
    for (const key in base) {
      // @ts-expect-error ...
      this[key] = base[key];
    }
  }

  append(child: DisplayObject) {
    this.children.push(child);
    child.parent = this;
  }

  remove() {
    this.children.forEach((child) => {
      // avoid search index again
      child.parent = undefined;
      child.remove();
    });
    if (this.parent !== undefined) {
      const index = this.parent.children.indexOf(this);
      this.parent.children.splice(index, 1);
    }
    this.parent = undefined;
  }

  render(): void {}
}
