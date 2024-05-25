import { Layer, Line, LineTip, LineType, Point, RestrainedPoint, Side, XYWH } from "@/types/canvas";
import { doesLineIntersectRect, findMiddle, isPointInsideRect, layerOffsetToPoint, sqrDist } from "./utils";
import { getLayerAttachmentPoints } from "./attachment_points";
import { LiveMap, LiveObject } from "@liveblocks/client";

const MIN_MOVE = 10;

export function createLineSegments(start: RestrainedPoint, end: RestrainedPoint, lineType: LineType, startBlocker?: XYWH, endBlocker?: XYWH): Point[] {
    if (lineType === LineType.DefaultLine || lineType === LineType.ArrowLine)
            return createDefaultLineSegments(start, end, startBlocker, endBlocker);
    if (lineType === LineType.CurvedLine)
            return [];
    return [];
}

function createDefaultLineSegments(start: RestrainedPoint, end: RestrainedPoint, startBlocker?: XYWH, endBlocker?: XYWH): Point[] {
    if (start.possibilities.length == 0 || end.possibilities.length == 0)
        return [];

    if ((startBlocker && isPointInsideRect(end, startBlocker)) || (endBlocker && isPointInsideRect(start, endBlocker)))
        return [];

    const fromStart: Point[] = [];
    const fromEnd: Point[] = [];

    console.log("Start creating line\n From: %o\n To: %o", start, end);

    for (let i = 0; i < 10; i++) {
        start = choosePosibility(start, end);
        end = choosePosibility(end, start);

        const connection = tryConnect(start, end, startBlocker, endBlocker)
        console.log("%d: s: %o\n e: %o\n connection: %o", i, start, end, connection);
        if (connection.length != 0) {
            fromStart.push(...connection);
            break;
        }

        const sCont = getSideContribution(start, start.possibilities[0], end);
        const eCont = getSideContribution(end, end.possibilities[0], start);

        console.log("%d: sCont: %o\n eCont: %o", i, sCont, eCont);

        if (sCont == eCont) {
            start = expandPossibilities(start, start.possibilities[0]);
            fromStart.push(start)
        } else if (sCont >= 0 && eCont >= 0) {
            if (sCont <= eCont) {
                start = expandPossibilities(start, start.possibilities[0]);
                fromStart.push(start)
            } else {
                end = expandPossibilities(end, end.possibilities[0]);
                fromEnd.unshift(end)

            }
        } else {
            if (sCont < 0) {
                const ps = start
                start = expandPossibilities(start, start.possibilities[0]);
                fromStart.push(start)

                console.log("%d: (sCond<0)\n fromStart: %o\n prevstart: %o\n start: %o", i, fromStart, ps, start);
            }
            if (eCont < 0) {
                end = expandPossibilities(end, end.possibilities[0]);
                fromEnd.unshift(end)
            }
        }
    }

    console.log("End creating line")

    if (fromEnd.length != 0)
        fromStart.push(...fromEnd)
    return fromStart;
}

export function tipToRestrainedPoint(tip: LineTip, layer: XYWH): RestrainedPoint {
    return {
        x: layer.x + (tip.offset.x * layer.width),
        y: layer.y + (tip.offset.y * layer.height),
        possibilities: [tip.side]
    }
}

export function getPossibilityPower(rp: RestrainedPoint) {
    return rp.possibilities.length
}

export function choosePosibility(rp: RestrainedPoint, target: Point): RestrainedPoint {
    const res: Side[] = []
    for (const poss of rp.possibilities) {
        if (res.length == 0)
            res.push(poss)
        else if (getSideContribution(rp, poss, target) >= getSideContribution(rp, res[0], target))
            res[0] = poss
    }

    return {
        x: rp.x,
        y: rp.y,
        possibilities: res
    }
}

export function getSideContribution(p: Point, side: Side, target: Point): number {
    switch(side) {
        case Side.Top:
            return p.y - target.y;
        case Side.Bottom:
            return target.y - p.y;
        case Side.Right:
            return target.x - p.x;
        case Side.Left:
            return p.x - target.x;
    }
}

export function sideToVector(side: Side): Point {
    switch(side) {
        case Side.Top:
            return {x: 0, y: -1};
        case Side.Bottom:
            return {x: 0, y: 1};
        case Side.Right:
            return {x: 1, y: 0};
        case Side.Left:
            return {x: -1, y: 0};
    }
}

