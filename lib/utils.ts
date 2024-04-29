import { Camera, Color, Layer, Point, Side, XYWH } from "@/types/canvas";
import { LiveObject } from "@liveblocks/client";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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

export function isRightSide(point: Point, layer: Layer) {
  return point.x > (layer?.get("x") + layer?.get("width") / 2)
}

export function isLeftSide(point: Point, layer: Layer) {
  return point.x < (layer?.get("x") + layer?.get("width") / 2)
}

export function isBottomSide(point: Point, layer: Layer) {
  return point.y > (layer?.get("y") + layer?.get("height") / 2)
}

export function isUpperSide(point: Point, layer: Layer) {
  return point.y < (layer?.get("y") + layer?.get("height") / 2)
}

export function calculateLineOffset(point: Point, layer: Layer) {
    if (isRightSide(point, layer) && isBottomSide(point, layer)) {
      return {
        x: 0,
        y: 0,
      }
    }
    if (isRightSide(point, layer) && isUpperSide(point, layer)) {
      return {
        x: 0,
        y: 0,
      }
    }
    if (isLeftSide(point, layer) && isBottomSide(point, layer)) {
      return {
        x: 0,
        y: 0,
      }
    }
    if (isLeftSide(point, layer) && isUpperSide(point, layer)) {
      return {
        x: 0,
        y: 0,
      }
    }
}

