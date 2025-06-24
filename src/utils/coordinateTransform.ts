import type { Point } from '../types';

export function canvasToImage(point: any, viewer: any): Point {
  if (!viewer) return { x: 0, y: 0 };
  const osdPoint = new (window as any).OpenSeadragon.Point(point.x, point.y);
  const viewportPoint = viewer.viewport.pointFromPixel(osdPoint);
  const imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
  return { x: imagePoint.x, y: imagePoint.y };
}

export function imageToCanvas(point: Point, viewer: any, paper: any): any {
  if (!viewer || !paper) return null;
  const viewportPoint = viewer.viewport.imageToViewportCoordinates(point.x, point.y);
  const canvasPixel = viewer.viewport.pixelFromPoint(viewportPoint);
  return new paper.Point(canvasPixel.x, canvasPixel.y);
}