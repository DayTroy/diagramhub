import { colorToCss } from "@/lib/utils";
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
    const { fill } = line;

    return (
        null
        // <rect 
        //     className="drop-shadow-md"
        //     onPointerDown={(e) => onPointerDown(e, id)}
        //     style={{
        //         transform: `translate(${x}px, ${y}px)`,
        //     }}
        //     x={0}
        //     y={0}
        //     width={width}
        //     height={height}
        //     strokeWidth={1}
        //     fill={fill ? colorToCss(fill) : "#000"}
        //     stroke={selectionColor || "transparent"}
        // />
    )
}