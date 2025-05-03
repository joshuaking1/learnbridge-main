import { forwardRef } from "react";
import { Label, LabelProps } from "./label";

export interface CustomLabelProps extends LabelProps {
    children: React.ReactNode;
}

const CustomLabel = forwardRef<HTMLLabelElement, CustomLabelProps>(
    ({ children, ...props }, ref) => {
        return (
            <Label ref={ref} {...props}>
                {children}
            </Label>
        );
    }
);

CustomLabel.displayName = "CustomLabel";

export { CustomLabel };