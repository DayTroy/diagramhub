import Canvas from "./_components/canvas";
import { Room } from "@/components/room";
import Loading from "./_components/loading";

/**
 * The props type for {@link BoardIdPage}
 */
export interface BoardIdPageProps {
    params: {
        boardId: string;
    };
};

/**
 *  Component representing board
 *  @category Component
 */
const BoardIdPage = ({
    params,
}: BoardIdPageProps) => {
  return (
    <Room roomId={params.boardId} fallback={<Loading />}>
        <Canvas boardId={params.boardId}/>
    </Room>
  )
}

export default BoardIdPage;