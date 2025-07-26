/**
 * Composant FormBuilder réutilisable
 * Générateur de formulaires avec validation automatique
 */

import React, { useState, useCallback } from "react";
import { useForm, FieldValues, Path, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Switch } from "./switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

import { Separator } from "./separator";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { format } from "date-fns";
// import { fr } from 'date-fns/locale';

// Types pour les champs de formulaire
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "switch"
  | "date"
  | "file"
  | "array"
  | "object"
  | "custom";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FormFieldConfig {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  options?: SelectOption[];
  multiple?: boolean;
  accept?: string; // Pour les fichiers
  min?: number;
  max?: number;
  step?: number;
  rows?: number; // Pour textarea
  className?: string;
  validation?: z.ZodSchema<unknown>;
  defaultValue?: unknown;
  dependsOn?: string; // Nom du champ dont dépend ce champ
  showWhen?: (values: Record<string, unknown>) => boolean; // Condition pour afficher le champ
  transform?: (value: unknown) => unknown; // Transformation de la valeur
  render?: (props: Record<string, unknown>) => React.ReactNode; // Rendu personnalisé
  arrayConfig?: {
    itemSchema: FormFieldConfig[];
    addButtonText?: string;
    removeButtonText?: string;
    minItems?: number;
    maxItems?: number;
  };
  objectConfig?: {
    fields: FormFieldConfig[];
  };
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormBuilderProps {
  schema: z.AnyZodObject;
  fields?: FormFieldConfig[];
  sections?: FormSection[];
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  showResetButton?: boolean;
  resetText?: string;
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
  spacing?: "sm" | "md" | "lg";
}

export function FormBuilder({
  schema,
  fields = [],
  sections = [],
  defaultValues,
  onSubmit,
  onCancel,
  submitText = "Enregistrer",
  cancelText = "Annuler",
  loading = false,
  disabled = false,
  className,
  title,
  description,
  showResetButton = false,
  resetText = "Réinitialiser",
  layout = "vertical",
  columns = 1,
  spacing = "md",
}: FormBuilderProps) {
  type FormData = z.infer<typeof schema>;
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as Partial<FormData> | undefined,
    mode: "onChange",
  });

  const { handleSubmit, control, watch, reset, formState } = form;
  const watchedValues = watch();

  const togglePasswordVisibility = useCallback((fieldName: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  }, []);

  const toggleSection = useCallback((sectionTitle: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  }, []);

  const renderFieldControl = useCallback(
    (
      field: FormFieldConfig,
      formField: {
        value: unknown;
        onChange: (value: unknown) => void;
        onBlur: () => void;
        name: string;
      }
    ) => {
      const commonProps = {
        disabled: disabled || field.disabled || loading,
        placeholder: field.placeholder,
      };

      switch (field.type) {
        case "text":
        case "email":
          return (
            <Input
              {...formField}
              {...commonProps}
              type={field.type}
              value={typeof formField.value === "string" ? formField.value : ""}
              onChange={(e) => formField.onChange(e.target.value)}
            />
          );

        case "password":
          return (
            <div className="relative">
              <Input
                {...formField}
                {...commonProps}
                type={showPasswords[field.name] ? "text" : "password"}
                className="pr-10"
                value={
                  typeof formField.value === "string" ? formField.value : ""
                }
                onChange={(e) => formField.onChange(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility(field.name)}
              >
                {showPasswords[field.name] ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          );

        case "number":
          return (
            <Input
              {...formField}
              {...commonProps}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              value={typeof formField.value === "number" ? formField.value : ""}
              onChange={(e) => formField.onChange(e.target.valueAsNumber || 0)}
            />
          );

        case "textarea":
          return (
            <Textarea
              {...formField}
              {...commonProps}
              rows={field.rows || 3}
              value={typeof formField.value === "string" ? formField.value : ""}
              onChange={(e) => formField.onChange(e.target.value)}
            />
          );

        case "select":
          return (
            <Select
              value={
                typeof formField.value === "string" ||
                typeof formField.value === "number"
                  ? String(formField.value)
                  : ""
              }
              onValueChange={formField.onChange}
              disabled={commonProps.disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={String(option.value)}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case "multiselect":
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option.value}`}
                    checked={
                      Array.isArray(formField.value)
                        ? formField.value.includes(option.value)
                        : false
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const currentValue = Array.isArray(formField.value)
                        ? formField.value
                        : [];
                      if (e.target.checked) {
                        formField.onChange([...currentValue, option.value]);
                      } else {
                        formField.onChange(
                          currentValue.filter(
                            (v: unknown) => v !== option.value
                          )
                        );
                      }
                    }}
                    disabled={commonProps.disabled || option.disabled}
                  />
                  <Label htmlFor={`${field.name}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          );

        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={
                  typeof formField.value === "boolean" ? formField.value : false
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  formField.onChange(e.target.checked)
                }
                disabled={commonProps.disabled}
              />
              <Label htmlFor={field.name}>{field.label}</Label>
            </div>
          );

        case "radio":
          return (
            <RadioGroup
              value={typeof formField.value === "string" ? formField.value : ""}
              onValueChange={formField.onChange}
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(option.value)}
                    id={`${field.name}-${option.value}`}
                    disabled={option.disabled}
                  />
                  <Label htmlFor={`${field.name}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );

        case "switch":
          return (
            <div className="flex items-center space-x-2">
              <Switch
                id={field.name}
                checked={
                  typeof formField.value === "boolean" ? formField.value : false
                }
                onCheckedChange={formField.onChange}
                disabled={commonProps.disabled}
              />
              <Label htmlFor={field.name}>{field.label}</Label>
            </div>
          );

        case "date":
          return (
            <div className="relative">
              <Input
                {...formField}
                {...commonProps}
                type="date"
                value={
                  formField.value && typeof formField.value === "string"
                    ? format(new Date(formField.value), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  formField.onChange(
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          );

        case "file":
          return (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept={field.accept}
                  multiple={field.multiple}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    formField.onChange(
                      field.multiple ? files : files[0] || null
                    );
                  }}
                  disabled={commonProps.disabled}
                  className="hidden"
                  id={`file-${field.name}`}
                />
                <Label
                  htmlFor={`file-${field.name}`}
                  className="flex items-center space-x-2 cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md"
                >
                  <UploadIcon className="h-4 w-4" />
                  <span>Choisir un fichier</span>
                </Label>
              </div>
              {formField.value ? (
                <div className="text-sm text-muted-foreground">
                  {Array.isArray(formField.value)
                    ? `${formField.value.length} fichier(s) sélectionné(s)`
                    : typeof formField.value === "object" &&
                        formField.value &&
                        "name" in formField.value
                      ? (formField.value as File).name
                      : "Fichier sélectionné"}
                </div>
              ) : null}
            </div>
          );

        case "array":
          return renderArrayField(field, {
            value: Array.isArray(formField.value)
              ? (formField.value as Record<string, unknown>[])
              : [],
            onChange: (value: Record<string, unknown>[]) =>
              formField.onChange(value),
          });

        case "object":
          return renderObjectField(field, {
            value:
              formField.value &&
              typeof formField.value === "object" &&
              !Array.isArray(formField.value)
                ? (formField.value as Record<string, unknown>)
                : {},
            onChange: (value: Record<string, unknown>) =>
              formField.onChange(value),
          });

        default:
          return (
            <Input
              {...formField}
              value={
                typeof formField.value === "string" ||
                typeof formField.value === "number"
                  ? formField.value
                  : ""
              }
              {...commonProps}
            />
          );
      }
    },
    [showPasswords, togglePasswordVisibility]
  );

  const renderField = useCallback(
    (field: FormFieldConfig) => {
      // Vérifier les conditions d'affichage
      if (field.hidden) return null;
      if (field.showWhen && !field.showWhen(watchedValues)) return null;

      return (
        <FormField
          key={field.name}
          control={control}
          name={field.name as Path<FormData>}
          render={({ field: formField }) => {
            // Rendu personnalisé
            if (field.render) {
              return field.render({ field: formField, form });
            }

            return (
              <FormItem className={cn(field.className)}>
                <FormLabel
                  className={cn(
                    field.required &&
                      'after:content-["*"] after:ml-0.5 after:text-red-500'
                  )}
                >
                  {field.label}
                </FormLabel>
                <FormControl>
                  {renderFieldControl(field, formField)}
                </FormControl>
                {field.description && (
                  <FormDescription className="flex items-start space-x-2">
                    <InfoIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>{field.description}</span>
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    },
    [control, watchedValues, form, renderFieldControl]
  );

  const renderArrayField = (
    field: FormFieldConfig,
    formField: {
      value: Record<string, unknown>[];
      onChange: (value: Record<string, unknown>[]) => void;
    }
  ) => {
    const items = Array.isArray(formField.value) ? formField.value : [];
    const { arrayConfig } = field;

    const addItem = () => {
      const newItem =
        arrayConfig?.itemSchema.reduce(
          (acc, itemField) => {
            acc[itemField.name] = itemField.defaultValue || "";
            return acc;
          },
          {} as Record<string, unknown>
        ) || {};
      formField.onChange([...items, newItem]);
    };

    const removeItem = (index: number) => {
      formField.onChange(items.filter((_, i: number) => i !== index));
    };

    const updateItem = (index: number, itemData: Record<string, unknown>) => {
      const newItems = [...items];
      newItems[index] = itemData;
      formField.onChange(newItems);
    };

    return (
      <div className="space-y-4">
        {items.map((item: Record<string, unknown>, index: number) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Élément {index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= (arrayConfig?.minItems || 0)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {arrayConfig?.itemSchema.map((itemField) => (
                <div key={itemField.name}>
                  <Label>{itemField.label}</Label>
                  <Input
                    value={String(item[itemField.name] || "")}
                    onChange={(e) => {
                      const newItem = {
                        ...item,
                        [itemField.name]: e.target.value,
                      };
                      updateItem(index, newItem);
                    }}
                    placeholder={itemField.placeholder}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          disabled={items.length >= (arrayConfig?.maxItems || Infinity)}
          className="w-full"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {arrayConfig?.addButtonText || "Ajouter un élément"}
        </Button>
      </div>
    );
  };

  const renderObjectField = (
    field: FormFieldConfig,
    formField: {
      value: Record<string, unknown>;
      onChange: (value: Record<string, unknown>) => void;
    }
  ) => {
    const { objectConfig } = field;
    const value =
      formField.value &&
      typeof formField.value === "object" &&
      !Array.isArray(formField.value)
        ? (formField.value as Record<string, unknown>)
        : {};

    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          {objectConfig?.fields.map((objectField) => (
            <div key={objectField.name}>
              <Label>{objectField.label}</Label>
              <Input
                value={String(value[objectField.name] || "")}
                onChange={(e) => {
                  formField.onChange({
                    ...value,
                    [objectField.name]: e.target.value,
                  });
                }}
                placeholder={objectField.placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderFields = () => {
    if (sections.length > 0) {
      return sections.map((section) => {
        const isCollapsed =
          collapsedSections[section.title] ?? section.defaultCollapsed;

        return (
          <Card key={section.title}>
            <CardHeader
              className={cn(section.collapsible && "cursor-pointer", "pb-3")}
              onClick={
                section.collapsible
                  ? () => toggleSection(section.title)
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
                {section.collapsible && (
                  <Button variant="ghost" size="sm">
                    {isCollapsed ? "Développer" : "Réduire"}
                  </Button>
                )}
              </div>
            </CardHeader>
            {!isCollapsed && (
              <CardContent className="space-y-4">
                <div
                  className={cn(
                    layout === "grid" && `grid gap-4`,
                    layout === "grid" && columns > 1 && `grid-cols-${columns}`,
                    spacing === "sm" && "space-y-2",
                    spacing === "md" && "space-y-4",
                    spacing === "lg" && "space-y-6"
                  )}
                >
                  {section.fields.map(renderField)}
                </div>
              </CardContent>
            )}
          </Card>
        );
      });
    }

    return (
      <div
        className={cn(
          layout === "grid" && `grid gap-4`,
          layout === "grid" && columns > 1 && `grid-cols-${columns}`,
          spacing === "sm" && "space-y-2",
          spacing === "md" && "space-y-4",
          spacing === "lg" && "space-y-6"
        )}
      >
        {fields.map(renderField)}
      </div>
    );
  };

  const onSubmitHandler = async (data: FormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
          {renderFields()}

          <Separator />

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              {showResetButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={loading || disabled}
                >
                  {resetText}
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || disabled || !formState.isValid}
                className="min-w-[120px]"
              >
                {loading ? "Chargement..." : submitText}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FormBuilder;
