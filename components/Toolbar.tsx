'use client';

import { Bold, Italic, List, ListOrdered, Code, Heading1, Heading2, Quote, Link } from 'lucide-react';
import clsx from 'clsx';

interface ToolbarProps {
  onInsert: (prefix: string, suffix?: string) => void;
}

export default function Toolbar({ onInsert }: ToolbarProps) {
  const tools = [
    { icon: Bold, label: 'Bold', action: () => onInsert('**', '**') },
    { icon: Italic, label: 'Italic', action: () => onInsert('*', '*') },
    { icon: Heading1, label: 'H1', action: () => onInsert('# ', '') },
    { icon: Heading2, label: 'H2', action: () => onInsert('## ', '') },
    { icon: List, label: 'List', action: () => onInsert('- ', '') },
    { icon: ListOrdered, label: 'Ordered List', action: () => onInsert('1. ', '') },
    { icon: Quote, label: 'Quote', action: () => onInsert('> ', '') },
    { icon: Code, label: 'Code', action: () => onInsert('```\n', '\n```') },
    { icon: Link, label: 'Link', action: () => onInsert('[', '](url)') },
  ];

  return (
    <div className="flex items-center space-x-1 p-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-x-auto">
      {tools.map((tool, index) => (
        <button
          key={index}
          onClick={tool.action}
          className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          title={tool.label}
        >
          <tool.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
