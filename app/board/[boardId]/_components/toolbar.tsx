import { 
    Circle, 
    Grab, 
    MousePointer2, 
    Pencil, 
    Redo2, 
    Spline, 
    Square, 
    StickyNote, 
    Type, 
    Undo2
} from "lucide-react";
import { ToolButton } from "./tool-button";
import { CanvasMode, CanvasState, LayerType, GrabSource } from "@/types/canvas";

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
            <ToolButton 
                label="Соединить"
                icon={Spline}
                onClick={() => setCanvasState({ mode: CanvasMode.Connecting })}
                isActive={ canvasState.mode === CanvasMode.Connecting  }
            />
            {/* <ToolButton 
                label="Карандаш"
                icon={Pencil}
                onClick={() => setCanvasState({
                    mode: CanvasMode.Pencil
                })}
                isActive={
                    canvasState.mode === CanvasMode.Pencil
                }
            /> */}
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