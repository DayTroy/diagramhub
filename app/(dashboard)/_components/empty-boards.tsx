"use client";

import Image from "next/image";

import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const EmptyBoards = () => {
  const router = useRouter();
  const { organization } = useOrganization();
  const { mutate, pending } = useApiMutation(api.board.create);

  const onClick = () => {
    if (!organization) return;
    mutate({
      orgId: organization.id,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Диаграмма успешно создана");
        router.push(`/board/${id}`)
      })
      .catch(() => toast.error("Не удалось создать диаграмму"));
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image src="/note.svg" height={110} width={110} alt="Empty" />
      <h2 className="text-2xl font-semibold mt-6">
        Создайте свою первую диаграмму!
      </h2>
      <p className="text-muted-foreground textg-sm mt-2">
        Начните с создания диаграммы для вашей организации.
      </p>
      <div className="mt-6">
        <Button disabled={pending} onClick={onClick} size="lg">
          Создать диаграмму
        </Button>
      </div>
    </div>
  );
};
