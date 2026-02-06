import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => {
    return (
        <button
            className={twMerge(clsx(
                "px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                variant === 'primary' && "bg-primary-500 text-white hover:bg-primary-700 focus:ring-primary-500",
                variant === 'secondary' && "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
                variant === 'danger' && "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500",
                className
            ))}
            {...props}
        />
    );
};
