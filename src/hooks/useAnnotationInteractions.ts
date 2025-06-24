import { useCallback, useEffect, useRef } from "react";
import paper from "paper";
import type { Annotation, ToolMode } from "../types";

/**
 * useAnnotationInteractions - Handles mouse interactions for annotations
 * 
 * This hook:
 * - Manages annotation creation (click and drag to draw circle)
 * - Handles annotation selection (click on existing annotation)
 * - Manages annotation movement (drag selected annotation)
 * - Updates tool handlers based on current state
 * 
 * @param props - All necessary props for annotation interactions
 */

interface UseAnnotationInteractionsProps {
    toolRef: React.MutableRefObject<paper.Tool | null>;
    annotationMode: boolean;
    annotations: Annotation[];
    selectedId: number | null;
    toolMode: ToolMode; // 確保包含這個屬性
    canvasToImage: (point: paper.Point) => { x: number; y: number };
    imageToCanvas: (point: { x: number; y: number }) => paper.Point;
    onAnnotationsChange: (annotations: Annotation[]) => void;
    onSelectedIdChange: (id: number | null) => void;
    redrawAnnotations: () => void;
    tempPath: React.MutableRefObject<paper.Path | null>; // 改名從 tempCircle 到 tempPath
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

    // 使用 ref 來存儲最新的 props，避免依賴項變化
    const propsRef = useRef({
        annotations,
        selectedId,
        toolMode,
        onAnnotationsChange,
        onSelectedIdChange,
        redrawAnnotations
    });

    // 更新 refs
    useEffect(() => {
        propsRef.current = {
            annotations,
            selectedId,
            toolMode,
            onAnnotationsChange,
            onSelectedIdChange,
            redrawAnnotations
        };
    });

    // 繪製狀態 - 根據不同圖形類型管理不同的狀態
    const drawingState = useRef({
        isDrawing: false,
        startPoint: null as paper.Point | null,
        startPointImage: null as { x: number; y: number } | null,

        // 多邊形特殊狀態
        polygonPoints: [] as { x: number; y: number }[],

        // 計數器
        annotationCounter: 0,

        // 圓形特殊狀態（保持你原有的邏輯）
        tempCircleImageRadius: null as number | null,
    });

    // 移動狀態
    const moveState = useRef({
        isMoving: false,
        startPointImage: null as { x: number; y: number } | null,
        originalPosition: null as any, // 根據圖形類型存不同的原始位置資料
    });

    // 雙擊檢測
    const doubleClickState = useRef({
        lastClickTime: 0,
        clickCount: 0,
        doubleClickThreshold: 300, // 毫秒
    });

    // 獲取標註的位置資料（根據類型不同）
    const getAnnotationPosition = useCallback((annotation: Annotation) => {
        switch (annotation.type) {
            case 'circle':
                return annotation.center;
            case 'line':
                return {
                    startPoint: annotation.startPoint,
                    endPoint: annotation.endPoint
                };
            case 'rectangle':
                return annotation.topLeft;
            case 'polygon':
                return annotation.points; // 回傳整個點陣列
            default:
                return { x: 0, y: 0 };
        }
    }, []);

