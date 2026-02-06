import { type SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { label: string; value: string | number }[];
    containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className, containerClassName, options, ...props }, ref) => {
        return (
            <div className={clsx('flex flex-col gap-1', containerClassName)}>
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <select
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
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <span className="text-xs text-danger-500">{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
