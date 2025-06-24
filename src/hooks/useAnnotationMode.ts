import { useEffect, useState, type RefObject } from "react";

/**
 * useAnnotationMode - Manages annotation mode state and keyboard shortcuts
 * 
 * This hook:
 * - Toggles annotation mode with Shift key
 * - Controls canvas pointer events based on mode
 * - When Shift is pressed, canvas becomes interactive for drawing
 * - When Shift is released, canvas becomes transparent to mouse events
 * 
 * @param canvasRef - Reference to the canvas element
 * @returns annotationMode state
 */

const useAnnotationMode = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    const [annotationMode, setAnnotationMode] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift" && !e.repeat) {
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

        document.addEventListener("keydown", handleKeyDown, { passive: true });
        document.addEventListener("keyup", handleKeyUp, { passive: true });

        return () => {
            console.log('Cleaning up annotation mode listeners');
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return annotationMode;
};

export default useAnnotationMode;
