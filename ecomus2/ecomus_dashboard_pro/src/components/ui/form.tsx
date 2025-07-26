// src/components/ui/form.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface FormProps extends React.ComponentProps<"form"> {}

export interface FormFieldProps {
  name: string;
  control?: unknown;
  render: ({ field }: { field: { name: string; value: unknown; onChange: (value: unknown) => void; onBlur: () => void } }) => React.ReactNode;
}

export interface FormItemProps extends React.ComponentProps<"div"> {}

export interface FormLabelProps extends React.ComponentProps<typeof Label> {}

export interface FormControlProps extends React.ComponentProps<"div"> {}

export interface FormDescriptionProps extends React.ComponentProps<"p"> {}

export interface FormMessageProps extends React.ComponentProps<"p"> {}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn("space-y-6", className)}
        {...props}
      />
    );
  }
);
Form.displayName = "Form";

export const FormField: React.FC<FormFieldProps> = ({ name, control, render }) => {
  // Simplified form field implementation
  const field = {
    name,
    value: "",
    onChange: () => {},
    onBlur: () => {},
  };
  
  return <>{render({ field })}</>;
};

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    );
  }
);
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FormLabelProps
>(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      />
    );
  }
);
FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      />
    );
  }
);
FormMessage.displayName = "FormMessage";

export default Form;