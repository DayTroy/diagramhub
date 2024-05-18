"use client";

import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, 
         SelectContent, 
         SelectGroup, 
         SelectItem, 
         SelectLabel, 
         SelectTrigger, 
         SelectValue 
} from "@/components/ui/select";
import { useState } from "react";

/**
 * The props type for {@link NewBoardButton}
 */
export interface NewBoardButtonProps {
    orgId: string;
    disabled?: boolean;
}

/**
 *  Component representing add new board button
 *  @category Component
 */
export const NewBoardButton = ({
    orgId,
    disabled
}: NewBoardButtonProps) => {
    const [boardTitle, setBoardTitle] = useState("");
    const [boardNotation, setBoardNotation] = useState("");
    const router = useRouter();
    const {mutate, pending} = useApiMutation(api.board.create);

    const onClick = () => {
        if (!boardTitle || !boardNotation) return;
        mutate({
            orgId,
            title: boardTitle,
            notation: boardNotation
        })
            .then((id) => {
                toast.success("Диаграмма создана");
                router.push(`/board/${id}`)
            })
            .catch(() => toast.error("Не удалось создать диаграмму"));
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    disabled={pending || disabled}
                    className={cn(
                        "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
                        (pending || disabled) && "opacity-75 hover:bg-blue-600 cursor-not-allowed"
                    )}  
                >
                    <div />
                    <Plus className="h-12 w-12 text-white stroke-1"/>
                    <p className="text-sm text-white font-light">
                        Новая диаграмма
                    </p>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Создание диаграммы</DialogTitle>
                    <DialogDescription>
                        Укажите наименование и тип диаграммы
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Наименование
                        </Label>
                        <Input
                            id="name"
                            value={boardTitle}
                            onChange={(event) => setBoardTitle(event?.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notation" className="text-right">
                            Нотация
                        </Label>
                        <Select onValueChange={(notation) => setBoardNotation(notation)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Выберите нотацию" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Нотации</SelectLabel>
                                <SelectItem value="EPC">EPC</SelectItem>
                                <SelectItem value="BPMN">BPMN</SelectItem>
                                <SelectItem value="Orgchart">Организационная структура</SelectItem>
                                <SelectItem value="default">По умолчанию</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClick}>Cоздать диаграмму</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}