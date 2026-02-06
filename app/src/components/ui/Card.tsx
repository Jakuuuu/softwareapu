import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    onClick?: () => void;
}

export const Card = ({ children, className, title, onClick }: CardProps) => {
    return (
        <div
            onClick={onClick}
            className={twMerge(
                clsx(
                    'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
                    onClick && 'cursor-pointer hover:bg-gray-50 transition-colors',
                    className
                )
            )}
        >
            {title && (
                <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {children}
        </div>
    );
};
