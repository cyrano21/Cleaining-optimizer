"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  country?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, country = "FR", ...props }, ref) => {
    const [formattedValue, setFormattedValue] = React.useState("");

    // Formats spécifiques par pays
    const phoneFormats = {
      FR: {
        placeholder: "+33 6 XX XX XX XX",
        prefix: "+33",
        pattern: /^(\+33|0)[1-9](\d{8})$/,
        format: (val: string) => {
          // Supprimer tous les caractères non numériques
          const numbers = val.replace(/\D/g, "");
          
          // Si commence par 0, remplacer par +33
          let formatted = numbers;
          if (numbers.startsWith("0")) {
            formatted = "33" + numbers.slice(1);
          }
          if (!numbers.startsWith("33") && !numbers.startsWith("+33")) {
            formatted = "33" + formatted;
          }
          if (formatted.startsWith("33")) {
            formatted = "+33" + formatted.slice(2);
          }
          
          // Formater selon le pattern français
          if (formatted.length >= 3) {
            const cleaned = formatted.replace("+33", "");
            if (cleaned.length <= 9) {
              let result = "+33";
              if (cleaned.length > 0) result += " " + cleaned[0];
              if (cleaned.length > 1) result += " " + cleaned.slice(1, 3);
              if (cleaned.length > 3) result += " " + cleaned.slice(3, 5);
              if (cleaned.length > 5) result += " " + cleaned.slice(5, 7);
              if (cleaned.length > 7) result += " " + cleaned.slice(7, 9);
              return result;
            }
          }
          
          return formatted;
        }
      },
      US: {
        placeholder: "+1 (XXX) XXX-XXXX",
        prefix: "+1",
        pattern: /^\+1\d{10}$/,
        format: (val: string) => {
          const numbers = val.replace(/\D/g, "");
          if (numbers.length <= 10) {
            let result = "+1";
            if (numbers.length > 0) result += " (" + numbers.slice(0, 3);
            if (numbers.length > 3) result += ") " + numbers.slice(3, 6);
            if (numbers.length > 6) result += "-" + numbers.slice(6, 10);
            return result;
          }
          return val;
        }
      }
    };

    const currentFormat = phoneFormats[country as keyof typeof phoneFormats] || phoneFormats.FR;

    React.useEffect(() => {
      if (value) {
        setFormattedValue(currentFormat.format(value));
      }
    }, [value, currentFormat]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = currentFormat.format(inputValue);
      
      setFormattedValue(formatted);
      
      // Retourner la valeur nettoyée à la fonction onChange parent
      if (onChange) {
        // Nettoyer le numéro pour le stockage (garder seulement les chiffres et le +)
        const cleaned = formatted.replace(/\s|\(|\)|\-/g, "");
        onChange(cleaned);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permettre les touches de navigation et suppression
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "Tab" ||
        e.key === "Escape" ||
        e.key === "Enter" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        return;
      }

      // Permettre Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x")) {
        return;
      }

      // Permettre seulement les chiffres et le signe +
      if (!/[\d+]/.test(e.key)) {
        e.preventDefault();
      }
    };

    const validatePhoneNumber = (phone: string) => {
      const cleaned = phone.replace(/\s|\(|\)|\-/g, "");
      return currentFormat.pattern.test(cleaned);
    };

    const isValid = formattedValue ? validatePhoneNumber(formattedValue) : true;

    return (
      <div className="relative">
        <input
          type="tel"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !isValid && formattedValue && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          placeholder={currentFormat.placeholder}
          value={formattedValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={ref}
          {...props}
        />
        {!isValid && formattedValue && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-500">
            Format invalide. Ex: {currentFormat.placeholder}
          </div>
        )}
        {isValid && formattedValue && (
          <div className="absolute -right-2 top-2 text-green-500">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
