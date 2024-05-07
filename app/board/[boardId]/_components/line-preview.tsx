"use client";

import { useStorage } from "@/liveblocks.config";
import { memo } from "react";
import { LineType } from "@/types/canvas";
import { BaseLineComponent } from "./base-line";

interface LinePreviewProps {
    id: string;
    onLinePointerDown: (e: React.PointerEvent, lineId: string) => void; //TODO: Пофиксить типизацию
    selectionColor?: string;
}

export const LinePreview = memo(({
    id,
    onLinePointerDown,
    selectionColor
}: LinePreviewProps) => {

    const line = useStorage((root) => root.lines.get(id));

    if (!line) {
        return null
    }

    switch(line.type) {
        case LineType.BaseLine:
            return (
                <BaseLineComponent
                    id={id}
                    line={line}
                    onPointerDown={onLinePointerDown}
                    selectionColor={selectionColor}
                />
            );
        default:
            console.warn("Unknown line type");
            return null
    }
});

LinePreview.displayName = "LinePreview";