'use client';

import { forwardRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange }, ref) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900">
      <div className="flex-1 relative">
        <textarea
          ref={ref}
          className="w-full h-full p-6 resize-none bg-transparent outline-none font-mono text-sm leading-relaxed text-neutral-800 dark:text-neutral-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Start typing your markdown here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
