import { colorToCss } from "@/lib/utils";
import { useStorage } from "@/liveblocks.config";
import { BaseLine } from "@/types/canvas";

/**
 * The props type for {@link BaseLineComponent}
 */
export interface BaseLineProps {
    id: string;
    line: BaseLine;
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

    if (!offsetEnd || !endLayerId) return null;
    

    const liveLayers = useStorage((root) => root.layers);
    const startLayer = liveLayers.get(startLayerId);
    const endLayer = liveLayers.get(endLayerId);

    if (!startLayer || !endLayer) return null;

    return (
        <line 
            x1={startLayer.x + offsetStart.x}
            y1={startLayer.y + offsetStart.y}
            x2={endLayer.x + offsetEnd.x}
            y2={endLayer.y + offsetEnd.y}
            stroke="#000000"
        />
    )
}