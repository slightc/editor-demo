import { Point } from "./types";

export function pointRotate(point: Point, rad: number) {
  const { x, y } = point;
  const matrix = [Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad)];
  return {
    x: x * matrix[0] + y * matrix[2],
    y: x * matrix[1] + y * matrix[3],
  };
}

export function pointToLine(point: Point, line: [Point, Point]) {
  const [p1, p2] = line;
  const { x, y } = point;

  const a = (p2.y - p1.y) / (p2.x - p1.x);
  const b = p1.y - a * p1.x;
  const m = x + a * y;

  const cx = (m - b * a) / (1 + a * a);
  const cy = a * cx + b;

  return {
    x: cx,
    y: cy,
  };
}
