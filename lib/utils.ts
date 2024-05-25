import { Camera, Color, Layer, Point, Side, XYWH } from "@/types/canvas";
import { LiveObject } from "@liveblocks/client";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { findClosestAttachmentPoint } from "./line_utils";

const COLORS = [
  "#DC2626",
  "#D97706",
  "#059669", 
  "#7C3AED", 
  "#DB2777"
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts connection id to color.
 *
 * @param connectionId id of connection.
 * @returns color corresponding to the connection id
 */
export function connectionIdToColor(connectionId: number):string {
  return COLORS[connectionId % COLORS.length];
}

/**
 * Transforms mouse position coordinates of mouse event from
 * screen space to canvas space.
 *
 * @param e mouse event.
 * @param camera parameters of camera.
 * @returns mouse position on canvas
 */
export function mouseEventToCanvasPoint(
  e: React.MouseEvent,
  camera: Camera
) {
  return screenPointToCanvasPoint({x: e.clientX, y: e.clientY}, camera)
}

/**
 * Transforms screen point coordinates from
 * screen space to canvas space.
 *
 * @param p screen point.
 * @param camera parameters of camera.
 * @returns canvas point
 */
export function screenPointToCanvasPoint(
  p: Point,
  camera: Camera
) {
  return {
    x: (Math.round(p.x) / camera.scale) - camera.x,
    y: (Math.round(p.y) / camera.scale) - camera.y,
  }
}

/**
 * Convert color to css string
 */
export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

/**
 * Resizes bounds
 */
export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

/**
 * Finds all layers on board intersecting with rectangle
 */
export function findIntersectingLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point,
) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  }

  const ids = [];
  for (const layerId of layerIds) {
    const layer = layers.get(layerId);

    if (layer == null) {
      continue;
    }

    const { x, y, height, width } = layer;

    if (
      rect.x + rect.width > x && 
      rect.x < x + width && 
      rect.y + rect.height > y && 
      rect.y < y + height 
    ) {
      ids.push(layerId);
    }
  }
  return ids;
}

/**
 * Determines contrasting text color for a bg color
 */
export function getContrastingTextColor(color: Color) {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

  return luminance > 182 ? "black": "white";
}

/**
 * Clamps value between min and max (inclusive)
 */
export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

export function getLayerCenter(layer: Layer): Point {
  return {
    x: layer.x + layer.width / 2,
    y: layer.y + layer.height / 2
  }
}

function luRdDiagonal(point: Point, layer: Layer) {
  return (layer.height/layer.width) * (point.x - layer.x) + layer.y;
}

function ldRuDiagonal(point: Point, layer: Layer) {
  return (layer.height/layer.width) * (layer.x- point.x) + layer.y +layer.height;
}

export function getPointSideInRect(point: Point, layer: Layer) {
  if (point.y > luRdDiagonal(point, layer)) {
    if (point.y > ldRuDiagonal(point, layer)) {
      return Side.Bottom;
    } else {
      return Side.Left;
    }
  } else {
    if (point.y < ldRuDiagonal(point, layer)) {
      return Side.Top;
    } else {
      return Side.Right;
    }
  }
}

/*export function calculateLineOffset(point: Point, layer: Layer): [Point, Side] {
  const side = getPointSideInRect(point, layer);

  switch(side) {
    case Side.Top:
      return [{
        x: (point.x - layer.x) / layer.width,
        y: 0
      }, side]
    case Side.Bottom:
      return [{
        x: (point.x - layer.x) / layer.width,
        y: 1
      }, side]
    case Side.Left:
      return [{
        x: 0,
        y: (point.y - layer.y) / layer.height
      }, side]
    case Side.Right:
      return [{
        x: 1,
        y: (point.y - layer.y) / layer.height
      }, side]
  }
}*/

export function calculateLineOffset(point: Point, layer: Layer): [Point, Side] {
  const atchPoint = findClosestAttachmentPoint(layer, point);
  const side = getPointSideInRect(layerOffsetToPoint(atchPoint, layer), layer);

  return [{x: atchPoint.x / layer.width, y: atchPoint.y / layer.height}, side]
}

/**
 * Calculates sum of two points.
 *
 * @returns (a.x + b.x; a.y + b.y)
 */
export function pointsSum(a: Point, b: Point): Point {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  }
}

/**
 * Calculates difference between points (a - b).
 *
 * @returns (a.x - b.x; a.y - b.y)
 */
export function pointsDifference(a: Point, b: Point): Point {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

/**
 * Calculates square distance between points.
 */
export function sqrDist(a: Point, b: Point): number {
  return (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
}

/**
 * Calculates cross product of two vectors.
 *
 * @returns v1.x * v2.y - v1.y * v2.x
 */
function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Checks if point is inside rect, defined by
 * its upper left corner coordinates, width and height.
 */
export function isPointInsideRect(p: Point, rect: XYWH): boolean {
  return (p.x >= rect.x && p.x <= rect.x + rect.width) &&
          (p.y >= rect.y && p.y <= rect.y + rect.height);
}

/**
 * Checks if two lines intersect
 */
function doLinesIntersect(p1: Point, p2: Point, q1: Point, q2: Point): boolean {
  const r = pointsDifference(p2, p1);
  const s = pointsDifference(q2, q1);
  const rxs = crossProduct(r, s);
  const qpxr = crossProduct(pointsDifference(q1, p1), r);

  if (rxs === 0 && qpxr === 0) {
    // Collinear case
    let t0 = (q1.x - p1.x) / r.x;
    let t1 = (q2.x - p1.x) / r.x;
    if (r.y !== 0) {
        t0 = (q1.y - p1.y) / r.y;
        t1 = (q2.y - p1.y) / r.y;
    }
    return (t0 <= 1 && t0 >= 0) || (t1 <= 1 && t1 >= 0);
  }

  if (rxs === 0 && qpxr !== 0) return false;

  const t = crossProduct(pointsDifference(q1, p1), s) / rxs;
  const u = crossProduct(pointsDifference(q1, p1), r) / rxs;

  return (t >= 0 && t <= 1) && (u >= 0 && u <= 1);
}

/**
 * Checks if line from a to be intersects rect, defined by
 * its upper left corner coordinates, width and height.
 */
export function doesLineIntersectRect(a: Point, b: Point, rect: XYWH): boolean {
  // Эта функция не работает (а может и работает)

  // Handle case if both points are inside rect
  if (isPointInsideRect(a, rect) && isPointInsideRect(b, rect)) {
    return true;
  }

  let rectPoints : Point[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height }
  ];

  for (let i = 0; i < 4; i++) {
    let p1 = rectPoints[i];
    let p2 = rectPoints[(i + 1) % 4];
    console.log(p1, p2, a, b)
    if (doLinesIntersect(a, b, p1, p2)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns mouse position as {@link Point} from React.MouseEvent.
 *
 * @returns (e.clientX; e.clienY)
 */
export function getMousePosition(e: React.MouseEvent): Point {
  return {
    x: e.clientX,
    y: e.clientY,
  }
}

/**
 * Finds closest to target point in array
 */
export function findClosestPoint(points: Point[], target: Point): Point {
  let res = points[0];
  for (let i = 1; i < points.length; i++) {
    if(sqrDist(points[i], target) <= sqrDist(res, target))
      res = points[i];
  }
  return res;
}

/**
 * Transforms layer offset to canvas point
 */
export function layerOffsetToPoint(offset: Point, layer: Layer): Point {
  return {
    x: layer.x + offset.x,
    y: layer.y + offset.y
  }
}

/**
 * Finds middle point of line
 */
export function findMiddle(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  }
}

