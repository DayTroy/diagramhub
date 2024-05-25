"use client";

import { RoomProvider } from "@/liveblocks.config";
import { ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Layer, Line } from "@/types/canvas";

interface RoomProps {
    children: ReactNode;
    roomId: string;
    fallback: NonNullable<ReactNode> | null;
}

export const Room = ({
    children,
    roomId,
    fallback
}: RoomProps) => {
  return (
    <RoomProvider
     id={roomId} 
     initialPresence={{
      cursor: null,
      selection: []
     }}
     initialStorage={{
      layers: new LiveMap<string, LiveObject<Layer>>(),
      layerIds: new LiveList(),
      lines: new LiveMap<string, LiveObject<Line>>(),
      lineIds: new LiveList<string>(),

     }}
    >
        <ClientSideSuspense fallback={fallback}>
            {() => children}
        </ClientSideSuspense>
    </RoomProvider>
  )
}
