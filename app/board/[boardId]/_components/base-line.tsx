import { colorToCss } from "@/lib/utils";
import { useStorage } from "@/liveblocks.config";
import { BasicLine } from "@/types/canvas";

/**
 * The props type for {@link BaseLineComponent}
 */
export interface BaseLineProps {
    id: string;
    line: BasicLine;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

/**
 *  Component representing line canvas object
 *  @category Component
 */
export const BaseLineComponent = ({
    id,
    line,
    onPointerDown,
    selectionColor

}: BaseLineProps) => {
    const { offsetStart, offsetEnd, startLayerId, endLayerId } = line;
    const liveLayers = useStorage((root) => root.layers);

    if (!offsetEnd || !endLayerId) return null;

    const startLayer = liveLayers.get(startLayerId);
    const endLayer = liveLayers.get(endLayerId);

    if (!startLayer || !endLayer) return null;

    return (
        <g>
            <line
            x1={startLayer.x + (offsetStart.x * startLayer.width)}
            y1={startLayer.y + (offsetStart.y * startLayer.height)}
            x2={endLayer.x + (offsetEnd.x * endLayer.width)}
            y2={endLayer.y + (offsetEnd.y * endLayer.height)}
            stroke="#000000"
            stroke-width="2"
            />
            {/* Wider invisible line to detect clicks over a larger area. */}
            <line
            x1={startLayer.x + (offsetStart.x * startLayer.width)}
            y1={startLayer.y + (offsetStart.y * startLayer.height)}
            x2={endLayer.x + (offsetEnd.x * endLayer.width)}
            y2={endLayer.y + (offsetEnd.y * endLayer.height)}
            opacity="0"
            stroke="#000000"
            stroke-width="10"
            onPointerDown={(e) => onPointerDown(e, id)}
            />
        </g>
    )
}