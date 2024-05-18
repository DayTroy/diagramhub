"use client"

import { 
    CalendarCheck,
    CalendarPlus2,
    Circle, 
    Diamond, 
    Grab, 
    MousePointer2, 
    PackageSearch, 
    Redo2, 
    Spline, 
    Square, 
    StickyNote, 
    Type, 
    Undo2
} from "lucide-react";
import { ToolButton } from "./tool-button";
import { CanvasMode, CanvasState, LayerType, GrabSource, LineType } from "@/types/canvas";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * The props type for {@link Toolbar}
 */
export interface ToolbarProps {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

/**
 *  Component representing canvas toolbar
 *  @category Component
 */
export const Toolbar = ({
    canvasState,
    setCanvasState,
    undo,
    redo,
    canUndo,
    canRedo
}: ToolbarProps) => {

    const params = useParams();
    const data = useQuery(api.board.get, {
        id: params.boardId as Id<"boards">,
    });
    console.log()

  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
        <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md">
            <ToolButton 
                label="Выбрать"
                icon={MousePointer2}
                onClick={() => setCanvasState({mode: CanvasMode.None})}
                isActive={
                    canvasState.mode === CanvasMode.None || 
                    canvasState.mode === CanvasMode.Translating ||
                    canvasState.mode === CanvasMode.Pressing || 
                    canvasState.mode === CanvasMode.Resizing
                }
            />
            <ToolButton 
                label="Сдвинуть"
                icon={Grab}
                onClick={() => setCanvasState({mode: CanvasMode.Grab, source: GrabSource.Toolbar})}
                isActive={
                    canvasState.mode === CanvasMode.Grab
                }
            />
            {data?.notation === "default" && (
                <>
                    <ToolButton 
                        label="Текст"
                        icon={Type}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Text,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.Text
                        }
                    />  
                    <ToolButton 
                        label="Записка"
                        icon={StickyNote}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Note,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.Note
                        }
                    />
                    <ToolButton 
                        label="Прямоугольник"
                        icon={Square}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Rectangle,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.Rectangle
                        }
                    />
                    <ToolButton 
                        label="Эллипс"
                        icon={Circle}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Ellipse,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.Ellipse
                        }
                    />
                </>
            )}
            
            {data?.notation === "EPC" && (
                <>
                    <ToolButton 
                        label="Событие"
                        icon={CalendarPlus2}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.EPCEvent,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.EPCEvent
                        }
                    />
                    <ToolButton 
                        label="Функция"
                        icon={CalendarCheck}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.EPCFunction,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.EPCFunction
                        }
                    />
                    <ToolButton 
                        label="Процесс"
                        icon={PackageSearch}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.ProcessInterface,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.ProcessInterface
                        }
                    />
                    <ToolButton 
                        label="Шлюз"
                        icon={Diamond}
                        onClick={() => setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.EPCGateway,
                        })}
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.EPCGateway
                        }
                    />
                </>
            )} 
        </div>
        <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
            <ToolButton 
                label="Отменить"
                icon={Undo2}
                onClick={undo}
                isDisabled={!canUndo}
            />
            <ToolButton 
                label="Повторить"
                icon={Redo2}
                onClick={redo}
                isDisabled={!canRedo}
            />
        </div>
    </div>
  )
}

/**
 *  Component representing canvas toolbar skeleton
 *  @category Component
 */
export const ToolbarSkeleton = () => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md" />
    )
}