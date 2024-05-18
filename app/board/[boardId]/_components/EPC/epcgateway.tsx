import { colorToCss } from "@/lib/utils";
import { EPCGatewayLayer } from "@/types/canvas";

/**
 * The props type for {@link EPCGateway}
 */
export interface EPCGatewayProps {
  id: string;
  layer: EPCGatewayLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

/**
 *  Component representing epcgateway canvas object
 *  @category Component
 */
export const EPCGateway = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: EPCGatewayProps) => {
  const { x, y, width, height, fill } = layer;
  let updatedWidth = width / 2;
  const halfWidth = updatedWidth / 2;

  return (
    <>
      <rect
        x={0}
        y={0}
        width={updatedWidth}
        height={updatedWidth}
        strokeWidth={1}
        fill="#acacac"
        stroke={selectionColor || "transparent"}
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ transform: `translate(${x}px, ${y}px) rotate(45deg)` }}
        rx={5}
        ry={5}
      />

    {/* (Circle) */}
    {/* <circle
      cx={halfWidth} 
      cy={halfWidth} 
      r={10} 
      stroke="#fff" 
      strokeWidth="3"  
      fill="none" 
      style={{ transform: `translate(${x}px, ${y}px) rotate(45deg)` }}
    /> */}

      {/* (KREST) */}
      <path
        d={`M${halfWidth},${halfWidth - 20} L${halfWidth},${halfWidth + 20}`}
        stroke="#fff" // Цвет вертикальной палки
        strokeWidth="2"
        style={{ transform: `translate(${x}px, ${y}px) rotate(45deg)` }}
        strokeLinecap="round" // Скругление концов линии
      />
      <path
        d={`M${halfWidth - 20},${halfWidth} L${halfWidth + 20},${halfWidth}`}
        stroke="#fff" // Цвет горизонтальной палки
        strokeWidth="2"
        style={{ transform: `translate(${x}px, ${y}px) rotate(45deg)` }}
        strokeLinecap="round" // Скругление концов линии
      />

        {/* (PLUS) */}
        {/* <path
            d={`M${halfWidth - 15},${halfWidth} L${halfWidth + 15},${halfWidth}`}
            stroke="#fff" // Цвет плюса
            strokeWidth="2"
            style={{ transform: `translate(${x + width / 4}px, ${y + height / 8}px) rotate(90deg)` }}
            strokeLinecap="round" // Скругление концов линии
            />
        <path
            d={`M${halfWidth},${halfWidth - 15} L${halfWidth},${halfWidth + 15}`}
            stroke="#fff" // Цвет плюса
            strokeWidth="2"
            style={{ transform: `translate(${x + width / 4}px, ${y + height / 8}px) rotate(90deg)` }}
            strokeLinecap="round" // Скругление концов линии
        /> */}
    </>
  );
};
