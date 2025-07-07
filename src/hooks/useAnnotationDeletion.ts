// import { useEffect, useRef } from "react";
// import paper from "paper";
// import type { Point, Annotation } from "../types";


// /**
//  * useAnnotationDeletion - Handles right-click deletion of annotations
//  * 
//  * This hook:
//  * - Listens for right-click events on annotations
//  * - Deletes the annotation under the cursor
//  * - Updates selection if deleted annotation was selected
//  * - Only works when annotation mode is active
//  * 
//  * @param props - Properties needed for deletion functionality
//  */
// const useAnnotationDeletion = ({
//     canvasRef,
//     annotationMode,
//     annotations,
//     selectedId,
//     onAnnotationsChange,
//     onSelectedIdChange,
// }: {
//     canvasRef: React.RefObject<HTMLCanvasElement | null>;
//     annotationMode: boolean;
//     annotations: Annotation[];
//     selectedId: number | null;
//     onAnnotationsChange: (annotations: Annotation[]) => void;
//     onSelectedIdChange: (id: number | null) => void;
// }) => {

//     const propsRef = useRef({
//         annotations,
//         selectedId,
//         onAnnotationsChange,
//         onSelectedIdChange
//     });

//     // 更新 props ref
//     useEffect(() => {
//         propsRef.current = {
//             annotations,
//             selectedId,
//             onAnnotationsChange,
//             onSelectedIdChange
//         };
//     });

//     useEffect(() => {
//         if (!annotationMode || !canvasRef.current) return

//         const canvas = canvasRef.current

//         const handleContextMenu = (e: MouseEvent) => {

//             const { annotations, selectedId, onAnnotationsChange, onSelectedIdChange } = propsRef.current;

//             const rect = canvas.getBoundingClientRect();
//             const point = new paper.Point(
//                 e.clientX - rect.left,
//                 e.clientY - rect.top
//             );
//             const hitResult = paper.project.hitTest(point, {
//                 fill: false,
//                 stroke: true,
//                 segments: false,
//                 tolerance: 5,
//             });

//             if (
//                 hitResult &&
//                 hitResult.item &&
//                 hitResult.item.data?.annotationId !== undefined
//             ) {
//                 const id = hitResult.item.data.annotationId;
//                 onAnnotationsChange(annotations.filter((a) => a.id !== id));
//                 if (selectedId === id) {
//                     onSelectedIdChange(null);
//                 }
//                 e.preventDefault();
//             }
//         };

//         canvas.addEventListener("contextmenu", handleContextMenu);
//         return () => {
//             canvas.removeEventListener("contextmenu", handleContextMenu);
//         };
//     }, [annotationMode]);
// };

// export default useAnnotationDeletion;
import { useEffect } from "react";
import paper from "paper";
import type { Point, Annotation } from "../types";


/**
 * useAnnotationDeletion - Handles right-click deletion of annotations
 * 
 * This hook:
 * - Listens for right-click events on annotations
 * - Deletes the annotation under the cursor
 * - Updates selection if deleted annotation was selected
 * - Only works when annotation mode is active
 * 
 * @param props - Properties needed for deletion functionality
 */

const useAnnotationDeletion = ({
    canvasRef,
    annotationMode,
    annotations,
    selectedId,
    onAnnotationsChange,
    onSelectedIdChange,
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    annotationMode: boolean;
    annotations: Annotation[];
    selectedId: number | null;
    onAnnotationsChange: (annotations: Annotation[]) => void;
    onSelectedIdChange: (id: number | null) => void;
}) => {
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
        canvasRef,
        annotationMode,
        annotations,
        selectedId,
        onAnnotationsChange,
        onSelectedIdChange,
    ]);
};

export default useAnnotationDeletion;
