// import { useEffect, useRef } from "react";
// import OpenSeadragon from "openseadragon";

// /**
//  * useViewerEvents - Sets up OpenSeadragon viewer event handlers
//  * 
//  * This hook:
//  * - Listens to viewer animation events for smooth annotation updates
//  * - Handles viewer resize events
//  * - Ensures annotations stay in sync with viewport changes
//  * 
//  * @param viewer - OpenSeadragon viewer instance
//  * @param resizeCanvas - Function to resize the canvas
//  * @param redrawAnnotations - Function to redraw annotations
//  */

// const useViewerEvents = (
//     viewer: React.RefObject<OpenSeadragon.Viewer | null>,
//     resizeCanvas: () => void,
//     redrawAnnotations: () => void
// ) => {

//     const functionsRef = useRef({ resizeCanvas, redrawAnnotations });

//     // 更新函數引用
//     useEffect(() => {
//         functionsRef.current = { resizeCanvas, redrawAnnotations };
//     });

//     useEffect(() => {
//         if (!viewer.current) return;

//         console.log('Setting up viewer events');

//         // 使用防抖的重繪函數
//         let redrawTimeout: number;
//         const debouncedRedraw = () => {
//             clearTimeout(redrawTimeout);
//             redrawTimeout = window.setTimeout(functionsRef.current.redrawAnnotations, 16);
//         };

//         const handleResize = () => {
//             functionsRef.current.resizeCanvas();
//             debouncedRedraw();
//         };

//         const handleOpen = () => {
//             functionsRef.current.resizeCanvas();
//             debouncedRedraw();
//         };

//         // 註冊事件
//         viewer.current.addHandler('animation', debouncedRedraw);
//         viewer.current.addHandler('resize', handleResize);
//         viewer.current.addHandler('open', handleOpen);

//         // // Method 1: Type assertion for the handlers object
//         // const handlers: Partial<Record<keyof OpenSeadragon.ViewerEventMap, () => void>> = {
//         //     animation: () => debouncedRedraw(),
//         //     resize: () => {
//         //         resizeCanvas();
//         //         debouncedRedraw();
//         //     },
//         //     open: () => {
//         //         resizeCanvas();
//         //         debouncedRedraw();
//         //     },
//         // };

//         // // Now TypeScript knows the keys are valid event names
//         // (Object.entries(handlers) as Array<[keyof OpenSeadragon.ViewerEventMap, () => void]>).forEach(([event, handler]) => {
//         //     viewer.current?.addHandler(event, handler);
//         // });

//         return () => {
//             console.log('Cleaning up viewer events');
//             clearTimeout(redrawTimeout);

//             // Object.entries(handlers).forEach(([event, handler]) => {

//             //     // });<[keyof OpenSeadragon.ViewerEventMap, () => void]>).forEach(([event, handler]) => {
//             //     viewer.current?.removeHandler(event as keyof OpenSeadragon.ViewerEventMap, handler);
//             // });

//             if (viewer.current) {
//                 viewer.current.removeHandler('animation', debouncedRedraw);
//                 viewer.current.removeHandler('resize', handleResize);
//                 viewer.current.removeHandler('open', handleOpen);
//             }
//         };
//     }, []);
// };

// export default useViewerEvents;
import { useEffect } from "react";
import OpenSeadragon from "openseadragon";

/**
 * useViewerEvents - Sets up OpenSeadragon viewer event handlers
 * 
 * This hook:
 * - Listens to viewer animation events for smooth annotation updates
 * - Handles viewer resize events
 * - Ensures annotations stay in sync with viewport changes
 * 
 * @param viewer - OpenSeadragon viewer instance
 * @param resizeCanvas - Function to resize the canvas
 * @param redrawAnnotations - Function to redraw annotations
 */
const useViewerEvents = (
    viewer: React.RefObject<OpenSeadragon.Viewer | null>,
    resizeCanvas: () => void,
    redrawAnnotations: () => void
) => {
    useEffect(() => {
        if (!viewer.current) return;

        // Method 1: Type assertion for the handlers object
        const handlers: Partial<Record<keyof OpenSeadragon.ViewerEventMap, () => void>> = {
            animation: () => redrawAnnotations(),
            resize: () => {
                resizeCanvas();
                redrawAnnotations();
            },
            open: () => {
                resizeCanvas();
                redrawAnnotations();
            },
        };

        // Now TypeScript knows the keys are valid event names
        (Object.entries(handlers) as Array<[keyof OpenSeadragon.ViewerEventMap, () => void]>).forEach(([event, handler]) => {
            viewer.current?.addHandler(event, handler);
        });

        return () => {
            (Object.entries(handlers) as Array<[keyof OpenSeadragon.ViewerEventMap, () => void]>).forEach(([event, handler]) => {
                viewer.current?.removeHandler(event, handler);
            });
        };
    }, [viewer, resizeCanvas, redrawAnnotations]);
};

export default useViewerEvents;
