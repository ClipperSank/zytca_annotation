/**
 * useAnnotationDrawing - Manages annotation rendering and redrawing
 * 
 * This hook:
 * - Renders annotations as Paper.js circles
 * - Updates annotation visuals when viewport changes
 * - Handles selection highlighting (yellow for selected, red for others)
 * - Maintains temporary drawing circle during creation
 * 
 * @param viewer - OpenSeadragon viewer instance
 * @param imageToCanvas - Function to convert image to canvas coordinates
 * @returns redrawAnnotations function
 */

import { useRef, useCallback } from 'react';
import paper from 'paper';
import type { Annotation } from '../types/annotation';
import type { ToolMode } from '../types/toolbar';

export interface UseAnnotationDrawingReturn {
  redrawAnnotations: () => void;
  annotationsRef: React.MutableRefObject<Annotation[]>;
  selectedIdRef: React.MutableRefObject<number | null>;
  tempPath: React.MutableRefObject<paper.Path | null>; // 更通用的名稱
}

const useAnnotationDrawing = (
  viewer: React.MutableRefObject<any>,
  imageToCanvas: (point: any) => paper.Point,
  toolMode: ToolMode // 新增參數
): UseAnnotationDrawingReturn => {
  const annotationsRef = useRef<Annotation[]>([]);
  const selectedIdRef = useRef<number | null>(null);
  const tempPath = useRef<paper.Path | null>(null);

  const redrawAnnotations = useCallback(() => {
    if (!paper.project || !viewer.current) return;

    // 清除現有圖形
    paper.project.activeLayer.removeChildren();

    // 重繪所有標註
    annotationsRef.current.forEach((annotation) => {
      let path: paper.Path | null = null;
      const isSelected = annotation.id === selectedIdRef.current;
      const strokeColor = isSelected ? "yellow" : "red";
      const strokeWidth = isSelected ? 4 : 2;

      try {
        switch (annotation.type) {
          case 'circle': {
            const centerCanvas = imageToCanvas(annotation.center);
            const edgeImg = { x: annotation.center.x + annotation.radius, y: annotation.center.y };
            const edgeCanvas = imageToCanvas(edgeImg);
            const radius = centerCanvas.getDistance(edgeCanvas);

            path = new paper.Path.Circle({
              center: centerCanvas,
              radius: radius,
              strokeColor,
              strokeWidth,
              data: { annotationId: annotation.id },
            });
            break;
          }
          case 'line': {
            const startCanvas = imageToCanvas(annotation.startPoint);
            const endCanvas = imageToCanvas(annotation.endPoint);

            path = new paper.Path.Line({
              from: startCanvas,
              to: endCanvas,
              strokeColor,
              strokeWidth,
              data: { annotationId: annotation.id },
            });
            break;
          }
          case 'rectangle': {
            const topLeftCanvas = imageToCanvas(annotation.topLeft);
            // 修正：計算右下角的圖像坐標，然後轉換為畫布坐標
            const bottomRightImg = {
              x: annotation.topLeft.x + annotation.width,
              y: annotation.topLeft.y + annotation.height
            }

            const bottomRightCanvas = imageToCanvas(bottomRightImg)

            const size = new paper.Size(
              Math.abs(bottomRightCanvas.x - topLeftCanvas.x),
              Math.abs(bottomRightCanvas.y - topLeftCanvas.y)
            );

            // 檢查尺寸是否有效
            if (size.width > 0 && size.height > 0) {
              path = new paper.Path.Rectangle({
                point: topLeftCanvas,
                size: size,
                strokeColor,
                strokeWidth,
                data: { annotationId: annotation.id },
              });
            }
            break;
          }
          case 'polygon': {
            if (annotation.points.length > 2) {
              const canvasPoints = annotation.points.map(p => imageToCanvas(p));
              path = new paper.Path({
                segments: canvasPoints,
                closed: true,
                strokeColor,
                strokeWidth,
                data: { annotationId: annotation.id },
              });
            }
            break;
          }
        }

      } catch (error) {
        console.warn("Error drawing annotation", error, annotation)
      }
    });

    // 添加臨時路徑
    if (tempPath.current) {
      try {
        paper.project.activeLayer.addChild(tempPath.current);
      } catch (error) {
        console.warn("Error adding temp path", error)
      }
    }

    try {
      paper.view.update();
    } catch (error) {
      console.warn("Error updating paper view", error)
    }
  }, [imageToCanvas]);

  return {
    redrawAnnotations,
    annotationsRef,
    selectedIdRef,
    tempPath,
  };
};

export default useAnnotationDrawing;