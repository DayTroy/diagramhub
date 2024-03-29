"use client";

import { FormEvent, FormEventHandler, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogClose,
    DialogFooter,
    DialogTitle
} from "@/components/ui/dialog";
import { useRenameModal } from "@/store/use-rename-modal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export const RenameModal = () => {

    const {mutate, pending} = useApiMutation(api.board.update);

    const {
        isOpen,
        onClose,
        initialValues
    } = useRenameModal();

    const [title, setTitle] = useState(initialValues.title)

    useEffect(() => {
        setTitle(initialValues.title);
    }, [initialValues.title])

    const onSubmit: FormEventHandler<HTMLFormElement> = (
        e
    ) => {
        e.preventDefault();

        mutate({
            id: initialValues.id,
            title
        })
            .then(() => {
                toast.success("Диаграмма переименована");
                onClose();
            })
            .catch(() => toast.error("Не удалось переименовать"))
    }

    const onClick = (e: any): void => onSubmit(e);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Переименовать диаграмму
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Введите новое имя для диаграммы
                </DialogDescription>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Input 
                        disabled={pending}
                        required
                        maxLength={60}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Имя диаграммы"
                    />
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                        >
                            Отменить
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={onClick}
                        disabled={pending} type="submit"
                    >
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}