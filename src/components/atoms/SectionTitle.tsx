import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <h3 className="text-lg font-semibold mb-2">{children}</h3>
);

export default SectionTitle;