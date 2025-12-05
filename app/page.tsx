'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import ThemeSelector from '@/components/ThemeSelector';
import { Theme } from '@/types/theme';
import { Download, Upload, FileText, Settings } from 'lucide-react';

const INITIAL_MARKDOWN = `# Markdown to PDF

Welcome to this **Markdown to PDF** converter!

## Features
- **Real-time Preview**: See changes as you type.
- **Multiple Themes**: Switch between Classic, Tech, and Minimal.
- **Professional Output**: Generates high-quality PDFs.

## Code Example
\`\`\`javascript
const greet = (name) => {
  return \`Hello, \${name}!\`;
};
\`\`\`

## Lists
- Item 1
- Item 2
  - Sub-item A

> "The best way to predict the future is to invent it."
`;

export default function Home() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [theme, setTheme] = useState<Theme>('classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverPage, setCoverPage] = useState({ title: '', author: '' });
  const [showCoverSettings, setShowCoverSettings] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Persistence
  useEffect(() => {
    const savedMarkdown = localStorage.getItem('md2pdf_markdown');
    const savedTheme = localStorage.getItem('md2pdf_theme') as Theme;
    if (savedMarkdown) setMarkdown(savedMarkdown);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('md2pdf_markdown', markdown);
  }, [markdown]);

  useEffect(() => {
    localStorage.setItem('md2pdf_theme', theme);
  }, [theme]);

  const handleExportHtml = () => {
    const previewElement = document.getElementById('preview-content');
    if (!previewElement) return;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Document</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <style>
    body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px; }
    @media (prefers-color-scheme: dark) { body { background-color: #0d1117; } }
  </style>
</head>
<body class="markdown-body">
${previewElement.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInsert = (prefix: string, suffix: string = '') => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selection}${suffix}${after}`;
    setMarkdown(newText);

    // Restore focus and selection
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, theme, coverPage }),
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setMarkdown(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950" data-theme={theme}>
      {/* Header */}
      <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6 z-10 relative">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">MD2PDF</h1>
        </div>

        <div className="flex items-center space-x-6">
           <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
           
             <button
                onClick={() => setShowCoverSettings(!showCoverSettings)}
                className={`p-2 rounded-lg transition-colors ${showCoverSettings ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                title="Page Settings"
             >
                <Settings className="w-5 h-5" />
             </button>

             <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

           <div className="flex items-center space-x-3">
             <label className="cursor-pointer text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center space-x-2 transition-colors">
               <Upload className="w-4 h-4" />
               <span className="hidden sm:inline">Import</span>
               <input type="file" accept=".md" className="hidden" onChange={handleFileUpload} />
             </label>

             <button
                onClick={handleExportHtml}
                className="hidden md:flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors text-sm font-medium px-2"
                title="Export HTML"
             >
                <div className="flex items-center space-x-1">
                  <span className="text-xs border border-current rounded px-1">HTML</span>
                </div>
             </button>

             <button
               onClick={handleDownload}
               disabled={isGenerating}
               className="flex items-center space-x-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
             >
               {isGenerating ? (
                 <>
                   <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   <span>Generating...</span>
                 </>
               ) : (
                 <>
                   <Download className="w-4 h-4" />
                   <span className="hidden sm:inline">Export PDF</span>
                 </>
               )}
             </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div className="w-1/2 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-900 transition-colors">
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                 <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider flex justify-between items-center">
                    <span>Markdown Input</span>
                    <span className="text-[10px] text-neutral-400">Auto-saved</span>
                 </div>
                 {showCoverSettings && (
                     <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-4">
                        <input
                           type="text"
                           placeholder="Document Title"
                           value={coverPage.title}
                           onChange={(e) => setCoverPage({ ...coverPage, title: e.target.value })}
                           className="px-3 py-1.5 text-sm rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                         <input
                           type="text"
                           placeholder="Author Name"
                           value={coverPage.author}
                           onChange={(e) => setCoverPage({ ...coverPage, author: e.target.value })}
                           className="px-3 py-1.5 text-sm rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                 )}
            </div>
            <div className="flex-1 relative overflow-hidden">
                <Editor ref={editorRef} value={markdown} onChange={setMarkdown} />
            </div>
        </div>

        {/* Preview Pane */}
        <div className="w-1/2 flex flex-col bg-neutral-100 dark:bg-neutral-950">
             <div className="bg-neutral-100 dark:bg-neutral-950 px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 flex justify-between">
                <span>Live Preview</span>
             </div>
             <div className="flex-1 overflow-auto p-8 flex justify-center">
                 <Preview content={markdown} id="preview-content" />
             </div>
        </div>
      </main>
    </div>
  );
}
