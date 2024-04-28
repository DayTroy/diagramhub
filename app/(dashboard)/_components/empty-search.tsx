import Image from "next/image";

/**
 *  Component representing empty organization`s boards list after search
 *  @category Component
 */
export const EmptySearch = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image 
                src="/empty-search.svg"
                height={140}
                width={140}
                alt="Empty"
            />
            <h2 className="text-2xl font-semibold mt-6">
                Результаты не найдены!
            </h2>
            <p className="text-muted-foreground textg-sm mt-2">
                Попробуйте поискать что-нибудь другое
            </p>
        </div>
    )
}