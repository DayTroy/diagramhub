import { 
    Circle, 
    MousePointer2, 
    Pencil, 
    Redo2, 
    Square, 
    StickyNote, 
    Type, 
    Undo2
} from "lucide-react";
import { ToolButton } from "./tool-button";


export const Toolbar = () => {
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
        <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md">
            <ToolButton 
                label="Выбрать"
                icon={MousePointer2}
                onClick={() => {}}
                isActive={false}
            />
            <ToolButton 
                label="Текст"
                icon={Type}
                onClick={() => {}}
                isActive={false}
            />
            <ToolButton 
                label="Записка"
                icon={StickyNote}
                onClick={() => {}}
                isActive={false}
            />
            <ToolButton 
                label="Прямоугольник"
                icon={Square}
                onClick={() => {}}
                isActive={false}
            />
            <ToolButton 
                label="Эллипс"
                icon={Circle}
                onClick={() => {}}
                isActive={false}
            />
            <ToolButton 
                label="Карандаш"
                icon={Pencil}
                onClick={() => {}}
                isActive={false}
            />
        </div>
        <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
            <ToolButton 
                label="Отменить"
                icon={Undo2}
                onClick={() => {}}
                isDisabled={true}
            />
            <ToolButton 
                label="Повторить"
                icon={Redo2}
                onClick={() => {}}
                isDisabled={true}
            />
        </div>
    </div>
  )
}

export const ToolbarSkeleton = () => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md" />
    )
}