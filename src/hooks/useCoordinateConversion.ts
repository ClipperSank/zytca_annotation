import { useCallback, type RefObject } from "react";
import OpenSeadragon from "openseadragon";
import paper from "paper";
import type { Point } from "../types";


/**
 * useCoordinateConversion - Provides coordinate conversion functions
 * 
 * This hook:
 * - Converts canvas coordinates to image coordinates
 * - Converts image coordinates to canvas coordinates
 * - Essential for maintaining annotation positions across zoom/pan
 * 
 * @param viewer - OpenSeadragon viewer instance reference
 * @returns conversion functions
 */

const useCoordinateConversion = (
  viewer: RefObject<OpenSeadragon.Viewer | null>
) => {
  const canvasToImage = useCallback((point: paper.Point): Point => {
    if (!viewer.current) return { x: 0, y: 0 };
    const osdPoint = new OpenSeadragon.Point(point.x, point.y);
    const viewportPoint = viewer.current.viewport.pointFromPixel(osdPoint);
    const imagePoint =
      viewer.current.viewport.viewportToImageCoordinates(viewportPoint);
    return { x: imagePoint.x, y: imagePoint.y };
  }, [viewer]);

  const imageToCanvas = useCallback((point: Point): paper.Point => {
    if (!viewer.current) return new paper.Point(0, 0);
    const viewportPoint = viewer.current.viewport.imageToViewportCoordinates(
      point.x,
      point.y
    );
    const canvasPixel = viewer.current.viewport.pixelFromPoint(viewportPoint);
    return new paper.Point(canvasPixel.x, canvasPixel.y);
  }, [viewer]);

  return { canvasToImage, imageToCanvas };
};

export default useCoordinateConversion;
