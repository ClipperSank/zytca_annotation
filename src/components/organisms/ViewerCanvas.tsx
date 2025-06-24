import React, { useEffect, useRef, useMemo, useCallback } from "react";
import type { ViewerCanvasProps } from "../../types";
import useViewerSetup from "../../hooks/useViewerSetup";
import usePaperSetup from "../../hooks/usePaperSetup";
import useCoordinateConversion from "../../hooks/useCoordinateConversion";
import useAnnotationDrawing from "../../hooks/useAnnotationDrawing";
import useAnnotationMode from "../../hooks/useAnnotationMode";
import useViewerEvents from "../../hooks/useViewerEvents";
import useAnnotationInteractions from "../../hooks/useAnnotationInteractions";
import useAnnotationDeletion from "../../hooks/useAnnotationDeletion";

// 緊急斷路器
let globalRenderCount = 0;
const MAX_RENDERS = 20;

const ViewerCanvas: React.FC<ViewerCanvasProps> = ({
  annotations,
  selectedId,
  toolMode,
  onAnnotationsChange,
  onSelectedIdChange,
}) => {

  // 🚨 緊急斷路器
  globalRenderCount++;
  console.log(`ViewerCanvas render #${globalRenderCount}`, {
    annotationsLength: annotations.length,
    selectedId,
    toolMode,
  });

  if (globalRenderCount > MAX_RENDERS) {
    console.error("🚨 檢測到無限重渲染！自動停止");
    return (
      <div className="relative w-full h-[80vh] mx-auto border border-red-400 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️ 無限重渲染檢測</div>
          <div className="text-gray-600 mb-4">已自動停止以保護系統</div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              globalRenderCount = 0;
              window.location.reload();
            }}
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // console.log("ViewerCanvas render", {
  //   annotationsLength: annotations.length,
  //   selectedId,
  //   toolMode,
  // });

  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 添加渲染次數追蹤
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  // console.log("ViewerCanvas render", {
  //   count: renderCountRef.current,
  //   annotationsLength: annotations.length,
  //   selectedId,
  //   toolMode,
  // });

  // 如果渲染次數過多，警告
  // if (renderCountRef.current > 100) {
  //   console.error(
  //     "ViewerCanvas 渲染次數過多！可能有無限重渲染",
  //     renderCountRef.current
  //   );
  // }

  // Initialize core systems
  const viewer = useViewerSetup(viewerRef);
  const { toolRef, resizeCanvas } = usePaperSetup(canvasRef, viewerRef);
  const { canvasToImage, imageToCanvas } = useCoordinateConversion(viewer);

  // Set up annotation drawing - 需要更新這個 hook 來支援新的類型
  const { redrawAnnotations, annotationsRef, selectedIdRef, tempPath } =
    useAnnotationDrawing(viewer, imageToCanvas, toolMode);

  // Set up interaction modes
  const annotationMode = useAnnotationMode(canvasRef);

  // ✅ 修正：使用穩定的回調引用，不再使用 useMemo
  const stableOnAnnotationsChange = useCallback((newAnnotations: typeof annotations) => {
    onAnnotationsChange(newAnnotations);
  }, [onAnnotationsChange]);

  const stableOnSelectedIdChange = useCallback((newId: typeof selectedId) => {
    onSelectedIdChange(newId);
  }, [onSelectedIdChange]);

  // 使用 useMemo 來避免不必要的重新計算
  // const stableCallbacks = useMemo(
  //   () => ({
  //     onAnnotationsChange,
  //     onSelectedIdChange,
  //   }),
  //   // [onAnnotationsChange, onSelectedIdChange]
  //   []
  // );

  // 更新回調引用（但不觸發重渲染）
  // useEffect(() => {
  //   stableCallbacks.onAnnotationsChange = onAnnotationsChange;
  //   stableCallbacks.onSelectedIdChange = onSelectedIdChange;
  // });

  // Sync refs with props
  // useEffect(() => {
  //   if (annotationsRef.current !== annotations)
  //     annotationsRef.current = annotations;
  // }, [annotations, annotationsRef]);

  // useEffect(() => {
  //   if (selectedIdRef.current !== selectedId)
  //     selectedIdRef.current = selectedId;
  // }, [selectedId, selectedIdRef]);

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Set up event handlers
  useViewerEvents(viewer, resizeCanvas, redrawAnnotations);

  // useAnnotationInteractions({
  //   toolRef,
  //   annotationMode,
  //   annotations,
  //   selectedId,
  //   toolMode,
  //   canvasToImage,
  //   imageToCanvas,
  //   onAnnotationsChange: stableOnAnnotationsChange,
  //   onSelectedIdChange: stableOnSelectedIdChange,
  //   redrawAnnotations,
  //   tempPath,
  // });

  // useAnnotationDeletion({
  //   canvasRef,
  //   annotationMode,
  //   annotations,
  //   selectedId,
  //   onAnnotationsChange: stableOnAnnotationsChange,
  //   onSelectedIdChange: stableOnSelectedIdChange,
  // });

  // Redraw when annotations or selection changes
  // 簡化重繪邏輯，添加防抖
  const redrawTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (redrawTimeoutRef.current) {
      clearTimeout(redrawTimeoutRef.current);
    }

    redrawTimeoutRef.current = window.setTimeout(() => {
      console.log("Redrawing annotations due to changes");
      redrawAnnotations();
    }, 16); // 60fps

    return () => {
      if (redrawTimeoutRef.current) {
        clearTimeout(redrawTimeoutRef.current);
      }
    };
  }, [annotations.length, selectedId]);

  // toolMode 變化時立即重繪
  useEffect(() => {
    console.log("Redrawing annotations due to toolMode change");
    redrawAnnotations();
  }, [toolMode]);

  return (
    <div className="relative w-full h-[80vh] mx-auto border border-gray-400">
      <div ref={viewerRef} className="w-full h-full" />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
};

export default React.memo(ViewerCanvas);
