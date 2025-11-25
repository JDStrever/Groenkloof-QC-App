
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div 
            className={`bg-white rounded-xl shadow-lg p-6 md:p-8 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
   