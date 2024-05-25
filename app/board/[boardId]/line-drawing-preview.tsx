import { getLayerAttachmentPoints } from "@/lib/attachment_points";
import { findClosestPoint, findIntersectingLayersWithRectangle, isPointInsideRect, layerOffsetToPoint, sqrDist } from "@/lib/utils";
import { useStorage } from "@/liveblocks.config";
import { Layer, Point } from "@/types/canvas";
import { memo, useMemo } from "react";

/**
 * The props type for {@link DefaultLineComponent}
 */
export interface LineDrawingPreviewProps {
    mouseCanvasPos: Point;
}

export const LineDrawingPreview = ({
    mouseCanvasPos,
}: LineDrawingPreviewProps) => {
    const layerIds = useStorage((root) => root.layerIds);
    const layers = useStorage((root) => root.layers);
    const SHOW_ATCHP_DIST = 20;
    const ATCHP_WIDTH = 8;

    const nearestLayer = useMemo(() => {
        const a = {
            x: mouseCanvasPos.x - SHOW_ATCHP_DIST,
            y: mouseCanvasPos.y - SHOW_ATCHP_DIST,
        };
        const b = {
            x: mouseCanvasPos.x + SHOW_ATCHP_DIST,
            y: mouseCanvasPos.y + SHOW_ATCHP_DIST,
        };

        const layersInRangeIds = findIntersectingLayersWithRectangle(layerIds, layers, a, b);
        if (layersInRangeIds.length == 0)
            return undefined;

        let res = layersInRangeIds[0]
        for (let i = 1; i < layersInRangeIds.length; i++) {
            const layer = layers.get(layersInRangeIds[i]);
            const rLayer = layers.get(res);
            if (!layer || !rLayer)
                continue;

            if (sqrDist(mouseCanvasPos, layer) <= sqrDist(mouseCanvasPos, rLayer)) {
                res = layersInRangeIds[i];
            }
        }
        return layers.get(res);
    }, [mouseCanvasPos, layerIds, layers])

    const attachmentPoints = useMemo(() => {
        if (!nearestLayer)
            return [];

        return getLayerAttachmentPoints(nearestLayer);
    }, [nearestLayer])

    const selectedAttachmentPoint = useMemo(() => {
        if (!nearestLayer || attachmentPoints.length == 0)
            return undefined;

        if (!isPointInsideRect(mouseCanvasPos, nearestLayer))
            return undefined;

        let res = attachmentPoints[0];
        let rp = layerOffsetToPoint(res, nearestLayer);
        for (let i = 1; i < attachmentPoints.length; i++) {
            const p = layerOffsetToPoint(attachmentPoints[i], nearestLayer);
            if(sqrDist(p, mouseCanvasPos) <= sqrDist(rp, mouseCanvasPos)) {
                res = attachmentPoints[i];
                rp = p;
            }
        }
        return res;
    }, [nearestLayer, attachmentPoints, mouseCanvasPos])


    return (
        <g>
            {nearestLayer && attachmentPoints.map((attachmentPoint, index) => (
                <rect
                key={index}
                fill="#5A5A5A"
                opacity={selectedAttachmentPoint && selectedAttachmentPoint.x == attachmentPoint.x && selectedAttachmentPoint.y == attachmentPoint.y ? 1 : 0.6}
                x={nearestLayer.x + attachmentPoint.x - ATCHP_WIDTH/2}
                y={nearestLayer.y + attachmentPoint.y - ATCHP_WIDTH/2}
                width={ATCHP_WIDTH}
                height={ATCHP_WIDTH}
            />
            ))}
        </g>
    )
}