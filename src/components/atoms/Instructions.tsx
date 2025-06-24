import React from 'react';

const Instructions: React.FC = () => (
  <p className="text-gray-600 mb-4">
    Hold <strong>Shift</strong> to annotate, select, move, or delete circles.<br />
    Release <strong>Shift</strong> to zoom/pan the image.<br />
    Circles follow the image during zoom and pan.
  </p>
);

export default Instructions;