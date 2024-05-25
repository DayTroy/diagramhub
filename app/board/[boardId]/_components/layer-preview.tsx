"use client";

import { useStorage } from "@/liveblocks.config";
import { LayerType } from "@/types/canvas";
import { memo } from "react";
import { Rectangle } from "./rectangle";
import Ellipse from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { EPCEvent } from "./EPC/epcevent";
import { EPCFunction } from "./EPC/epcfunction";
import { ProcessInterface } from "./EPC/process-interface";
import { EPCGateway } from "./EPC/epcgateway";

interface LayerPreviewProps {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void; //TODO: Пофиксить типизацию
    selectionColor?: string;
}

export const LayerPreview = memo(({
    id,
    onLayerPointerDown,
    selectionColor
}: LayerPreviewProps) => {

    const layer = useStorage((root) => root.layers.get(id));

    if (!layer) {
        return null
    }

    switch(layer.type) {
        case LayerType.Text:
            return (
                <Text 
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        case LayerType.Note:
            return (
                <Note 
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        case LayerType.Rectangle:
            return (
                <Rectangle 
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        case LayerType.Ellipse:
            return (
                <Ellipse
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        case LayerType.EPCEvent:
            return (
                <EPCEvent
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        case LayerType.EPCFunction:
            return (
                <EPCFunction
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        case LayerType.ProcessInterface:
            return (
                <ProcessInterface
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        case LayerType.EPCGateway:
            return (
                <EPCGateway
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );
        default: 
            console.warn("Unknown layer type");
            return null
    }
});

LayerPreview.displayName = "LayerPreview";