import { Raleway } from 'next/font/google';
import ContentEditable, {ContentEditableEvent} from 'react-contenteditable';

import { cn, colorToCss, getContrastingTextColor } from '@/lib/utils';
import { Layer } from '@/types/canvas';
import { useMutation } from '@/liveblocks.config';

const font = Raleway({
    subsets: ["cyrillic"],
    weight: ["500"],
});

const calculateFontSize = (width: number, height: number) => {
    const maxFontSize = 96;
    const scaleFactor = 0.15;
    const fontSizeBasedOnHeight = height * scaleFactor;
    const fontSizeBasedOnWidth = width * scaleFactor;

    return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize);
}

/**
 * The props type for {@link Note}
 */
export interface EPCEventProps {
    id: string;
    layer: Layer;
    onPointerDown: (e:React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

/**
 *  Component representing EPCFunction canvas object
 *  @category Component
 */
export const EPCFunction = ({
    layer,
    onPointerDown,
    id,
    selectionColor
}: EPCEventProps) => {
    const { x, y, width, height, fill, value } = layer;

    const updateValue = useMutation((
        { storage },
        newValue: string
    ) => {
        const liveLayers = storage.get("layers");
        liveLayers.get(id)?.set("value", newValue);
    }, [])

    const handleContentChange = (e: ContentEditableEvent) => {
        if (e.target.value !== "") updateValue(e.target.value);
    }

    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: selectionColor ? `1px solid ${selectionColor}` : 'none',
                backgroundColor: "#92ff20",
            }}
            className='shadow-md drop-shadow-xl rounded-xl'
        >
            <ContentEditable
                html={value || "Что сделал?"}
                onChange={handleContentChange}
                className={cn(
                    "h-full w-full flex items-center justify-center text-center outline-none",
                    font.className
                )}
                style={{
                    fontSize: calculateFontSize(width, height),
                    color: "#000",
                }}
            />
        </foreignObject>
    );
};