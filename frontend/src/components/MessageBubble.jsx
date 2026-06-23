import { useState } from 'react';

/* ── Syntax highlighter — single-pass tokenizer (no regex corruption) ── */
function highlight(code, lang) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const KW = {
    python:     new Set(['def','class','import','from','return','if','elif','else','for','while','in','not','and','or','True','False','None','with','as','try','except','finally','pass','break','continue','lambda','yield','global','nonlocal','del','raise','assert','is']),
    javascript: new Set(['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','class','import','export','default','from','async','await','try','catch','finally','typeof','instanceof','null','undefined','true','false','of','in','throw','yield']),
    java:       new Set(['public','private','protected','static','void','int','long','double','float','boolean','char','byte','short','String','new','return','if','else','for','while','do','switch','case','break','continue','class','interface','extends','implements','import','package','try','catch','finally','throw','throws','null','true','false','final','abstract','super','this']),
  };
  const kws = KW[lang] || KW.python;
  const out = [];
  let i = 0;

  while (i < code.length) {
    // Single-line comment (// or #)
    if ((code[i] === '/' && code[i+1] === '/') || code[i] === '#') {
      const end = code.indexOf('\n', i);
      const tok = end === -1 ? code.slice(i) : code.slice(i, end);
      out.push(`<span class="hl-comment">${esc(tok)}</span>`);
      i += tok.length;
      continue;
    }
    // String literal
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let j = i + 1;
      while (j < code.length && code[j] !== q && code[j] !== '\n') {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < code.length && code[j] === q) j++;
      out.push(`<span class="hl-str">${esc(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    // Identifier or keyword
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      out.push(kws.has(word) ? `<span class="hl-kw">${esc(word)}</span>` : esc(word));
      i = j;
      continue;
    }
    // Number
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      out.push(`<span class="hl-num">${esc(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    // Everything else
    out.push(esc(code[i]));
    i++;
  }
  return out.join('');
}

/* ── Code block with copy button ────────────────────────────────────── */
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = highlight(code, lang?.toLowerCase());

  return (
    <div className="msg-code-wrap">
      <div className="msg-code-header">
        <span className="msg-code-lang">{lang || 'code'}</span>
        <button className="msg-code-copy" onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="msg-code-block">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

/* ── Inline content renderer ────────────────────────────────────────── */
function renderContent(content) {
  // Split on fenced code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines = part.slice(3, -3).split('\n');
      const lang  = lines[0].trim();
      const code  = lines.slice(1).join('\n').trimEnd();
      return <CodeBlock key={i} lang={lang} code={code} />;
    }

    // Within plain text: handle inline `code` and newlines
    const segments = part.split(/(`[^`]+`)/g);
    return (
      <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
        {segments.map((seg, j) =>
          seg.startsWith('`') && seg.endsWith('`')
            ? <code key={j} className="msg-inline-code">{seg.slice(1, -1)}</code>
            : seg
        )}
      </span>
    );
  });
}

/* ── Component ──────────────────────────────────────────────────────── */
export default function MessageBubble({ role, content }) {
  const isAI = role === 'assistant';
  return (
    <div className={`bubble-row ${isAI ? 'bubble-row-ai' : 'bubble-row-user'}`}>
      <div className={`bubble ${isAI ? 'bubble-ai' : 'bubble-user'}`}>
        {isAI && <span className="bubble-icon">🤖</span>}
        <div className="bubble-content">{renderContent(content)}</div>
      </div>
    </div>
  );
}
