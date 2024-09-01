import { Point, Scale, Size } from "@local/render/types";

interface ElementBase {
  id: string;
  type: string;
  start: number;
  end: number;
  parent?: string;
}

interface DisplayElement extends ElementBase {
  position: Point;
  size: Size;
  scale: Scale;
  rotate: number;
}

export interface BoxElement extends DisplayElement {
  type: "box";
}

export interface ImageElement extends DisplayElement {
  type: "image";
  src: string;
}

export interface GroupElement extends DisplayElement {
  type: "group";
  children: DisplayElement[];
}

export type DraftElement = BoxElement | ImageElement | GroupElement;

export interface Draft {
  elements: { [key: string]: DraftElement | undefined };
  timeline: string[];
}
