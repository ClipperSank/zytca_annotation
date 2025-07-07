import { useEffect, useRef } from 'react';
import paper from 'paper';
import type { Annotation } from '../types/annotation';
import type { ToolMode } from '../types/toolbar';

interface UseAnnotationInteractionsProps {
  toolRef: React.MutableRefObject<paper.Tool | null>;
  annotationMode: boolean;
  annotations: Annotation[];
  selectedId: number | null;
  toolMode: ToolMode;
  canvasToImage: (point: paper.Point) => any;
  imageToCanvas: (point: any) => paper.Point;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onSelectedIdChange: (id: number | null) => void;
  redrawAnnotations: () => void;
  tempPath: React.MutableRefObject<paper.Path | null>;
}

const useAnnotationInteractions = ({
  toolRef,
  annotationMode,
  annotations,
  selectedId,
  toolMode,
  canvasToImage,
  imageToCanvas,
  onAnnotationsChange,
  onSelectedIdChange,
  redrawAnnotations,
  tempPath,
}: UseAnnotationInteractionsProps) => {
  // 繪製狀態
  const drawingState = useRef({
    isDrawing: false,
    startPoint: null as paper.Point | null,
    startPointImage: null as any,
    polygonPoints: [] as any[],
    annotationCounter: 0,
  });

  // 移動狀態
  const moveState = useRef({
    isMoving: false,
    startPointImage: null as any,
    originalPosition: null as any,
  });

  // 修復：多邊形雙擊檢測
  const doubleClickState = useRef({
    lastClickTime: 0,
    clickCount: 0,
    doubleClickThreshold: 300, // 毫秒
  });

  useEffect(() => {
    if (!toolRef.current) return;

    toolRef.current.onMouseDown = (event: paper.ToolEvent) => {
      if (!annotationMode) return;

      // 修復：多邊形雙擊檢測邏輯
      const now = Date.now();
      const timeSinceLastClick = now - doubleClickState.current.lastClickTime;

      if (timeSinceLastClick < doubleClickState.current.doubleClickThreshold) {
        doubleClickState.current.clickCount++;
      } else {
        doubleClickState.current.clickCount = 1;
      }
      doubleClickState.current.lastClickTime = now;

      // 處理多邊形雙擊
      if (doubleClickState.current.clickCount >= 2 &&
        toolMode === 'polygon' &&
        drawingState.current.polygonPoints.length > 2) {
        finishPolygon();
        return;
      }

      // 檢查是否點擊到現有標註
      const hitResult = paper.project.hitTest(event.point, {
        fill: false,
        stroke: true,
        segments: false,
        tolerance: 5,
      });

      if (hitResult?.item?.data?.annotationId !== undefined) {
        const clickedId = hitResult.item.data.annotationId;
        onSelectedIdChange(clickedId);

        // 如果是橡皮擦模式，直接刪除
        if (toolMode === 'eraser') {
          onAnnotationsChange(annotations.filter(a => a.id !== clickedId));
          if (selectedId === clickedId) {
            onSelectedIdChange(null);
          }
          return;
        }

        // 進入移動模式
        const annotation = annotations.find(a => a.id === clickedId);
        if (annotation && selectedId === clickedId) {
          moveState.current.isMoving = true;
          moveState.current.startPointImage = canvasToImage(event.point);
          moveState.current.originalPosition = getAnnotationPosition(annotation);
        }
        return;
      }

      // 橡皮擦模式下不創建新標註
      if (toolMode === 'eraser') return;

      // 開始創建新標註
      startNewAnnotation(event.point);
    };

    toolRef.current.onMouseDrag = (event: paper.ToolEvent) => {
      if (!annotationMode) return;

      if (moveState.current.isMoving) {
        handleAnnotationMove(event.point);
        return;
      }

      if (drawingState.current.isDrawing) {
        updateTempAnnotation(event.point);
      }
    };

    toolRef.current.onMouseUp = (event: paper.ToolEvent) => {
      if (moveState.current.isMoving) {
        moveState.current.isMoving = false;
        moveState.current.startPointImage = null;
        moveState.current.originalPosition = null;
        return;
      }

      if (drawingState.current.isDrawing) {
        finishAnnotation(event.point);
      }
    };
  }, [
    annotationMode, annotations, selectedId, toolMode,
    canvasToImage, imageToCanvas, onAnnotationsChange, onSelectedIdChange
  ]);

  // 輔助函數
  const getAnnotationPosition = (annotation: Annotation) => {
    switch (annotation.type) {
      case 'circle':
        return annotation.center;
      case 'line':
        return annotation.startPoint;
      case 'rectangle':
        return annotation.topLeft;
      case 'polygon':
        return annotation.points[0];
      default:
        return { x: 0, y: 0 };
    }
  };

  const startNewAnnotation = (point: paper.Point) => {
    drawingState.current.isDrawing = true;
    drawingState.current.startPoint = point;
    drawingState.current.startPointImage = canvasToImage(point);

    if (toolMode === 'polygon') {
      drawingState.current.polygonPoints = [canvasToImage(point)];
    }

    createTempPath(point);
  };

  const createTempPath = (point: paper.Point) => {
    if (tempPath.current) {
      tempPath.current.remove();
    }

    switch (toolMode) {
      case 'line':
        tempPath.current = new paper.Path.Line({
          from: point,
          to: point,
          strokeColor: 'red',
          strokeWidth: 2,
          dashArray: [6, 6],
        });
        break;
      case 'circle':
        tempPath.current = new paper.Path.Circle({
          center: point,
          radius: 1,
          strokeColor: 'red',
          strokeWidth: 2,
          dashArray: [6, 6],
        });
        break;
      case 'rectangle':
        tempPath.current = new paper.Path.Rectangle({
          point: point,
          size: new paper.Size(1, 1),
          strokeColor: 'red',
          strokeWidth: 2,
          dashArray: [6, 6],
        });
        break;
      case 'polygon':
        tempPath.current = new paper.Path({
          segments: [point],
          strokeColor: 'red',
          strokeWidth: 2,
          dashArray: [6, 6],
        });
        break;
    }
  };

  const updateTempAnnotation = (point: paper.Point) => {
    if (!tempPath.current || !drawingState.current.startPoint) return;

    switch (toolMode) {
      case 'line':
        tempPath.current.remove();
        tempPath.current = new paper.Path.Line({
          from: drawingState.current.startPoint,
          to: point,
          strokeColor: 'red',
          strokeWidth: 2,
          dashArray: [6, 6],
        });
        break;
      case 'circle':
        const radius = drawingState.current.startPoint.getDistance(point);
        tempPath.current.remove();
        tempPath.current = new paper.Path.Circle({
          center: drawingState.current.startPoint,
          radius: radius,
          strokeColor: 'red',
          strokeWidth: 2,
          dashArray: [6, 6],
        });
        break;
      case 'rectangle':
        const topLeft = new paper.Point(
          Math.min(drawingState.current.startPoint.x, point.x),
          Math.min(drawingState.current.startPoint.y, point.y)
        );
        const size = new paper.Size(
          Math.abs(point.x - drawingState.current.startPoint.x),
          Math.abs(point.y - drawingState.current.startPoint.y)
        );
        tempPath.current.remove();
        tempPath.current = new paper.Path.Rectangle({
          point: topLeft,
          size: size,
          strokeColor: 'red',
          strokeWidth: 2,
          dashArray: [6, 6],
        });
        break;
    }
  };

  const finishAnnotation = (point: paper.Point) => {
    if (!drawingState.current.startPoint || !drawingState.current.startPointImage) return;

    let newAnnotation: Annotation | null = null;
    const id = drawingState.current.annotationCounter++;

    switch (toolMode) {
      case 'line':
        newAnnotation = {
          id,
          type: 'line',
          startPoint: drawingState.current.startPointImage,
          endPoint: canvasToImage(point),
        };
        break;
      case 'circle':
        const radiusCanvas = drawingState.current.startPoint.getDistance(point);
        const edgePoint = new paper.Point(
          drawingState.current.startPoint.x + radiusCanvas,
          drawingState.current.startPoint.y
        );
        const edgeImage = canvasToImage(edgePoint);
        const radiusImage = Math.sqrt(
          Math.pow(drawingState.current.startPointImage.x - edgeImage.x, 2) +
          Math.pow(drawingState.current.startPointImage.y - edgeImage.y, 2)
        );

        if (radiusImage > 2e-6) {
          newAnnotation = {
            id,
            type: 'circle',
            center: drawingState.current.startPointImage,
            radius: radiusImage,
          };
        }
        break;
      case 'rectangle':
        const endPointImage = canvasToImage(point);
        const width = Math.abs(endPointImage.x - drawingState.current.startPointImage.x);
        const height = Math.abs(endPointImage.y - drawingState.current.startPointImage.y);

        if (width > 2e-6 && height > 2e-6) {
          newAnnotation = {
            id,
            type: 'rectangle',
            topLeft: {
              x: Math.min(drawingState.current.startPointImage.x, endPointImage.x),
              y: Math.min(drawingState.current.startPointImage.y, endPointImage.y),
            },
            width,
            height,
          };
        }
        break;
      case 'polygon':
        // 多邊形需要更多點，暫時只添加點
        drawingState.current.polygonPoints.push(canvasToImage(point));
        return; // 不結束繪製
    }

    if (newAnnotation) {
      onAnnotationsChange([...annotations, newAnnotation]);
    }

    // 清理狀態
    cleanupDrawingState();
  };

  const finishPolygon = () => {
    if (drawingState.current.polygonPoints.length > 2) {
      const newAnnotation: Annotation = {
        id: drawingState.current.annotationCounter++,
        type: 'polygon',
        points: drawingState.current.polygonPoints,
      };
      onAnnotationsChange([...annotations, newAnnotation]);
    }
    cleanupDrawingState();
  };

  const handleAnnotationMove = (point: paper.Point) => {
    if (!moveState.current.startPointImage || !moveState.current.originalPosition || selectedId === null) return;

    const currentImagePoint = canvasToImage(point);
    const dx = currentImagePoint.x - moveState.current.startPointImage.x;
    const dy = currentImagePoint.y - moveState.current.startPointImage.y;

    const updatedAnnotations = annotations.map(annotation => {
      if (annotation.id !== selectedId) return annotation;

      switch (annotation.type) {
        case 'circle':
          return {
            ...annotation,
            center: {
              x: moveState.current.originalPosition.x + dx,
              y: moveState.current.originalPosition.y + dy,
            },
          };
        case 'line':
          const originalStart = moveState.current.originalPosition;
          const originalEnd = annotation.endPoint;
          return {
            ...annotation,
            startPoint: {
              x: originalStart.x + dx,
              y: originalStart.y + dy,
            },
            endPoint: {
              x: originalEnd.x + dx,
              y: originalEnd.y + dy,
            },
          };
        case 'rectangle':
          return {
            ...annotation,
            topLeft: {
              x: moveState.current.originalPosition.x + dx,
              y: moveState.current.originalPosition.y + dy,
            },
          };
        case 'polygon':
          return {
            ...annotation,
            points: annotation.points.map((p, index) => {
              const originalPoint = moveState.current.originalPosition[index] || p;
              return {
                x: originalPoint.x + dx,
                y: originalPoint.y + dy,
              };
            }),
          };
        default:
          return annotation;
      }
    });

    onAnnotationsChange(updatedAnnotations);
    redrawAnnotations();
  };

  const cleanupDrawingState = () => {
    drawingState.current.isDrawing = false;
    drawingState.current.startPoint = null;
    drawingState.current.startPointImage = null;
    drawingState.current.polygonPoints = [];

    if (tempPath.current) {
      tempPath.current.remove();
      tempPath.current = null;
    }
  };
};

export default useAnnotationInteractions;