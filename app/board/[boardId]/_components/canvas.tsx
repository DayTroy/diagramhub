"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Camera, CanvasMode, CanvasState, Color, GrabSource, LayerType, LineType, Point, Side, XYWH } from "@/types/canvas";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { nanoid } from "nanoid"

import {
    useHistory,
    useCanRedo,
    useCanUndo,
    useMutation,
    useStorage,
    useOthersMapped
} from "@/liveblocks.config";
import { CursorsPresence } from "./cursors-presence";
import { calculateLineOffset, clamp, connectionIdToColor, findIntersectingLayersWithRectangle, getMousePosition, mouseEventToCanvasPoint, pointsDifference, resizeBounds, screenPointToCanvasPoint } from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { ZoomBar } from "./zoom-bar";
import usePreventZoom from "@/lib/prevent_zoom";
import { LinePreview } from "./line-preview";
import { Info } from "./info";
import { Button } from "@/components/ui/button";
import { BadgeX } from "lucide-react";
import { addConnectedLine, createLineSegments, removeConnectedLine, tipToRestrainedPoint, updateLineSegments } from "@/lib/line_utils";
import { LineDrawingPreview } from "../line-drawing-preview";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { SelectionToolsEPC } from "./EPC/selection-tools-epc";


const MAX_LAYERS = 100;

/**
 * The props type for {@link Canvas}
 */
export interface CanvasProps {
    boardId: string;
}

/**
 * Canvas component.
 * Lets user draw diagrams on it.
 * @category Component
 */
