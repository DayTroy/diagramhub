"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Camera, CanvasMode, CanvasState, Color, GrabSource, LayerType, Point, Side, XYWH } from "@/types/canvas";
import { Info } from "./info";
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
import { clamp, connectionIdToColor, findIntersectingLayersWithRectangle, mouseEventToCanvasPoint, resizeBounds, screenPointToCanvasPoint } from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { ZoomBar } from "./zoom-bar";
import usePreventZoom from "@/lib/prevent_zoom";

const MAX_LAYERS = 100;

interface CanvasProps {
    boardId: string;
}

export const Canvas = ({
    boardId,
}: CanvasProps) => {
    const layerIds = useStorage((root) => root.layerIds);

    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None
    });

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
    const MAX_CAM_SCALE = 2;
    const MIN_CAM_SCALE = 0.2;

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
    });

    const insertLayer = useMutation((
        { storage, setMyPresence },
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
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
            fill: lastUsedColor
        })

        liveLayersIds.push(layerId)
        liveLayers.set(layerId, layer)

        setMyPresence({ selection: [layerId] }, { addToHistory: true })
        setCanvasState({ mode: CanvasMode.None })

    }, [lastUsedColor]);

    const translateSelectedLayers = useMutation((
        { storage, self },
        pointerDeltaSC: Point
    ) => {
        if( canvasState.mode !== CanvasMode.Translating) {
            return;
        }

        const offset = {
            x: pointerDeltaSC.x / camera.scale,
            y: pointerDeltaSC.y / camera.scale,
        }

        const liveLayers = storage.get("layers");

        for (const id of self.presence.selection) {
            const layer = liveLayers.get(id);

            if (layer) {
                layer.update({
                    x: layer.get("x") + offset.x,
                    y: layer.get("y") + offset.y,
                })
            }
        }
        setCanvasState({ mode: CanvasMode.Translating });

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

    const handlePointerPositionChange = useMutation((
        { setMyPresence },
        newPointerPositionCC: Point,
        e: React.MouseEvent,
    ) => {

        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(newPointerPositionCC, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(newPointerPositionCC, canvasState.origin)
        } else if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayers({x: e.movementX, y: e.movementY});
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(newPointerPositionCC)
        } else if (canvasState.mode === CanvasMode.Grab && e.buttons !== 0) {
            grabUpdateCameraPosition({x: e.movementX, y: e.movementY})
        }

        setMyPresence({ cursor:newPointerPositionCC });
    }, [
        canvasState,
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
    ) => {
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
    ) => {
        const screenCenter = {x: window.innerWidth/2, y: window.innerHeight/2};
        const amount = zoomIn ? 0.1 : -0.1;

        zoomCamera(amount, screenCenter);
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

        const pointerCanvasPos = mouseEventToCanvasPoint(e, newCamData)
        handlePointerPositionChange(pointerCanvasPos, e)
    }, [
        canvasState,
        handlePointerPositionChange,
        moveCamera,
        zoomCamera
    ])

    const onPointerMove = useCallback((
        e: React.PointerEvent
    ) => {
        e.preventDefault();

        const pointerCanvasPos = mouseEventToCanvasPoint(e, camera);

        handlePointerPositionChange(pointerCanvasPos, e)
    }, [
        camera,
        handlePointerPositionChange
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
        const pointerCanvasPos = mouseEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.Inserting) {
            return
        }

        //TODO: Если будет рисовалка то предусмотреть кейс

        if (e.button === 1) {
            setCanvasState({mode: CanvasMode.Grab, source: GrabSource.ScrollWheelPress})
        } else if (canvasState.mode !== CanvasMode.Grab) {
            setCanvasState({ origin: pointerCanvasPos, mode: CanvasMode.Pressing });
        }
    }, [camera, canvasState, setCanvasState])

    const onPointerUp = useMutation((
        {},
        e
    ) => {
        const point = mouseEventToCanvasPoint(e, camera);

        if (
            canvasState.mode === CanvasMode.None ||
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
        } else {
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
        { self, setMyPresence },
        e: React.PointerEvent,
        layerId: string,
    ) => {
        if (
            canvasState.mode === CanvasMode.Pencil ||
            canvasState.mode === CanvasMode.Inserting
        ) {
            return;
        }

        history.pause();
        e.stopPropagation();

        if (!self.presence.selection.includes(layerId)) {
            setMyPresence({ selection: [layerId ]}, { addToHistory: true });
        }

        setCanvasState({ mode: CanvasMode.Translating });
    }, [
        setCanvasState,
        camera,
        history,
        canvasState.mode
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

    return (
        <main
            className="h-full w-full relative bg-neutral-100 touch-none"
            onPointerLeave={onPointerLeaveWindow}
            onPointerUp={onPointerUp}
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
            <SelectionTools
                camera={camera}
                setLastUsedColor={setLastUsedColor}
            />
            <ZoomBar
                cameraScale={camera.scale}
                zoomIn={() => zoomToCenter(true)}
                zoomOut={() => zoomToCenter(false)}
            />
            <svg
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
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
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
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