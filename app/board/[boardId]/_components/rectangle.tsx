import { colorToCss } from "@/lib/utils";
import { Layer } from "@/types/canvas";

/**
 * The props type for {@link Rectangle}
 */
export interface RectangleProps {
    id: string;
    layer: Layer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

/**
 *  Component representing rectangle canvas object
 *  @category Component
 */
export const Rectangle = ({
    id,
    layer,
    onPointerDown,
    selectionColor

}: RectangleProps) => {
    const { x, y, width, height, fill } = layer;

    return (
        <rect
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
            x={0}
            y={0}
            width={width}
            height={height}
            strokeWidth={1}
            fill={fill ? colorToCss(fill) : "#000"}
            stroke={selectionColor || "transparent"}
        />
    )
}