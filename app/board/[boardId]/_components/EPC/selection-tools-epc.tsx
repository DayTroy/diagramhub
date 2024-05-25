"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera, Color } from "@/types/canvas";
import { memo } from "react";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";
import { ColorPicker } from "../color-picker";
import { GatewayPicker } from "./gateway-picker";

/**
 * The props type for {@link SelectionTools}
 */
export interface SelectionToolsEPCProps {
    camera: Camera;
    setLastUsedColor: (color: Color) => void;
};

/**
 *  Component representing selection tools for selected object on canvas
 *  @category Component
 */
export const SelectionToolsEPC = memo(({
    camera,
    setLastUsedColor
}:SelectionToolsEPCProps) => {

    const selection = useSelf((me) => me.presence.selection);

    const setLogicalType = useMutation((
        { storage },
        logicalType: string,
    ) => {
        const liveLayers = storage.get("layers");

        selection.forEach((id) => {
            liveLayers.get(id)?.set("logicalType", logicalType);
        })
    }, [selection ]);

    const deleteLayers = useDeleteLayers();

    const selectionBounds = useSelectionBounds();

    if (!selectionBounds) {
        return null;
    }

    const x = (selectionBounds.width / 2 + selectionBounds.x + camera.x) * camera.scale;
    const y = (selectionBounds.y + camera.y) * camera.scale;

    return (
        <div
            className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
            style={{
                transform: `translate(
                    calc(${x}px - 50%),
                    calc(${y - 16}px - 100%)
                )`
            }}
        >
            <GatewayPicker
                onChange={setLogicalType}
            />
            <div className="flex items-center pl-2 ml-2">
                <Hint label="Удалить">
                    <Button
                        variant="board"
                        size="icon"
                        onClick={deleteLayers}
                    >
                        <Trash2 />
                    </Button>
                </Hint>

            </div>
        </div>
    )
})

SelectionToolsEPC.displayName = "SelectionToolsSelectionToolsEPC";