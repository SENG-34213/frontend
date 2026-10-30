import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
  ...props
}) => {
  const maxSizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxSizes[size]} ${className}`} {...props}>
      {children}
    </div>
  );
};