export const Canvas = ({
    boardId,
}: CanvasProps) => {

    const data = useQuery(api.board.get, {
        id: boardId as Id<"boards">,
    });

    const layerIds = useStorage((root) => root.layerIds);
    const lineIds = useStorage((root) => root.lineIds);

    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None
    });

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
    const MAX_CAM_SCALE = 2;
    const MIN_CAM_SCALE = 0.2;

    const [mouseScreenPosition, setMouseScreenPosition] = useState<Point>({ x: 0, y: 0});

    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0
    });

    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    usePreventZoom();
    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehaviorX = "none"
    });

    /**
     * Insert a new layer at given position.
    */
    const insertLayer = useMutation((
        { storage, setMyPresence },
        layerType: LayerType,
        positionCC: Point
    ) => {
        const liveLayers = storage.get("layers");

        if (liveLayers.size >= MAX_LAYERS) {
            return;
        }

        const liveLayersIds = storage.get("layerIds");
        const layerId = nanoid();

        const layer = new LiveObject({
            type: layerType,
            x: positionCC.x,
            y: positionCC.y,
            height: 100,
            width: 100,
            fill: lastUsedColor,
            connectedLines: []
        })

        liveLayersIds.push(layerId)
        liveLayers.set(layerId, layer)

        setMyPresence({ selection: [layerId] }, { addToHistory: true })
        setCanvasState({ mode: CanvasMode.None })

    }, [lastUsedColor]);

    const translateSelectedLayers = useMutation((
        { storage, self },
        pointerDeltaCC: Point
    ) => {
        if( canvasState.mode !== CanvasMode.Translating) {
            return;
        }

        const liveLayers = storage.get("layers");
        const liveLines = storage.get("lines");

        for (const id of self.presence.selection) {
            const layer = liveLayers.get(id);
            if(!layer)
                continue;

            layer.update({
                x: layer.get("x") + pointerDeltaCC.x,
                y: layer.get("y") + pointerDeltaCC.y,
            })

            const connectedLines = layer.get('connectedLines')
            for (const lineId of connectedLines) {
                const line = liveLines.get(lineId);
                if (!line)
                    continue;
                updateLineSegments(line, liveLayers, pointerDeltaCC, line.get("start").layerId == id);
            }
        }
    }, [
        canvasState,
    ]);

    const unselectLayers = useMutation((
        { self, setMyPresence }
    ) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, [])

    const updateSelectionNet = useMutation((
        { storage, setMyPresence },
        currentCC: Point,
        originCC: Point,
    ) => {
        const layers = storage.get("layers").toImmutable();
        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin: originCC,
            current: currentCC,
        })
        const ids = findIntersectingLayersWithRectangle(
            layerIds,
            layers,
            originCC,
            currentCC
        );
        setMyPresence({ selection: ids })

    }, [layerIds, camera]);

    const startMultiSelection = useCallback((
        currentCC: Point,
        originCC: Point,
    ) => {
        if (
            Math.abs(currentCC.x - originCC.x) + Math.abs(currentCC.y - originCC.y) > 5
        ) {
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin: originCC,
                current: currentCC
            })
        }
    }, [])

    const resizeSelectedLayer = useMutation((
        { storage, self },
        pointCC: Point,
    ) => {
        if (canvasState.mode !== CanvasMode.Resizing) {
            return
        }

        const bounds = resizeBounds(
            canvasState.initialBounds,
            canvasState.corner,
            pointCC,
        );
        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(self.presence.selection[0]);

        if (layer) {
            layer.update(bounds);
        }

    }, [canvasState])

    const grabUpdateCameraPosition = useCallback((
        moveVectorSC: Point
    ) => {
        setCamera((camera) => ({
            x: camera.x + (moveVectorSC.x / camera.scale),
            y: camera.y + (moveVectorSC.y / camera.scale),
            scale: camera.scale
        }))
    }, []);

    /**
     * Handles mouse position change.
     * Should be called after the camera zooms or when the user moves the mouse.
     *
     * @param newMouseScreenPos new mouse position in screen coordinates
     * @param newCamData new camera parameters
     * @param buttons Pressed mouse btns (same as MouseEvent.buttons)
     */
    const handleMousePositionChange = useMutation((
        { setMyPresence },
        newMouseScreenPos: Point,
        newCamData: Camera,
        buttons: number,
    ) => {
        const newMouseCanvasPos = screenPointToCanvasPoint(newMouseScreenPos, newCamData);

        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(newMouseCanvasPos, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(newMouseCanvasPos, canvasState.origin)
        } else if (canvasState.mode === CanvasMode.Translating) {
            const prevMouseCanvasPos = screenPointToCanvasPoint(mouseScreenPosition, camera)
            translateSelectedLayers(pointsDifference(newMouseCanvasPos, prevMouseCanvasPos));
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(newMouseCanvasPos)
        } else if (canvasState.mode === CanvasMode.Grab && buttons !== 0) {
            grabUpdateCameraPosition(pointsDifference(newMouseScreenPos, mouseScreenPosition))
        }

        setMyPresence({ cursor:newMouseCanvasPos });
        setMouseScreenPosition(newMouseScreenPos)
    }, [
        canvasState,
        mouseScreenPosition,
        camera,
        resizeSelectedLayer,
        translateSelectedLayers
    ])

    const onResizeHandlePointerDown = useCallback((
        corner: Side,
        initialBounds: XYWH
    ) => {
        history.pause();
        setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner,
        })
    }, [history])

    const zoomCamera = useCallback((
        amount: number,
        zoomCenterSC: Point
    ): Camera => {
        const newCamData = {
            x: camera.x,
            y: camera.y,
            scale: camera.scale
        }

        const preZoomCenterPos = screenPointToCanvasPoint(zoomCenterSC, newCamData);
        newCamData.scale = clamp(newCamData.scale + amount, MIN_CAM_SCALE, MAX_CAM_SCALE);
        const postZoomCenterPos = screenPointToCanvasPoint(zoomCenterSC, newCamData);

        newCamData.x = camera.x - (preZoomCenterPos.x - postZoomCenterPos.x);
        newCamData.y = camera.y - (preZoomCenterPos.y - postZoomCenterPos.y);

        setCamera((camera) => (newCamData));

        return newCamData;
    }, [camera])

    const zoomToCenter = useCallback((
        zoomIn: Boolean
    ): Camera => {
        const screenCenter = {x: window.innerWidth/2, y: window.innerHeight/2};
        const amount = zoomIn ? 0.1 : -0.1;

        return zoomCamera(amount, screenCenter);
    }, [zoomCamera])

    const moveCamera = useCallback((
        moveVectorSC: Point
    ) => {
        const newCamData = {
            x: camera.x + (moveVectorSC.x / camera.scale),
            y: camera.y + (moveVectorSC.y / camera.scale),
            scale: camera.scale
        };

        setCamera((camera) => (newCamData));

        return newCamData;
    }, [camera])

    const onWheel = useCallback((
        e: React.WheelEvent
    ) => {
        if (canvasState.mode === CanvasMode.Grab && e.buttons !== 0){
            return;
        }

        let newCamData;
        if (e.ctrlKey) {
            // Handle zoom
            newCamData = zoomCamera(0.1 * Math.round(-e.deltaY / 100), {x: e.clientX, y: e.clientY})
        } else {
            // Handle move
            if (e.shiftKey) {
                newCamData = moveCamera({x: e.deltaY, y: e.deltaX});
            } else {
                newCamData = moveCamera({x: -e.deltaX, y: -e.deltaY});
            }
        }

        handleMousePositionChange(getMousePosition(e), newCamData, e.buttons)
    }, [
        canvasState,
        handleMousePositionChange,
        moveCamera,
        zoomCamera
    ])

    const onKeyDown = useCallback((
        e: React.KeyboardEvent
    ) => {
        if (e.ctrlKey) {
            let camData = undefined;
            if (e.code == "Equal" || e.code == "NumpadAdd") {
                camData = zoomCamera(0.1, mouseScreenPosition);
            } else if (e.code == "Minus" || e.code == "NumpadSubtract") {
                camData = zoomCamera(-0.1, mouseScreenPosition);
            }

            if (camData) {
                handleMousePositionChange(mouseScreenPosition, camData, 0)
            }
        }
    }, [handleMousePositionChange, zoomCamera, mouseScreenPosition])

    const onPointerMove = useCallback((
        e: React.PointerEvent
    ) => {
        e.preventDefault();

        handleMousePositionChange(getMousePosition(e), camera, e.buttons)
    }, [
        camera,
        handleMousePositionChange
    ])

    const onPointerLeaveWindow = useCallback(() => {
        if (canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.Resizing ||
            canvasState.mode === CanvasMode.SelectionNet) {
                setCanvasState({ mode: CanvasMode.None });
        } else if (canvasState.mode === CanvasMode.Grab) {
            if (canvasState.source === GrabSource.ScrollWheelPress) {
                setCanvasState({ mode: CanvasMode.None });
            } else {
                setCanvasState({mode: CanvasMode.Grab, source: canvasState.source})
            }
        }
    }, [canvasState])

    const onPointerLeaveCanvas = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, [canvasState])

    const onPointerDown = useMutation((
        { setMyPresence },
        e: React.PointerEvent,
    ) => {
        setMouseScreenPosition({x: e.clientX, y: e.clientY});
        const pointerCanvasPos = mouseEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.Inserting) {
            return
        }

        //TODO: Если будет рисовалка то предусмотреть кейс

        if (e.button === 1) {
            setCanvasState({mode: CanvasMode.Grab, source: GrabSource.ScrollWheelPress})
        } else if (canvasState.mode !== CanvasMode.Grab && canvasState.mode !== CanvasMode.Connecting) {
            setCanvasState({ origin: pointerCanvasPos, mode: CanvasMode.Pressing });
        }
    }, [camera, canvasState, setCanvasState])

    const onPointerUp = useMutation((
        {},
        e
    ) => {
        const point = mouseEventToCanvasPoint(e, camera);

        if (
            // canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Pressing
        ) {
            unselectLayers();
            setCanvasState({
                mode: CanvasMode.None
            })
        } else if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point)
        } else if (canvasState.mode === CanvasMode.Grab)  {
            if (canvasState.source === GrabSource.ScrollWheelPress)
            {
                setCanvasState({mode: CanvasMode.None});
            }
        } else if (canvasState.mode !== CanvasMode.Connecting) {
            setCanvasState({
                mode: CanvasMode.None
            });
        }
        history.resume();
    },
    [
        camera,
        canvasState,
        history,
        insertLayer,
        unselectLayers
    ])

    const selections = useOthersMapped((other) => other.presence.selection);

    const onLayerPointerDown = useMutation((
        { self, setMyPresence, storage },
        e: React.PointerEvent,
        layerId: string,
    ) => {

        if (
            canvasState.mode === CanvasMode.Pencil ||
            canvasState.mode === CanvasMode.Inserting
        ) {
            return;
        } else if (canvasState.mode === CanvasMode.Connecting) {
            const point = mouseEventToCanvasPoint(e, camera);
            const liveLayers = storage.get("layers");
            const liveLayer = liveLayers.get(layerId)?.toObject();

            if (!liveLayer) {
                return;
            }

            const [offset, side] = calculateLineOffset(point, liveLayer);

            const defaultColor =  {
                r: 0,
                g: 0,
                b: 0
            }

            if (!canvasState.line) {
                const line = {
                    type: canvasState.type,
                    start: {
                        layerId: layerId,
                        offset: offset,
                        side: side
                    },
                    segments: [],
                    fill: defaultColor
                }
                setCanvasState({ mode: CanvasMode.Connecting, type: canvasState.type, line: line })
            } else {
                const startLayer = liveLayers.get(canvasState.line.start.layerId)?.toObject();
                if (startLayer && canvasState.line.start.layerId !== layerId) {
                    canvasState.line.end = {
                        layerId: layerId,
                        offset: offset,
                        side: side
                    }

                    canvasState.line.segments = createLineSegments(
                        tipToRestrainedPoint(canvasState.line.start, startLayer),
                        tipToRestrainedPoint(canvasState.line.end, liveLayer),
                        canvasState.line.type,
                        startLayer,
                        liveLayer
                    )

                    const liveLineIds = storage.get("lineIds");
                    const liveLines = storage.get("lines");

                    const line = new LiveObject({
                        ...canvasState.line
                    })

                    const lineId = nanoid();

                    liveLineIds.push(lineId);
                    liveLines.set(lineId, line);

                    addConnectedLine(liveLayers.get(canvasState.line.start.layerId), lineId);
                    addConnectedLine(liveLayers.get(canvasState.line.end.layerId), lineId);

                    setMyPresence({ selection: [] }, { addToHistory: true })
                    setCanvasState({ mode: CanvasMode.None })
                }
            }
        } else if(e.button == 0) {
            setCanvasState({ mode: CanvasMode.Translating });
            history.pause();

            if (!self.presence.selection.includes(layerId)) {
                setMyPresence({ selection: [layerId ]}, { addToHistory: true });
            }
        } else if (e.button == 1) {
            setCanvasState({mode: CanvasMode.Grab, source: GrabSource.ScrollWheelPress})
        }

        e.stopPropagation();
    }, [
        setCanvasState,
        camera,
        history,
        canvasState
    ])

    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};

        for (const user of selections) {
            const [connectionId, selection] = user;

            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
            }
         }

         return layerIdsToColorSelection;
    }, [selections]);

    const onLinePointerDown = useMutation((
        { },
        e: React.PointerEvent,
        lineId: string,
    ) => {
        console.log("Line pointer down (%s)", lineId)
    }, [])

    const removeAllLines = useMutation((
        { storage }
    ) => {
        const liveLayers = storage.get("layers");
        const liveLines = storage.get("lines");
        const liveLineIds = storage.get("lineIds");

        for (const id of lineIds) {
            const line = liveLines.get(id)?.toObject();
            if (line) {
                const startLayer = liveLayers.get(line.start.layerId);
                const endLayer = line.end ? liveLayers.get(line.end.layerId) : undefined;

                removeConnectedLine(startLayer, id);
                removeConnectedLine(endLayer, id);
            }

            liveLines.delete(id);
            const index = liveLineIds.indexOf(id);
            if (index !== -1) {
                liveLineIds.delete(index);
            }
        }
    }, [lineIds])

    return (
        <main
            className="h-full w-full relative bg-neutral-100 touch-none"
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeaveWindow}
            onKeyDown={onKeyDown}
            tabIndex={-1}
        >
            <Info boardId={boardId} />
            <Participants />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canRedo={canRedo}
                canUndo={canUndo}
                undo={history.undo}
                redo={history.redo}
            />
            {data?.notation == 'EPC' && <SelectionToolsEPC
                camera={camera}
                setLastUsedColor={setLastUsedColor}
            />}
            {data?.notation !== 'EPC' && <SelectionTools
                camera={camera}
                setLastUsedColor={setLastUsedColor}
            />}
            <ZoomBar
                cameraScale={camera.scale}
                zoomIn={() => zoomToCenter(true)}
                zoomOut={() => zoomToCenter(false)}
            />
            {/* Debug lines remove button (delete it and removeAllLines function later) */}
            <Button
                className= "absolute bottom-2 right-2 bg-white rounded-md h-12 w-12"
                onClick={removeAllLines}
                size="icon"
                variant="board"
            >
                <BadgeX />
            </Button>
            <svg
                id="canvas"
                className="h-[100vh] w-[100vw] select-none"
                onWheel={onWheel}
                onPointerLeave={onPointerLeaveCanvas}
                onPointerDown={onPointerDown}
            >
                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px)`,
                        scale: `${camera.scale}`
                    }}
                >
                    {layerIds.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    {lineIds?.map((lineId) => (
                        <LinePreview
                            key={lineId}
                            id={lineId}
                            onLinePointerDown={onLinePointerDown}
                            selectionColor={""}
                        />
                    ))}
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
                    {canvasState.mode == CanvasMode.Connecting && (
                        <LineDrawingPreview
                            mouseCanvasPos={screenPointToCanvasPoint(mouseScreenPosition, camera)}
                        />
                    )}
                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
                        <rect
                            className="fill-blue-500/5 stroke-blue-500 stroke-1"
                            x={Math.min(canvasState.origin.x, canvasState.current.x)}
                            y={Math.min(canvasState.origin.y, canvasState.current.y)}
                            width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                        />
                    )}
                    <CursorsPresence />
                </g>
            </svg>
        </main>
    )
}

export default Canvas;