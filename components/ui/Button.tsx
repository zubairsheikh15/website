import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    fullWidth?: boolean;
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', fullWidth = false, asChild = false, children, ...props }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
        
        const variants = {
            default: 'bg-primary text-white hover:bg-primary-hover shadow-subtle hover:shadow-medium active:shadow-sm',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-subtle hover:shadow-medium active:shadow-sm',
            outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline'
        };

        const sizes = {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10'
        };

        if (asChild) {
            return (
                <div
                    className={cn(
                        baseClasses,
                        variants[variant],
                        sizes[size],
                        fullWidth && 'w-full',
                        className
                    )}
                >
                    {children}
                </div>
            );
        }

        return (
            <button
                className={cn(
                    baseClasses,
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export default Button;