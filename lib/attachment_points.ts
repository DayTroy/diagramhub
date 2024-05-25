import { Layer, LayerType, Point } from "@/types/canvas";
import { findMiddle, sqrDist } from "./utils";

/**
 * Returns layer attachment points relative to layer positions.
 */
export function getLayerAttachmentPoints(layer: Layer): Point[] {
    switch (layer.type) {
        case LayerType.Rectangle:
            return rectAttachmentPoints(layer);
        case LayerType.Ellipse:
        case LayerType.EPCGateway:
            return sidesMiddleAtchPoints(layer);
        default:
            return rectAttachmentPoints(layer);
    }
}

const MIN_RECT_SEGMENT_LENGTH = 24;
const RECT_CORNER_OFFSET = 8;

function rectAttachmentPoints(layer: Layer): Point[] {
    const lines = [
        {x: RECT_CORNER_OFFSET, y: 0},
        {x: layer.width - RECT_CORNER_OFFSET, y: 0},

        {x: layer.width, y: RECT_CORNER_OFFSET},
        {x: layer.width, y: layer.height - RECT_CORNER_OFFSET},

        {x: layer.width - RECT_CORNER_OFFSET, y: layer.height},
        {x: RECT_CORNER_OFFSET, y: layer.height},

        {x: 0, y: layer.height - RECT_CORNER_OFFSET},
        {x: 0, y: RECT_CORNER_OFFSET}
    ];

    let res = rectAtchPointsForLine(lines[0], lines[1]);
    res = res.concat(rectAtchPointsForLine(lines[2], lines[3]));
    res = res.concat(rectAtchPointsForLine(lines[4], lines[5]));
    res = res.concat(rectAtchPointsForLine(lines[6], lines[7]));

    return res;
}

function rectAtchPointsForLine(a: Point, b: Point): Point[] {
    const res = [a, b]

    while (sqrDist(res[0], res[1]) > MIN_RECT_SEGMENT_LENGTH**2) {
        for (let i = 0; i+1 < res.length; i++) {
            const c = findMiddle(res[i], res[i+1]);
            res.splice(i+1, 0, c);
            i++;
        }
    }
    return res;
}

function sidesMiddleAtchPoints(layer: Layer): Point[] {
    return [
        {x: layer.width/2, y: 0},
        {x: layer.width, y: layer.height/2},
        {x: layer.width/2, y: layer.height},
        {x: 0, y: layer.height/2},
    ];
}