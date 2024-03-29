"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { ConfirmModal } from "./confirm-modal";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionsProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    id: string;
    title: string;
}

export const Actions =({
    children,
    side,
    sideOffset,
    id,
    title
}: ActionsProps) => {

    const { onOpen } = useRenameModal();
    const {mutate, pending} = useApiMutation(api.board.remove);

    const onCopyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/board/${id}`
        )
            .then(() => toast.success("Ссылка скопирована!"))
            .catch(() => toast.error("Не удалось скопировать!"))
    }

    const onDelete = () => {
        mutate({ id })
            .then(() => toast.success("Диаграмма удалена"))
            .catch(() => toast.error("Не удалось удалить диаграмму"))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                side={side}
                sideOffset={sideOffset}
                className="w-60"
            >
                <DropdownMenuItem
                    onClick={onCopyLink}
                    className="p-3 cursor-pointer"
                >
                    <Link2 className="h-4 w-4 mr-2"/>
                    Скопировать ссылку
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onOpen(id, title)}
                    className="p-3 cursor-pointer"
                >
                    <Pencil className="h-4 w-4 mr-2"/>
                    Переименовать
                </DropdownMenuItem>
                <ConfirmModal
                    header="Удалить диаграмму?"
                    description="Это удалит вашу диаграмму и все ее содержимое."
                    disabled={pending}
                    onConfirm={onDelete}
                >
                    <Button
                        variant="ghost"
                        className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
                    >
                        <Trash2 className="h-4 w-4 mr-2"/>
                        Удалить диаграмму
                    </Button>
                </ConfirmModal>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}