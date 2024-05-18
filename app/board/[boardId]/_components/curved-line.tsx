import { tipToRestrainedPoint } from "@/lib/line_utils";
import { useStorage } from "@/liveblocks.config";
import { Line } from "@/types/canvas";
import { useMemo } from "react";

/**
 * The props type for {@link DefaultLineComponent}
 */
export interface CurvedLineProps {
    id: string;
    line: Line;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

/**
 *  Component representing line canvas object
 *  @category Component
 */
export const CurvedLine = ({
    id,
    line,
    onPointerDown,
    selectionColor

}: CurvedLineProps) => {
    const { start, end, segments } = line;
    const liveLayers = useStorage((root) => root.layers);

    const startLayer = liveLayers.get(start.layerId);
    const endLayer = end ? liveLayers.get(end.layerId) : undefined;

    const pathCommand = useMemo(() => {
        if (!end || !segments || !startLayer || !endLayer)
            return "";

        const startPoint = tipToRestrainedPoint(start, startLayer);
        const endPoint = tipToRestrainedPoint(end, endLayer);

        return `M ${startPoint.x} ${startPoint.y} C ${endPoint.x} ${startPoint.y}, ${startPoint.x} ${endPoint.y}, ${endPoint.x} ${endPoint.y}`
    }, [end, segments, start, startLayer, endLayer])

    if(!startLayer || !endLayer)
        return;

    return (
        <g>
            <path
            d={pathCommand}
            stroke="#000000"
            stroke-width="2"
            stroke-linejoin="round"
            fill="none"
            />
            {/* Wider invisible line to detect clicks over a larger area. */}
            <path
            d={pathCommand}
            opacity="0"
            stroke="#000000"
            stroke-linejoin="round"
            stroke-width="10"
            fill="none"
            onPointerDown={(e) => onPointerDown(e, id)}
            />
        </g>
    )
}