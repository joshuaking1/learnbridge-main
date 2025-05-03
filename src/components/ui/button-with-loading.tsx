import * as React from "react";
import { Button as BaseButton, ButtonProps } from "./button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonWithLoadingProps extends ButtonProps {
    loading?: boolean;
}

const ButtonWithLoading = React.forwardRef<HTMLButtonElement, ButtonWithLoadingProps>(
    ({ children, loading, disabled, className, ...props }, ref) => {
        return (
            <BaseButton
                ref={ref}
                disabled={loading || disabled}
                className={cn("relative", className)}
                {...props}
            >
                {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {children}
            </BaseButton>
        );
    }
);

ButtonWithLoading.displayName = "ButtonWithLoading";

export { ButtonWithLoading };