function tryConnect(start: RestrainedPoint, end: RestrainedPoint, startBlocker?: XYWH, endBlocker?: XYWH): Point[] {
    if (getSideContribution(start, start.possibilities[0], end) < 0 || getSideContribution(end, end.possibilities[0], start) < 0)
        return []

    const sVec = sideToVector(start.possibilities[0]);
    const eVec = sideToVector(end.possibilities[0]);

    console.log("tryConnect: start: %o\n end: %o\n sVec: %o\n eVec: %o", start, end, sVec, eVec)

    if (sVec.x != 0 && eVec.x != 0)
    {
        const res = [
            {
                x: (end.x - start.x) / 2 + start.x,
                y: start.y,
            },
            {
                x: (end.x - start.x) / 2 + start.x,
                y: end.y,
            }
        ];

        /*if ((startBlocker && doesLineIntersectRect(res[0], res[1], startBlocker)) ||
            (endBlocker && doesLineIntersectRect(res[0], res[1], endBlocker)))
            return [];*/

        return res;
    } else if (sVec.y != 0 && eVec.y != 0) {
        const res = [
            {
                x: start.x,
                y: (end.y - start.y) / 2 + start.y,
            },
            {
                x: end.x,
                y: (end.y - start.y) / 2 + start.y,
            }
        ];

        /*if ((startBlocker && doesLineIntersectRect(res[0], res[1], startBlocker)) ||
            (endBlocker && doesLineIntersectRect(res[0], res[1], endBlocker)))
            return [];*/

        return res;
    } else {
        const res = [{
            x: (start.x * Math.abs(1-Math.abs(sVec.x))) + (end.x * Math.abs(1-Math.abs(eVec.x))),
            y: (start.y * Math.abs(1-Math.abs(sVec.y))) + (end.y * Math.abs(1-Math.abs(eVec.y))),
        }];

        /*if ((startBlocker && doesLineIntersectRect(start, res[0], startBlocker)) ||
            (endBlocker && doesLineIntersectRect(end, res[0], endBlocker)))
            return [];*/

        return res;
    }
}

function expandPossibilities(p: Point, side: Side): RestrainedPoint {
    const sides = [Side.Right, Side.Left, Side.Top, Side.Bottom];
    var index = sides.indexOf(getOppositeSide(side));
    if (index !== -1) {
        sides.splice(index, 1);
    }

    const sVec = sideToVector(side);
    console.log("expPos: p: %o\n sVec: %o\n side: %o", p, sVec, side)

    return {
        x: p.x + (sVec.x * MIN_MOVE),
        y: p.y + (sVec.y * MIN_MOVE),
        possibilities: sides
    }
}

function getOppositeSide(side: Side): Side {
    switch(side) {
        case Side.Top:
            return Side.Bottom;
        case Side.Bottom:
            return Side.Top;
        case Side.Right:
            return Side.Left;
        case Side.Left:
            return Side.Right;
    }
}

export function findClosestAttachmentPoint(layer: Layer, point: Point) {
    const atchPoints = getLayerAttachmentPoints(layer);

    let res = atchPoints[0];
    let rp = layerOffsetToPoint(res, layer);
    for (let i = 1; i < atchPoints.length; i++) {
        const p = layerOffsetToPoint(atchPoints[i], layer);
        if(sqrDist(p, point) <= sqrDist(rp, point)) {
            res = atchPoints[i];
            rp = p;
        }
    }
    return res;
}

export function addConnectedLine(layer: LiveObject<Layer> | undefined, lineId: string) {
    if (!layer)
        return;
    const conL = layer.get("connectedLines");
    conL.push(lineId);
    layer.set("connectedLines", conL);
}

export function removeConnectedLine(layer: LiveObject<Layer> | undefined, lineId: string) {
    if (!layer)
        return;
    const conL = layer.get("connectedLines");
    const index = conL.indexOf(lineId);
    if (index != -1) {
        conL.splice(index, 1)
        layer.set("connectedLines", conL);
    }
}

export function updateLineSegments(line: LiveObject<Line> | undefined, liveLayers: LiveMap<string, LiveObject<Layer>>, offset: Point, start = true) {
    if (!line)
        return;
    const lineData = line.toObject();
    if (!lineData.end)
        return;

    const segments = lineData.segments;
    if (segments.length == 0) {
        const startLayer = liveLayers.get(lineData.start.layerId)?.toObject();
        const endLayer = liveLayers.get(lineData.end.layerId)?.toObject();
        if (!startLayer || !endLayer)
            return;

        const mid = findMiddle(tipToRestrainedPoint(lineData.start, startLayer), tipToRestrainedPoint(lineData.end, endLayer));
        segments.push(mid, {...mid});
    }

    let i = 0;
    let side = lineData.start.side;
    if (!start)
    {
        i = segments.length - 1;
        side = lineData.end.side;
    }

    const sideVector = sideToVector(side);

    segments[i].x += (offset.x * Math.abs(1-Math.abs(sideVector.x)));
    segments[i].y += (offset.y * Math.abs(1-Math.abs(sideVector.y)));

    line.set("segments", segments);
}