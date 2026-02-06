import { type InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, containerClassName, ...props }, ref) => {
        return (
            <div className={clsx('flex flex-col gap-1', containerClassName)}>
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        clsx(
                            'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors',
                            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                            'disabled:bg-gray-100 disabled:text-gray-500',
                            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500',
                            className
                        )
                    )}
                    {...props}
                />
                {error && <span className="text-xs text-danger-500">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
