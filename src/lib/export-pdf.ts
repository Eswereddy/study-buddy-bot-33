/**
 * Export markdown content as a styled PDF using the browser print dialog.
 */
export function exportToPdf(title: string, markdownHtml: string) {
  const win = window.open("", "_blank");
  if (!win) {
    throw new Error("Pop-up blocked. Please allow pop-ups to export PDFs.");
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1a1a1a;
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 32px;
      line-height: 1.7;
      font-size: 14px;
    }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #888; margin-bottom: 32px; }
    h2 { font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 8px; }
    h3 { font-size: 16px; font-weight: 600; margin-top: 20px; margin-bottom: 6px; }
    p { margin-bottom: 12px; }
    ul, ol { margin-bottom: 12px; padding-left: 24px; }
    li { margin-bottom: 4px; }
    code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    pre { background: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #d4d4d8; padding-left: 16px; color: #555; margin-bottom: 12px; }
    strong { font-weight: 600; }
    hr { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
    @media print {
      body { padding: 0; }
      @page { margin: 1in; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Exported from StudyAI · ${new Date().toLocaleDateString()}</p>
  <hr />
  ${markdownHtml}
</body>
</html>`);
  win.document.close();
  setTimeout(() => win.print(), 300);
}