    // 創建臨時路徑
    const createTempPath = useCallback((point: paper.Point) => {
        if (tempPath.current) {
            tempPath.current.remove();
        }

        const currentToolMode = propsRef.current.toolMode;

        switch (currentToolMode) {
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
                drawingState.current.tempCircleImageRadius = 0;
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
    }, [tempPath]);

    // 更新臨時標註
    const updateTempAnnotation = useCallback((point: paper.Point) => {
        if (!tempPath.current || !drawingState.current.startPoint) return;

        const currentToolMode = propsRef.current.toolMode;

        switch (currentToolMode) {
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
                const radiusCanvas = drawingState.current.startPoint.getDistance(point);
                tempPath.current.remove();
                tempPath.current = new paper.Path.Circle({
                    center: drawingState.current.startPoint,
                    radius: radiusCanvas,
                    strokeColor: 'red',
                    strokeWidth: 2,
                    dashArray: [6, 6],
                });

                // 計算圖像空間的半徑
                const edgePoint = new paper.Point(
                    drawingState.current.startPoint.x + radiusCanvas,
                    drawingState.current.startPoint.y
                );
                const edgeImage = canvasToImage(edgePoint);
                drawingState.current.tempCircleImageRadius = Math.sqrt(
                    Math.pow(drawingState.current.startPointImage!.x - edgeImage.x, 2) +
                    Math.pow(drawingState.current.startPointImage!.y - edgeImage.y, 2)
                );
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
            case 'polygon':
                // 多邊形在拖拽時顯示預覽線
                const currentPoints = [...drawingState.current.polygonPoints, canvasToImage(point)];
                const canvasPoints = currentPoints.map(p => imageToCanvas(p));
                tempPath.current.remove();
                tempPath.current = new paper.Path({
                    segments: canvasPoints,
                    closed: false,
                    strokeColor: 'red',
                    strokeWidth: 2,
                    dashArray: [6, 6],
                });
                break;
        }
    }, [canvasToImage, imageToCanvas, tempPath]);

    // 清理繪製狀態
    const cleanupDrawingState = useCallback(() => {
        drawingState.current.isDrawing = false;
        drawingState.current.startPoint = null;
        drawingState.current.startPointImage = null;
        drawingState.current.polygonPoints = [];
        drawingState.current.tempCircleImageRadius = null;

        if (tempPath.current) {
            tempPath.current.remove();
            tempPath.current = null;
        }
    }, [tempPath]);

    // 處理標註移動
    const handleAnnotationMove = useCallback((point: paper.Point) => {
        const { selectedId, annotations, onAnnotationsChange } = propsRef.current

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
                    const originalStart = moveState.current.originalPosition.startPoint;
                    const originalEnd = moveState.current.originalPosition.endPoint;
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
                        points: moveState.current.originalPosition.map((p: { x: number; y: number }) => ({
                            x: p.x + dx,
                            y: p.y + dy,
                        })),
                    };
                default:
                    return annotation;
            }
        });

        onAnnotationsChange(updatedAnnotations);
    }, [canvasToImage]);

    // 開始新標註
    const startNewAnnotation = useCallback((point: paper.Point) => {
        drawingState.current.isDrawing = true;
        drawingState.current.startPoint = point;
        drawingState.current.startPointImage = canvasToImage(point);

        // 多邊形特殊處理
        if (propsRef.current.toolMode === 'polygon') {
            drawingState.current.polygonPoints = [canvasToImage(point)];
        }

        createTempPath(point);
    }, [canvasToImage, createTempPath]);

    // 完成標註
    const finishAnnotation = useCallback((point: paper.Point) => {
        const { annotations, onAnnotationsChange } = propsRef.current

        if (!drawingState.current.startPoint || !drawingState.current.startPointImage) return;

        let newAnnotation: Annotation | null = null;
        const id = drawingState.current.annotationCounter++;
        const currentToolMode = propsRef.current.toolMode;

        switch (currentToolMode) {
            case 'line':
                newAnnotation = {
                    id,
                    type: 'line',
                    startPoint: drawingState.current.startPointImage,
                    endPoint: canvasToImage(point),
                };
                break;
            case 'circle':
                // 使用你原有的圓形邏輯
                if (drawingState.current.tempCircleImageRadius && drawingState.current.tempCircleImageRadius > 2e-6) {
                    newAnnotation = {
                        id,
                        type: 'circle',
                        center: drawingState.current.startPointImage,
                        radius: drawingState.current.tempCircleImageRadius,
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
                // 多邊形點擊模式，添加點而不是完成
                drawingState.current.polygonPoints.push(canvasToImage(point));
                updateTempAnnotation(point);
                return; // 不清理狀態，繼續繪製
        }

        if (newAnnotation) {
            onAnnotationsChange([...annotations, newAnnotation]);
        }

        cleanupDrawingState();
    }, [canvasToImage, updateTempAnnotation, cleanupDrawingState]);

    // 完成多邊形
    const finishPolygon = useCallback(() => {
        const { annotations, onAnnotationsChange } = propsRef.current

        if (drawingState.current.polygonPoints.length > 2) {
            const newAnnotation: Annotation = {
                id: drawingState.current.annotationCounter++,
                type: 'polygon',
                points: drawingState.current.polygonPoints,
            };
            onAnnotationsChange([...annotations, newAnnotation]);
        }
        cleanupDrawingState();
    }, [cleanupDrawingState]);

    useEffect(() => {
        if (!toolRef.current) return;

        toolRef.current.onMouseDown = (event: paper.ToolEvent) => {
            if (!annotationMode) return;

            const { annotations, selectedId, onSelectedIdChange, onAnnotationsChange } = propsRef.current

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

            if (
                hitResult &&
                hitResult.item &&
                hitResult.item.data?.annotationId !== undefined
            ) {
                const clickedId = hitResult.item.data.annotationId;
                onSelectedIdChange(clickedId);

                const annotation = annotations.find(a => a.id === clickedId);

                // 橡皮擦模式 - 直接刪除
                if (toolMode === 'eraser') {
                    onAnnotationsChange(annotations.filter(a => a.id !== clickedId));
                    if (selectedId === clickedId) {
                        onSelectedIdChange(null);
                    }
                    return;
                }

                // 進入移動模式（如果點擊的是已選中的標註）
                if (annotation && selectedId === clickedId) {
                    moveState.current.isMoving = true;
                    moveState.current.startPointImage = canvasToImage(event.point);
                    moveState.current.originalPosition = getAnnotationPosition(annotation);
                    return;
                }
                return;
            }

            // 橡皮擦模式下不創建新標註
            if (toolMode === 'eraser') return;

            // 開始創建新標註
            startNewAnnotation(event.point);
        };

        let animationFrame: number | null = null;
        toolRef.current.onMouseDrag = (event: paper.ToolEvent) => {
            if (!annotationMode) return;

            const { selectedId } = propsRef.current

            // 處理移動模式
            if (moveState.current.isMoving && selectedId !== null) {
                handleAnnotationMove(event.point);
                // 使用動畫幀優化重繪
                if (animationFrame) cancelAnimationFrame(animationFrame);
                animationFrame = requestAnimationFrame(() => {
                    propsRef.current.redrawAnnotations();
                });
                return;
            }

            // 處理繪製模式
            if (drawingState.current.isDrawing) {
                updateTempAnnotation(event.point);
            }
        };

        toolRef.current.onMouseUp = (event: paper.ToolEvent) => {
            // 結束移動模式
            if (moveState.current.isMoving) {
                moveState.current.isMoving = false;
                moveState.current.startPointImage = null;
                moveState.current.originalPosition = null;
                return;
            }

            // 結束繪製模式
            if (drawingState.current.isDrawing) {
                finishAnnotation(event.point);
            }
        };

        // 清理函數
        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };

    }, [
        annotationMode,
        toolMode
    ]);
}

export default useAnnotationInteractions;
