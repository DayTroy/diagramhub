import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The props type for {@link ZoomBar}
 */
export interface ZoomBarProps {
    cameraScale: number
    zoomIn: () => void;
    zoomOut: () => void;
}

/**
 *  Component representing canvas zoom bar
 *  @category Component
 */
export const ZoomBar = ({
    cameraScale,
    zoomIn,
    zoomOut,
}: ZoomBarProps) => {
    return (
        <div className="absolute bottom-2 right-2 h-12 bg-white rounded-md p-1.5 flex gap-x-1 flex-row items-center shadow-md">
        <Button
                onClick={zoomIn}
                size="icon"
                variant="board"
            >
                <Plus />
            </Button>
            <p className="font-normal text-base h-10 w-10 items-center justify-center inline-flex select-none">{Math.round(cameraScale * 100)}%</p>
            <Button
                onClick={zoomOut}
                size="icon"
                variant="board"
            >
                <Minus />
            </Button>
        </div>
    )
}

/**
 *  Component representing canvas zoom bar skeleton
 *  @category Component
 */
export const ZoomBarSkeleton = () => {
    return (
        <div className="absolute bottom-2 right-2 h-12 w-[140px] bg-white rounded-md p-1.5 flex gap-x-1 flex-row items-center shadow-md"></div>
    )
}