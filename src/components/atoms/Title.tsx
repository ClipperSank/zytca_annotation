import React from 'react';

interface TitleProps {
  children: React.ReactNode;
}

const Title: React.FC<TitleProps> = ({ children }) => (
  <h2 className="text-2xl font-bold mb-4">{children}</h2>
);

export default Title;