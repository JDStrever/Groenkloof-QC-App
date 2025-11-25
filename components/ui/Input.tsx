import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
      {...props}
    />
  );
};

export default Input;