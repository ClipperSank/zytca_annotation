import { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";

/**
 * useViewerSetup - Initializes and manages OpenSeadragon viewer instance
 * 
 * This hook:
 * - Creates and configures the OpenSeadragon viewer
 * - Handles viewer lifecycle (mount/unmount)
 * - Provides viewer instance reference
 * 
 * @param viewerRef - Reference to the viewer container element
 * @returns viewer instance reference
 */

const useViewerSetup = (viewerRef: React.RefObject<HTMLDivElement  | null>) => {
    const viewer = useRef<OpenSeadragon.Viewer | null>(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current || !viewerRef.current) return;

        isInitialized.current = true;

        viewer.current = OpenSeadragon({
            element: viewerRef.current,
            prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
            tileSources: "/MCTL-02.dzi",
            animationTime: 0.5,
            gestureSettingsMouse: {
                flickEnabled: false,
            },
            constrainDuringPan: true,
            visibilityRatio: 0.5,
            minZoomLevel: 0.5,
            maxZoomLevel: 10,
        });

        return () => {
            if (viewer.current) {
                viewer.current.destroy();
                viewer.current = null;
            }
            isInitialized.current = false;
        };
    }, [viewerRef]);

    return viewer;
};

export default useViewerSetup;
