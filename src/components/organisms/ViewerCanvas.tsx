// import React, { useEffect, useRef } from "react";
// import type { ViewerCanvasProps } from "../../types";
// import useViewerSetup from "../../hooks/useViewerSetup";
// import usePaperSetup from "../../hooks/usePaperSetup";
// import useCoordinateConversion from "../../hooks/useCoordinateConversion";
// import useAnnotationDrawing from "../../hooks/useAnnotationDrawing";
// import useAnnotationMode from "../../hooks/useAnnotationMode";
// import useViewerEvents from "../../hooks/useViewerEvents";
// import useAnnotationInteractions from "../../hooks/useAnnotationInteractions";
// import useAnnotationDeletion from "../../hooks/useAnnotationDeletion";

// const ViewerCanvas: React.FC<ViewerCanvasProps> = ({
//   annotations,
//   selectedId,
//   toolMode,
//   onAnnotationsChange,
//   onSelectedIdChange,
// }) => {
//   const viewerRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   // Initialize core systems
//   const viewer = useViewerSetup(viewerRef);
//   const { toolRef, resizeCanvas } = usePaperSetup(canvasRef, viewerRef);
//   const { canvasToImage, imageToCanvas } = useCoordinateConversion(viewer);
  
//   // Set up annotation drawing
//   const { redrawAnnotations, annotationsRef, selectedIdRef, tempPath } = 
//     useAnnotationDrawing(viewer, imageToCanvas, toolMode);

//   // Set up interaction modes
//   const annotationMode = useAnnotationMode(canvasRef);

//   // Sync refs with props
//   useEffect(() => {
//     annotationsRef.current = annotations;
//   }, [annotations, annotationsRef]);

//   useEffect(() => {
//     selectedIdRef.current = selectedId;
//   }, [selectedId, selectedIdRef]);

//   // Set up event handlers
//   useViewerEvents(viewer, resizeCanvas, redrawAnnotations);

//   useAnnotationInteractions({
//     toolRef,
//     annotationMode,
//     annotations,
//     selectedId,
//     toolMode,
//     canvasToImage,
//     imageToCanvas,
//     onAnnotationsChange,
//     onSelectedIdChange,
//     redrawAnnotations,
//     tempPath,
//   });

//   useAnnotationDeletion({
//     canvasRef,
//     annotationMode,
//     annotations,
//     selectedId,
//     onAnnotationsChange,
//     onSelectedIdChange,
//   });

//   // Redraw when annotations or selection changes
//   useEffect(() => {
//     redrawAnnotations();
//   }, [annotations, selectedId, redrawAnnotations]);

//   return (
//     <div className="relative w-full h-[80vh] mx-auto border border-gray-400">
//       <div ref={viewerRef} className="w-full h-full" />
//       <canvas
//         ref={canvasRef}
//         className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
//       />
//     </div>
//   );
// };

// export default ViewerCanvas;

import React, { useEffect, useRef, useState, useCallback } from "react";
import OpenSeadragon from "openseadragon";
import paper from "paper";
import type { Annotation, Point } from "../../types";

interface ViewerCanvasProps {
  annotations: Annotation[];
  selectedId: number | null;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onSelectedIdChange: (id: number | null) => void;
}

