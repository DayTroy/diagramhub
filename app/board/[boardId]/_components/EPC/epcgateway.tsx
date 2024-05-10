import { colorToCss } from "@/lib/utils";
import { EPCGatewayLayer } from "@/types/canvas";

/**
 * The props type for {@link Rectangle}
 */
export interface EPCGatewayProps {
    id: string;
    layer: EPCGatewayLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

/**
 *  Component representing rectangle canvas object
 *  @category Component
 */
export const EPCGateway = ({
    id,
    layer,
    onPointerDown,
    selectionColor

}: EPCGatewayProps) => {
    const { x, y, width, height, fill } = layer;

    return (
        <rect 
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px) rotate(45deg)`,
            }}
            x={0}
            y={0}
            width={width}
            height={width}
            strokeWidth={1}
            fill={"#acacac"}
            stroke={selectionColor || "transparent"}
        />
    )
}