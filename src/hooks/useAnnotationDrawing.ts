// /**
//  * useAnnotationDrawing - Manages annotation rendering and redrawing
//  * 
//  * This hook:
//  * - Renders annotations as Paper.js circles
//  * - Updates annotation visuals when viewport changes
//  * - Handles selection highlighting (yellow for selected, red for others)
//  * - Maintains temporary drawing circle during creation
//  * 
//  * @param viewer - OpenSeadragon viewer instance
//  * @param imageToCanvas - Function to convert image to canvas coordinates
//  * @returns redrawAnnotations function
//  */

import { useRef, useCallback } from 'react';
import paper from 'paper';
import type { Annotation, ToolMode } from '../types';

export interface UseAnnotationDrawingReturn {
  redrawAnnotations: () => void;
  annotationsRef: React.MutableRefObject<Annotation[]>;
  selectedIdRef: React.MutableRefObject<number | null>;
  tempPath: React.MutableRefObject<paper.Path | null>;
}

const useAnnotationDrawing = (
  viewer: React.MutableRefObject<any>,
  imageToCanvas: (point: { x: number; y: number }) => paper.Point,
  toolMode: ToolMode
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
          // 正確計算矩形在畫布上的大小
          const bottomRightImg = {
            x: annotation.topLeft.x + annotation.width,
            y: annotation.topLeft.y + annotation.height
          };
          const bottomRightCanvas = imageToCanvas(bottomRightImg);
          const width = Math.abs(bottomRightCanvas.x - topLeftCanvas.x);
          const height = Math.abs(bottomRightCanvas.y - topLeftCanvas.y);
          
          path = new paper.Path.Rectangle({
            point: topLeftCanvas,
            size: new paper.Size(width, height),
            strokeColor,
            strokeWidth,
            data: { annotationId: annotation.id },
          });
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
    });

    // 添加臨時路徑
    if (tempPath.current) {
      paper.project.activeLayer.addChild(tempPath.current);
    }

    paper.view.update();
  }, [imageToCanvas]);

  return {
    redrawAnnotations,
    annotationsRef,
    selectedIdRef,
    tempPath,
  };
};

export default useAnnotationDrawing;