const ViewerCanvas: React.FC<ViewerCanvasProps> = ({
  annotations,
  selectedId,
  onAnnotationsChange,
  onSelectedIdChange,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewer = useRef<OpenSeadragon.Viewer | null>(null);
  const [annotationMode, setAnnotationMode] = useState(false);

  // 🔴 關鍵改動 1: 使用 ref 而非 state 來避免重新渲染
  const annotationCounterRef = useRef(0);
  const toolRef = useRef<paper.Tool | null>(null);
  const isInitialized = useRef(false);

  // Drawing state
  const startPoint = useRef<paper.Point | null>(null);
  const startPointImage = useRef<Point | null>(null);
  const tempCircle = useRef<paper.Path.Circle | null>(null);
  const tempCircleImageRadius = useRef<number | null>(null);

  // Moving state
  const moveMode = useRef(false);
  const moveStartPointImage = useRef<Point | null>(null);
  const moveOriginalCenterImage = useRef<Point | null>(null);

  // Helper functions
  const canvasToImage = useCallback((point: paper.Point): Point => {
    if (!viewer.current) return { x: 0, y: 0 };
    const osdPoint = new OpenSeadragon.Point(point.x, point.y);
    const viewportPoint = viewer.current.viewport.pointFromPixel(osdPoint);
    const imagePoint =
      viewer.current.viewport.viewportToImageCoordinates(viewportPoint);
    return { x: imagePoint.x, y: imagePoint.y };
  }, []);

  const imageToCanvas = useCallback((point: Point): paper.Point => {
    if (!viewer.current) return new paper.Point(0, 0);
    const viewportPoint = viewer.current.viewport.imageToViewportCoordinates(
      point.x,
      point.y
    );
    const canvasPixel = viewer.current.viewport.pixelFromPoint(viewportPoint);
    return new paper.Point(canvasPixel.x, canvasPixel.y);
  }, []);

  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !viewerRef.current) return;
    canvasRef.current.width = viewerRef.current.clientWidth;
    canvasRef.current.height = viewerRef.current.clientHeight;
    if (paper.view) {
      paper.view.viewSize = new paper.Size(
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  }, []);

  const redrawAnnotations = useCallback(() => {
    if (!paper.project || !viewer.current) return;

    // 🔴 關鍵改動 2: 只清除 annotation layer，不清除整個 project
    paper.project.activeLayer.removeChildren();

    annotations.forEach((anno) => {
      const centerCanvas = imageToCanvas(anno.center);
      const edgeImg = { x: anno.center.x + anno.radius, y: anno.center.y };
      const edgeCanvas = imageToCanvas(edgeImg);
      const radius = centerCanvas.getDistance(edgeCanvas);

      const circle = new paper.Path.Circle({
        center: centerCanvas,
        radius: radius,
        strokeColor: anno.id === selectedId ? "yellow" : "red",
        strokeWidth: anno.id === selectedId ? 4 : 2,
        data: { annotationId: anno.id },
      });

      anno.path = circle;
    });

    if (tempCircle.current) {
      paper.project.activeLayer.addChild(tempCircle.current);
    }

    // paper.view.draw();
    paper.view.update();
  }, [annotations, selectedId, imageToCanvas]);

  // 🔴 關鍵改動 3: 只初始化一次 OpenSeadragon 和 Paper.js
  useEffect(() => {
    if (isInitialized.current || !viewerRef.current || !canvasRef.current)
      return;

    isInitialized.current = true;

    // Initialize OpenSeadragon
    viewer.current = OpenSeadragon({
      element: viewerRef.current,
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
      tileSources: "../../public/MCTL-02.dzi",
      animationTime: 0.5,
      gestureSettingsMouse: {
        flickEnabled: false,
      },
      // 🔴 關鍵改動 4: 防止自動置中的設定
      constrainDuringPan: true,
      visibilityRatio: 0.5,
      minZoomLevel: 0.5,
      maxZoomLevel: 10,
    });

    // Setup Paper.js
    paper.setup(canvasRef.current);
    resizeCanvas();

    // Setup event handlers
    const handleResize = () => {
      resizeCanvas();
      redrawAnnotations();
    };

    window.addEventListener("resize", handleResize);

    viewer.current.addHandler("animation", redrawAnnotations);
    viewer.current.addHandler("resize", () => {
      resizeCanvas();
      redrawAnnotations();
    });
    viewer.current.addHandler("open", () => {
      resizeCanvas();
      redrawAnnotations();
    });

    // Initialize Paper.js tool
    toolRef.current = new paper.Tool();
    toolRef.current.activate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (viewer.current) {
        viewer.current.destroy();
        viewer.current = null;
      }
      if (toolRef.current) {
        toolRef.current.remove();
        toolRef.current = null;
      }
      isInitialized.current = false;
    };
  }, []); // 🔴 關鍵：空依賴陣列，只執行一次

  // 🔴 關鍵改動 5: 將 Paper.js tool 的事件處理器更新分離出來
  useEffect(() => {
    if (!toolRef.current) return;

    toolRef.current.onMouseDown = (event: paper.ToolEvent) => {
      if (!annotationMode) return;

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
        onSelectedIdChange(hitResult.item.data.annotationId);

        const anno = annotations.find(
          (a) => a.id === hitResult.item.data.annotationId
        );
        if (anno && selectedId === hitResult.item.data.annotationId) {
          moveMode.current = true;
          moveStartPointImage.current = canvasToImage(event.point);
          moveOriginalCenterImage.current = { ...anno.center };
          return;
        }
        return;
      }

      // Start new annotation
      startPoint.current = event.point;
      startPointImage.current = canvasToImage(event.point);
      tempCircle.current = new paper.Path.Circle({
        center: event.point,
        radius: 1,
        strokeColor: "red",
        strokeWidth: 2,
        dashArray: [6, 6],
      });
      tempCircleImageRadius.current = 0;
    };

    let animationFrame: number | null = null;
    toolRef.current.onMouseDrag = (event: paper.ToolEvent) => {
      if (!annotationMode) return;

      if (moveMode.current && selectedId !== null) {
        const anno = annotations.find((a) => a.id === selectedId);
        if (
          anno &&
          moveStartPointImage.current &&
          moveOriginalCenterImage.current
        ) {
          const curImagePoint = canvasToImage(event.point);
          const dx = curImagePoint.x - moveStartPointImage.current.x;
          const dy = curImagePoint.y - moveStartPointImage.current.y;

          const updatedAnnotations = annotations.map((a) =>
            a.id === selectedId
              ? {
                  ...a,
                  center: {
                    x: moveOriginalCenterImage.current!.x + dx,
                    y: moveOriginalCenterImage.current!.y + dy,
                  },
                }
              : a
          );
          onAnnotationsChange(updatedAnnotations);
          // 👇 使用 requestAnimationFrame 減少重繪頻率
          if (animationFrame) cancelAnimationFrame(animationFrame);
          animationFrame = requestAnimationFrame(() => {
            redrawAnnotations();
          });
        }
        return;
      }

      if (
        !tempCircle.current ||
        !startPoint.current ||
        !startPointImage.current
      )
        return;

      const radiusCanvas = startPoint.current.getDistance(event.point);
      tempCircle.current.remove();
      tempCircle.current = new paper.Path.Circle({
        center: startPoint.current,
        radius: radiusCanvas,
        strokeColor: "red",
        strokeWidth: 2,
        dashArray: [6, 6],
      });

      const edgePoint = new paper.Point(
        startPoint.current.x + radiusCanvas,
        startPoint.current.y
      );
      const edgeImage = canvasToImage(edgePoint);
      tempCircleImageRadius.current = Math.sqrt(
        Math.pow(startPointImage.current.x - edgeImage.x, 2) +
          Math.pow(startPointImage.current.y - edgeImage.y, 2)
      );
    };

    toolRef.current.onMouseUp = () => {
      if (moveMode.current) {
        moveMode.current = false;
        moveStartPointImage.current = null;
        moveOriginalCenterImage.current = null;
        return;
      }

      if (
        !annotationMode ||
        !tempCircle.current ||
        !startPointImage.current ||
        !tempCircleImageRadius.current
      )
        return;

      if (tempCircleImageRadius.current > 2e-6) {
        const newAnnotation: Annotation = {
          id: annotationCounterRef.current, // 🔴 使用 ref 而非 state
          center: startPointImage.current,
          radius: tempCircleImageRadius.current,
          path: null,
        };
        onAnnotationsChange([...annotations, newAnnotation]);
        annotationCounterRef.current += 1; // 🔴 直接更新 ref
      }

      if (tempCircle.current) {
        tempCircle.current.remove();
        tempCircle.current = null;
      }
      startPoint.current = null;
      startPointImage.current = null;
      tempCircleImageRadius.current = null;
    };
  }, [
    annotationMode,
    annotations,
    selectedId,
    canvasToImage,
    onAnnotationsChange,
    onSelectedIdChange,
  ]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setAnnotationMode(true);
        if (canvasRef.current) {
          canvasRef.current.style.pointerEvents = "auto";
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setAnnotationMode(false);
        if (canvasRef.current) {
          canvasRef.current.style.pointerEvents = "none";
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Context menu for deletion
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!annotationMode || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const point = new paper.Point(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
      const hitResult = paper.project.hitTest(point, {
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
        const id = hitResult.item.data.annotationId;
        onAnnotationsChange(annotations.filter((a) => a.id !== id));
        if (selectedId === id) {
          onSelectedIdChange(null);
        }
        e.preventDefault();
      }
    };

    canvasRef.current?.addEventListener("contextmenu", handleContextMenu);
    return () => {
      canvasRef.current?.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
    annotationMode,
    annotations,
    selectedId,
    onAnnotationsChange,
    onSelectedIdChange,
  ]);

  // 🔴 關鍵改動 6: 獨立的 useEffect 來處理重繪
  useEffect(() => {
    redrawAnnotations();
  }, [annotations, selectedId, redrawAnnotations]);

  return (
    <div className="relative w-4/5 h-[80vh] mx-auto border border-gray-400">
      <div ref={viewerRef} className="w-full h-full" />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
};

export default ViewerCanvas;