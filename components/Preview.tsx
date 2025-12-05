'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // or your preferred style

interface PreviewProps {
  content: string;
  id?: string;
}

export default function Preview({ content, id }: PreviewProps) {
  return (
    <div 
      id={id}
      className="markdown-body w-full max-w-[210mm] mx-auto min-h-[297mm] p-[15mm] bg-white text-black shadow-lg page-break-markers"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
