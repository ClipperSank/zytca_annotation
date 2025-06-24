import React from 'react';

const InstructionText: React.FC = () => (
  <p className="text-gray-600 mb-4">
    Hold <b>Shift</b> to annotate, select, move, or delete circles.<br />
    Release <b>Shift</b> to zoom/pan the image.<br />
    Circles follow the image during zoom and pan.
  </p>
);

export default InstructionText;