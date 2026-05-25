import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-none text-[14px] leading-[1.65] text-ink-2",
        // Serif headings — the manual feel
        "[&_h1]:font-display [&_h1]:text-[28px] [&_h1]:leading-tight [&_h1]:text-ink [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:tracking-tight",
        "[&_h2]:font-display [&_h2]:text-[22px] [&_h2]:leading-tight [&_h2]:text-ink [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:tracking-tight",
        "[&_h3]:font-display [&_h3]:text-[18px] [&_h3]:leading-tight [&_h3]:text-ink [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:tracking-tight",
        // Body paragraphs
        "[&_p]:my-3 [&_p]:text-ink-2",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_em]:italic",
        // Lists
        "[&_ul]:my-3 [&_ul]:list-none [&_ul]:pl-0 [&_ul_li]:relative [&_ul_li]:pl-5",
        "[&_ul_li]:before:content-['—'] [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:text-ink-3",
        "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol_li]:my-1 [&_ol_li]:pl-1",
        "[&_li]:my-1 [&_li]:text-ink-2",
        "[&_li_p]:my-1",
        // Code
        "[&_code]:font-mono [&_code]:text-[12px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:bg-paper-3 [&_code]:border [&_code]:border-rule [&_code]:text-ink",
        "[&_pre]:my-4 [&_pre]:bg-paper-3 [&_pre]:border [&_pre]:border-rule [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-[12px]",
        "[&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0",
        // Tables — like specification tables
        "[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_table]:border-y [&_table]:border-rule-3 [&_table]:text-[12px]",
        "[&_th]:border-b [&_th]:border-rule [&_th]:py-2 [&_th]:px-3 [&_th]:text-left [&_th]:font-mono [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-ink-3 [&_th]:bg-paper-3",
        "[&_td]:border-b [&_td]:border-rule [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-ink-2",
        // Blockquote — like a callout from the manual
        "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-signal [&_blockquote]:pl-4 [&_blockquote]:text-ink-2 [&_blockquote]:italic [&_blockquote]:font-display",
        // Horizontal rule
        "[&_hr]:my-6 [&_hr]:border-rule-3",
        // Links
        "[&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-signal hover:[&_a]:decoration-2",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
