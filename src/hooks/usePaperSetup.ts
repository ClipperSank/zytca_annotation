import { useEffect, useRef, useCallback } from "react";
import paper from "paper";

/**
 * usePaperSetup - Initializes and manages Paper.js canvas and tool
 * 
 * This hook:
 * - Sets up Paper.js with the canvas element
 * - Creates and manages the Paper.js tool instance
 * - Handles canvas resizing
 * 
 * @param canvasRef - Reference to the canvas element
 * @param viewerRef - Reference to the viewer container for sizing
 * @returns object containing tool reference and resize function
 */

const usePaperSetup = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    viewerRef: React.RefObject<HTMLDivElement | null>
) => {
    const toolRef = useRef<paper.Tool | null>(null);
    const isSetupRef = useRef(false);

    const resizeCanvas = useCallback(() => {
        if (!canvasRef.current || !viewerRef.current) return;

        const newWidth = viewerRef.current.clientWidth;
        const newHeight = viewerRef.current.clientHeight;

        // 只有當尺寸真的變化時才調整
        if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
            canvasRef.current.width = newWidth;
            canvasRef.current.height = newHeight;
            if (paper.view) {
                paper.view.viewSize = new paper.Size(newWidth, newHeight);
            }
        }
    }, []);

    useEffect(() => {
        if (!canvasRef.current || isSetupRef.current) return;

        console.log('Setting up Paper.js');
        isSetupRef.current = true;

        try {
            paper.setup(canvasRef.current);
            resizeCanvas();

            toolRef.current = new paper.Tool();
            toolRef.current.activate();
        } catch (error) {
            console.error('Error setting up Paper.js:', error);
        }
        // 防抖的 resize 處理
        let resizeTimeout: number;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(resizeCanvas, 100);
        };

        window.addEventListener("resize", debouncedResize, { passive: true });

        return () => {
            console.log('Cleaning up Paper.js');
            clearTimeout(resizeTimeout);
            window.removeEventListener("resize", debouncedResize);

            if (toolRef.current) {
                toolRef.current.remove();
                toolRef.current = null;
            }

            // 清理 Paper.js 項目
            if (paper.project) {
                paper.project.clear();
            }

            isSetupRef.current = false;
        };

        // const handleResize = () => resizeCanvas();
        // window.addEventListener("resize", handleResize);

        // return () => {
        //     window.removeEventListener("resize", handleResize);
        //     if (toolRef.current) {
        //         toolRef.current.remove();
        //         toolRef.current = null;
        //     }
        // };
    }, []);

    return { toolRef, resizeCanvas };
};

export default usePaperSetup;
