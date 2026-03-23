import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[120px] rounded-md border bg-muted animate-pulse" /> },
);

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "textarea" | "select" | "richtext";
  value: string | number;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  options,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {type === "richtext" ? (
        <RichTextEditor
          value={String(value)}
          onChange={(html) => {
            // Simulate a change event so the parent's onChange works
            const syntheticEvent = {
              target: { name, value: html },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
          }}
          placeholder={placeholder}
        />
      ) : type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : type === "select" && options ? (
        <Select
          id={name}
          name={name}
          value={String(value)}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
