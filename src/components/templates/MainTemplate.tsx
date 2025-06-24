import React from "react";
import Title from "../atoms/Title";
import Instructions from "../atoms/Instructions";

interface MainTemplateProps {
  children: React.ReactNode;
}

const MainTemplate: React.FC<MainTemplateProps> = ({ children }) => (
  <div className="p-4">
    <Title>OpenSeadragon + Paper.js: Draw Circles</Title>
    <Instructions />
    <div className="flex gap-4 mt-4">
      {children}
    </div>
  </div>
);

export default MainTemplate;
