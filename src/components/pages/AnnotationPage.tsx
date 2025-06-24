// // components/pages/AnnotationPage.tsx
// import React, { useState } from "react";
// import MainTemplate from "../templates/MainTemplate";
// import ViewerCanvas from "../organisms/ViewerCanvas";
// import AnnotationList from "../organisms/AnnotationList";
// import type { Annotation } from "../../types/annotation";
// import ToolBar from "../molecules/ToolBar";
// import type { ToolMode } from "../../types/toolbar";

// const AnnotationPage: React.FC = () => {
//   const [annotations, setAnnotations] = useState<Annotation[]>([]);
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [toolMode, setToolMode] = useState<ToolMode>("line");

//   const handleDelete = (id: number) => {
//     setAnnotations((prev) => prev.filter((a) => a.id !== id));
//     if (selectedId === id) setSelectedId(null);
//   };

//   return (
//     <MainTemplate>
//       <div className="w-3/4 relative">
//         <ToolBar currentMode={toolMode} onChangeMode={setToolMode} />
//         <ViewerCanvas
//           annotations={annotations}
//           selectedId={selectedId}
//           onAnnotationsChange={setAnnotations}
//           onSelectedIdChange={setSelectedId}
//         />
//       </div>
//       <div className="w-1/4">
//         <AnnotationList
//           annotations={annotations}
//           selectedId={selectedId}
//           onSelect={setSelectedId}
//           onDelete={handleDelete}
//           onView={(id) => {
//             console.log("View details for annotation", id);
//             // 可以改成開 Modal 或側欄顯示
//           }}
//         />
//       </div>
//     </MainTemplate>
//   );
// };

// export default AnnotationPage;
import React, { useState, useCallback } from "react";
import MainTemplate from "../templates/MainTemplate";
import ViewerCanvas from "../organisms/ViewerCanvas";
import AnnotationList from "../organisms/AnnotationList";
import ToolBar from "../molecules/ToolBar";
import type { Annotation, ToolMode } from "../../types";

const AnnotationPage: React.FC = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>("line");

  // 🔑 關鍵修復：使用 useCallback 穩定函數引用
  const handleAnnotationsChange = useCallback((newAnnotations: Annotation[]) => {
    setAnnotations(newAnnotations);
  }, []);

  const handleSelectedIdChange = useCallback((newId: number | null) => {
    setSelectedId(newId);
  }, []);

  const handleToolModeChange = useCallback((newMode: ToolMode) => {
    setToolMode(newMode);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((current) => current === id ? null : current);
  }, []);

  const handleView = useCallback((id: number) => {
    console.log("View details for annotation", id);
  }, []);

  return (
    <MainTemplate>
      <div className="w-3/4 relative">
        <ToolBar currentMode={toolMode} onChangeMode={handleToolModeChange} />
        <ViewerCanvas
          annotations={annotations}
          selectedId={selectedId}
          toolMode={toolMode}
          onAnnotationsChange={handleAnnotationsChange}
          onSelectedIdChange={handleSelectedIdChange}
        />
      </div>
      <div className="w-1/4">
        <AnnotationList
          annotations={annotations}
          selectedId={selectedId}
          onSelect={handleSelectedIdChange}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>
    </MainTemplate>
  );
};

export default AnnotationPage;