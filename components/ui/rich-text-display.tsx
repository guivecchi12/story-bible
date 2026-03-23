import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  if (!content) return null;

  // Check if content contains HTML tags
  const isHTML = /<[^>]+>/.test(content);

  if (!isHTML) {
    return <p className={cn("text-sm whitespace-pre-wrap", className)}>{content}</p>;
  }

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  );
}
