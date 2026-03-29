import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-invert max-w-none prose-headings:font-display prose-p:text-ink-200 prose-headings:text-ink-50 prose-strong:text-ink-100 prose-a:text-ember-500 prose-a:no-underline hover:prose-a:underline prose-li:text-ink-200"
      components={{
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-ember-500/60 pl-5 italic text-ink-300">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
