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

/** Layer type. */
export enum LayerType {
    Rectangle,
    Ellipse,
    Path,
    Text,
    Note,
    EPCEvent,
    EPCFunction,
    ProcessInterface,
    EPCGateway,
};

/** Rectangle layer type. */
export type RectangleLayer = {
    type: LayerType.Rectangle;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

/** Ellipse layer type. */
export type EllipseLayer = {
    type: LayerType.Ellipse;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

/** Path layer type. */
export type PathLayer = {
    type: LayerType.Path;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    points: number[][];
    value?: string;
};

/** Text layer type. */
export type TextLayer = {
    type: LayerType.Text;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

/** Note layer type. */
export type NoteLayer = {
    type: LayerType.Note;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type EPCEventLayer = {
    type: LayerType.EPCEvent;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type EPCFunctionLayer = {
    type: LayerType.EPCFunction;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type ProcessInterfaceLayer = {
    type: LayerType.ProcessInterface;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type EPCGatewayLayer = {
    type: LayerType.EPCGateway;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

/** Point type. */
export type Point = {
    x: number;
    y: number;
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
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note | LayerType.EPCEvent | LayerType.EPCFunction | LayerType.ProcessInterface | LayerType.EPCGateway;
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

/** Canvas mode enum. */
export enum CanvasMode {
    None,
    Pressing,
    SelectionNet,
    Translating,
    Inserting,
    Resizing,
    Pencil,
    Grab
};

/** Grab source enum. */
export enum GrabSource {
    Toolbar,
    ScrollWheelPress
};

/** Layer type alias. */
export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer | NoteLayer | EPCEventLayer | EPCFunctionLayer | ProcessInterfaceLayer | EPCGatewayLayer;