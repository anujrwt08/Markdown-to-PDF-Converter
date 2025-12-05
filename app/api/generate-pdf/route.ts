import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

// We duplicate the CSS here to ensure the PDF renders identically to the preview.
// In a production app, we might read this from the filesystem or use a shared CSS-in-JS solution.
const BASE_CSS = `
:root {
  --background: #ffffff;
  --foreground: #171717;
  --border: #e5e7eb;
}

[data-theme='tech'] {
  --background: #0f172a;
  --foreground: #f8fafc;
  --border: #1e293b;
}

[data-theme="cheatsheet"] {
  --background: #ffffff;
  --foreground: #333333;
  --accent: #6366f1;
  --accent-foreground: #ffffff;
  --border: #e2e8f0;
}

[data-theme="cheatsheet"] .markdown-body h1 {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5em;
  font-weight: 700;
  color: #1f2937;
}

[data-theme="cheatsheet"] .markdown-body h2 {
  display: flex;
  align-items: center;
  border-bottom: none;
  font-size: 1.5em;
  margin-top: 1.5em;
  color: #374151;
}

[data-theme="cheatsheet"] .markdown-body h2::before {
  content: '';
  display: inline-block;
  width: 0.8em;
  height: 0.8em;
  margin-right: 0.5em;
  border-radius: 4px;
  background-color: #3b82f6; 
}

[data-theme="cheatsheet"] .markdown-body h2:nth-of-type(4n+1)::before { background-color: #3b82f6; }
[data-theme="cheatsheet"] .markdown-body h2:nth-of-type(4n+2)::before { background-color: #10b981; }
[data-theme="cheatsheet"] .markdown-body h2:nth-of-type(4n+3)::before { background-color: #f59e0b; }
[data-theme="cheatsheet"] .markdown-body h2:nth-of-type(4n+4)::before { background-color: #8b5cf6; }

[data-theme="cheatsheet"] .markdown-body pre {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-family: 'Consolas', 'Monaco', monospace; 
}

[data-theme="cheatsheet"] .markdown-body code {
  color: #e11d48; 
  background-color: rgba(225, 29, 72, 0.1);
}

[data-theme="cheatsheet"] .markdown-body pre code {
  color: inherit;
  background-color: transparent;
}

[data-theme='minimal'] {
  --background: #ffffff;
  --foreground: #333333;
  --border: transparent;
}

body {
  margin: 0;
  padding: 0;
  background: white; /* PDF background is usually white */
  color: var(--foreground);
  font-family: sans-serif;
  -webkit-print-color-adjust: exact;
}

.markdown-body {
  max-width: 210mm;
  margin: 0 auto;
  padding: 20mm;
  line-height: 1.6;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 2.25em; padding-bottom: 0.3em; border-bottom: 1px solid var(--border); }
.markdown-body h2 { font-size: 1.75em; padding-bottom: 0.3em; border-bottom: 1px solid var(--border); }

.markdown-body p { margin-bottom: 1em; }
.markdown-body ul, .markdown-body ol { margin-bottom: 1em; padding-left: 2em; }
.markdown-body li + li { margin-top: 0.25em; }

.markdown-body code {
  padding: 0.2em 0.4em;
  font-size: 85%;
  background-color: rgba(0,0,0,0.05); /* slightly visible grey */
  border-radius: 6px;
  font-family: monospace;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa; /* github light grey */
  border-radius: 6px;
  margin-bottom: 1em;
}
[data-theme='tech'] .markdown-body pre { background-color: #1e293b; color: #f8fafc; }

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-body blockquote {
  padding: 0 1em;
  border-left: 0.25em solid #d0d7de;
  color: #656d76;
  margin-bottom: 1em;
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}
.markdown-body th, .markdown-body td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}
.markdown-body tr:nth-child(2n) {
  background-color: #ffffff;
}
`;

export async function POST(req: Request) {
  try {
    const { markdown, theme, coverPage } = await req.json();

    // Convert Markdown to HTML
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(markdown);
    const contentHtml = processedContent.toString();

    let coverHtml = '';
    if (coverPage && (coverPage.title || coverPage.author)) {
       coverHtml = `
         <div class="cover-page">
            <div class="cover-content">
              ${coverPage.title ? `<h1>${coverPage.title}</h1>` : ''}
              ${coverPage.author ? `<p class="author">${coverPage.author}</p>` : ''}
              <p class="date">${new Date().toLocaleDateString()}</p>
            </div>
         </div>
       `;
    }

    // Construct full HTML document
    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${BASE_CSS}
            .cover-page {
              height: 297mm; /* A4 height */
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              page-break-after: always;
            }
            .cover-content h1 {
              font-size: 3em;
              margin-bottom: 0.5em;
              border-bottom: none;
            }
            .cover-content .author {
              font-size: 1.5em;
              color: var(--foreground);
              opacity: 0.8;
            }
            .cover-content .date {
              margin-top: 2em;
              color: var(--foreground);
              opacity: 0.6;
            }
            /* Increased code font size as requested */
            .markdown-body pre, .markdown-body code {
               font-size: 95% !important; 
            }
          </style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
        </head>
        <body data-theme="${theme}">
          ${coverHtml}
          <div class="markdown-body">
            ${contentHtml}
          </div>
        </body>
      </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm', // We handle margins in CSS padding
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
