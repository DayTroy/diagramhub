import Image from "next/image"
import { CreateOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog";

/**
 *  Component representing the dialog displayed if the user has no organizations
 *  @category Component
 */
export const EmptyOrg = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image src="/elements.svg" alt="Empty" height={200} width={200}/>
            <h2 className="text-2xl font-semibold mt-6">
                Добро пожаловать
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
                Создайте организацию, чтобы начать работу
            </p>
            <div className="mt-6">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg">
                            Создайте организацию
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-transparent border-none max-w-[480px]">
                        <CreateOrganization />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}