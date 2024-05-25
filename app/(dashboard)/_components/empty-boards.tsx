"use client";

import Image from "next/image";

import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

/**
 *  Component representing empty organization`s boards list
 *  @category Component
 */
export const EmptyBoards = () => {
  const router = useRouter();
  const { organization } = useOrganization();
  const { mutate, pending } = useApiMutation(api.board.create);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardNotation, setBoardNotation] = useState("");

  const onClick = () => {
    if (!organization || !boardTitle || !boardNotation) return;
    mutate({
      orgId: organization.id,
      title: boardTitle,
      notation: boardNotation
    })
      .then((id) => {
        toast.success("Диаграмма успешно создана");
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Не удалось создать диаграмму"));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="h-full flex flex-col items-center justify-center">
          <Image src="/note.svg" height={110} width={110} alt="Empty" />
          <h2 className="text-2xl font-semibold mt-6">
            Создайте свою первую диаграмму!
          </h2>
          <p className="text-muted-foreground textg-sm mt-2">
            Начните с создания диаграммы для вашей организации.
          </p>
          <div className="mt-6">
            <Button disabled={pending} size="lg">
              Создать диаграмму
            </Button>
          </div>
        </div>
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
                  <SelectItem value="Orgchart">
                    Организационная структура
                  </SelectItem>
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
  );
};
