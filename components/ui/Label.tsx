
import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, ...props }) => {
  return (
    <label
      className="block text-sm font-medium text-slate-300"
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
