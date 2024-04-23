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
import { connectionIdToColor, findIntersectingLayersWithRectangle, mouseEventToCanvasPoint, resizeBounds } from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Grab } from "lucide-react";

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

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0
    });

    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    useEffect(() => {
        document.body.style.overflow = "hidden";
    });

    const insertLayer = useMutation((
        { storage, setMyPresence },
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
        position: Point
    ) => {
        const liveLayers = storage.get("layers");

        if (liveLayers.size >= MAX_LAYERS) {
            return;
        }

        const liveLayersIds = storage.get("layerIds");

        const layerId = nanoid();

        const layer = new LiveObject({
            type: layerType,
            x: position.x,
            y: position.y,
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
        point: Point
    ) => {
        if( canvasState.mode !== CanvasMode.Translating) {
            return;
        }

        const offset = {
            x: point.x - canvasState.current.x,
            y: point.y - canvasState.current.y,
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
        setCanvasState({ mode: CanvasMode.Translating, current: point });

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
        current: Point,
        origin: Point,
    ) => {
        const layers = storage.get("layers").toImmutable();
        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin,
            current
        })
        const ids = findIntersectingLayersWithRectangle(
            layerIds,
            layers,
            origin,
            current
        );
        setMyPresence({ selection: ids })

    }, [layerIds]);

    const startMultiSelection = useCallback((
        current: Point,
        origin: Point,
    ) => {
        if (
            Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5
        ) {
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current
            })
        }
    }, [])

    const resizeSelectedLayer = useMutation((
        { storage, self },
        point: Point,
    ) => {
        if (canvasState.mode !== CanvasMode.Resizing) {
            return
        }

        const bounds = resizeBounds(
            canvasState.initialBounds,
            canvasState.corner,
            point,
        );
        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(self.presence.selection[0]);

        if (layer) {
            layer.update(bounds);
        }

    }, [canvasState])

    const grabUpdateCameraPosition = useCallback((
        delta: Point
    ) => {
        setCamera((camera) => ({
            x: camera.x + delta.x,
            y: camera.y + delta.y
        }))
    }, []);

    const handlePointerPositionChange = useMutation((
        { setMyPresence },
        newPointerPositionCanvas: Point,
        e: React.MouseEvent,
    ) => {

        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(newPointerPositionCanvas, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(newPointerPositionCanvas, canvasState.origin)
        } else if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayers(newPointerPositionCanvas);
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(newPointerPositionCanvas)
        } else if (canvasState.mode === CanvasMode.Grab && e.buttons !== 0) {
            grabUpdateCameraPosition({x: e.movementX, y: e.movementY})
        }

        setMyPresence({ cursor:newPointerPositionCanvas });
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

    const onWheel = useCallback((
        e: React.WheelEvent
    ) => {
        if (canvasState.mode === CanvasMode.Grab && e.buttons !== 0){
            return;
        }

        const newCamPos = {
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY
        }
        if (e.shiftKey) {
            // Если нажат shift двигаем камеру вправо-влево
            newCamPos.x = camera.x + e.deltaY
            newCamPos.y = camera.y + e.deltaX
        }

        setCamera((camera) => (newCamPos))

        const pointerCanvasPos = mouseEventToCanvasPoint(e, newCamPos)
        handlePointerPositionChange(pointerCanvasPos, e)

    }, [
        camera,
        canvasState,
        handlePointerPositionChange
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
        const point = mouseEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.Inserting) {
            return
        }

        //TODO: Если будет рисовалка то предусмотреть кейс

        if (e.button === 1) {
            setCanvasState({mode: CanvasMode.Grab, source: GrabSource.ScrollWheelPress})
        } else if (canvasState.mode !== CanvasMode.Grab) {
            setCanvasState({ origin: point, mode: CanvasMode.Pressing });
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

        const point = mouseEventToCanvasPoint(e, camera);

        if (!self.presence.selection.includes(layerId)) {
            setMyPresence({ selection: [layerId ]}, { addToHistory: true });
        }

        setCanvasState({ mode: CanvasMode.Translating, current: point });

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
            <svg
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerLeaveCanvas}
                onPointerDown={onPointerDown}
            >
                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px)`
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