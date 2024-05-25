/** Color type. */
export type Color = {
    r: number;
    g: number;
    b: number;
}

/** Camera type. */
export type Camera = {
    x: number;
    y: number;
    scale: number;
}

/** Point type. */
export type Point = {
    x: number;
    y: number;
}

export type RestrainedPoint = {
    x: number;
    y: number;
    possibilities: Side[];
}

/** Point with width and height type. */
export type XYWH = {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Side enum. */
export enum Side {
    Top = 1,
    Bottom = 2,
    Left = 4,
    Right = 8
};

/** Start of end of the line. */
export type LineTip = {
    layerId: string;
    offset: Point;
    side: Side;
}

/** Canvas state type. */
export type CanvasState =
    | {
        mode: CanvasMode.None;
    }
    | {
        mode: CanvasMode.Pressing,
        origin: Point;
    }
    | {
        mode: CanvasMode.SelectionNet,
        origin: Point;
        current?: Point;
    }
    | {
        mode: CanvasMode.Translating,
    }
    | {
        mode: CanvasMode.Inserting,
        layerType: LayerType;
    }
    | {
        mode: CanvasMode.Resizing,
        initialBounds: XYWH;
        corner: Side;
    }
    | {
        mode: CanvasMode.Pencil,
    }
    | {
        mode: CanvasMode.Grab,
        source: GrabSource;
    }
    | {
        mode: CanvasMode.Connecting,
        type: LineType,
        line?: Line
    }

/** Canvas mode enum. */
export enum CanvasMode {
    None,
    Pressing,
    SelectionNet,
    Translating,
    Inserting,
    Resizing,
    Pencil,
    Grab,
    Connecting,
};

/** Grab source enum. */
export enum GrabSource {
    Toolbar,
    ScrollWheelPress
};

/** Layer types enum. */
export enum LayerType {
    Rectangle,
    Ellipse,
    Path,
    Text,
    Note,
    EPCEvent,
    EPCFunction,
    ProcessInterface,
    EPCGateway
};

/** Line types enum. */
export enum LineType {
    DefaultLine,
    CurvedLine,
    ArrowLine,
};

/** Basic layer type. */
export type BasicLayer = {
    type: LayerType;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    connectedLines: string[];
    value?: string;
};

/** Basic line type. */
export type BasicLine = {
    type: LineType;
    start: LineTip;
    end?: LineTip;
    segments: Point[];
    fill: Color;
    value?: string;
};

/** Layer type alias. */
export type Layer = BasicLayer;
/** Line type alias. */
export type Line = BasicLine;
