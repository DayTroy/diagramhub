import { tipToRestrainedPoint } from "@/lib/line_utils";
import { colorToCss } from "@/lib/utils";
import { useStorage } from "@/liveblocks.config";
import { Line } from "@/types/canvas";
import { useMemo } from "react";

/**
 * The props type for {@link DefaultLineComponent}
 */
export interface DefaultLineProps {
    id: string;
    line: Line;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

/**
 *  Component representing line canvas object
 *  @category Component
 */
export const DefaultLineComponent = ({
    id,
    line,
    onPointerDown,
    selectionColor

}: DefaultLineProps) => {
    const { start, end, segments } = line;
    const liveLayers = useStorage((root) => root.layers);

    const startLayer = liveLayers.get(start.layerId);
    const endLayer = end ? liveLayers.get(end.layerId) : undefined;

    const pathCommand = useMemo(() => {
        if (!end  || !startLayer || !endLayer)
            return "";

        const startPoint = tipToRestrainedPoint(start, startLayer);
        const endPoint = tipToRestrainedPoint(end, endLayer);

        const pathCommand = [`M ${startPoint.x} ${startPoint.y}`]
        for (const p of segments) {
            pathCommand.push(`L ${p.x} ${p.y}`)
        }
        pathCommand.push(`L ${endPoint.x} ${endPoint.y}`);
        return pathCommand.join(" ");
    }, [end, segments, start, startLayer, endLayer])

    if(!startLayer || !endLayer || !segments)
        return;

    return (
        <g>
            {/*segments.map((segment, index) => (
                <circle
                key={index}
                cx={segment.x}
                cy={segment.y}
                r={10}
                fill="red"
                />
            ))*/}
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