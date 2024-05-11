import { LineTip, Point, RestrainedPoint, Side, XYWH } from "@/types/canvas";

const MIN_MOVE = 20;

export function createLineSegments(start: RestrainedPoint, end: RestrainedPoint, startBlocker?: XYWH, endBlocker?: XYWH): Point[] {
    if (start.possibilities.length == 0 || end.possibilities.length == 0)
        return [];

    const fromStart: Point[] = [];
    const fromEnd: Point[] = [];

    for (let i = 0; i < 10; i++) {
        start = choosePosibility(start, end);
        end = choosePosibility(end, start);

        const connection = tryConnect(start, end, startBlocker, endBlocker)
        if (connection.length != 0) {
            fromStart.push(...connection);
            break;
        }

        const sCont = getSideContribution(start, start.possibilities[0], end);
        const eCont = getSideContribution(end, end.possibilities[0], start);

        if (sCont == eCont) {
            fromStart.push(start)
            start = expandPossibilities(start, start.possibilities[0]);
        } else if (sCont >= 0 && eCont >= 0) {
            if (sCont <= eCont) {
                fromStart.push(start)
                start = expandPossibilities(start, start.possibilities[0]);
            } else {
                fromEnd.unshift(end)
                end = expandPossibilities(end, end.possibilities[0]);
            }
        } else {
            if (sCont < 0) {
                fromStart.push(start)
                start = expandPossibilities(start, start.possibilities[0]);
            }
            if (eCont < 0) {
                fromEnd.unshift(end)
                end = expandPossibilities(end, end.possibilities[0]);
            }
        }
    }

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
        else if (getSideContribution(rp, poss, target) >= res[0])
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

    if (sVec.x != 0 && eVec.x != 0)
    {
        return [
            {
                x: (end.x - start.x) / 2 + start.x,
                y: start.y,
            },
            {
                x: (end.x - start.x) / 2 + start.x,
                y: end.y,
            }
        ]
    } else if (sVec.y != 0 && eVec.y != 0) {
        return [
            {
                x: start.x,
                y: (end.y - start.y) / 2 + start.y,
            },
            {
                x: end.x,
                y: (end.y - start.y) / 2 + start.y,
            }
        ]
    } else {
        return [{
            x: (start.x * Math.abs(sVec.x)) + (end.x * Math.abs(eVec.x)),
            y: (start.y * Math.abs(sVec.y)) + (end.x * Math.abs(eVec.y)),
        }]
    }
}

function expandPossibilities(p: Point, side: Side): RestrainedPoint {
    const sides = [Side.Right, Side.Left, Side.Top, Side.Bottom];
    var index = sides.indexOf(side);
    if (index !== -1) {
        sides.splice(index, 1);
    }

    const sVec = sideToVector(side);

    return {
        x: p.x + (sVec.x * MIN_MOVE),
        y: p.y + (sVec.y * MIN_MOVE),
        possibilities: sides
    }
}