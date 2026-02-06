import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
};

export const Badge = ({ children, variant = 'info', className }: BadgeProps) => {
    return (
        <span
            className={twMerge(
                clsx(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    variants[variant],
                    className
                )
            )}
        >
            {children}
        </span>
    );
};
