import { useState } from 'react';

/* ── Simple syntax highlighter ─────────────────────────────────────── */
function highlight(code, lang) {
  const escape = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let s = escape(code);

  const kwMap = {
    python:     /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|with|as|try|except|finally|pass|break|continue|lambda|yield|global|nonlocal|del|raise|assert|is)\b/g,
    javascript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|import|export|default|from|async|await|try|catch|finally|typeof|instanceof|null|undefined|true|false|of|in|throw|yield)\b/g,
    java:       /\b(public|private|protected|static|void|int|long|double|float|boolean|char|byte|short|String|new|return|if|else|for|while|do|switch|case|break|continue|class|interface|extends|implements|import|package|try|catch|finally|throw|throws|null|true|false|final|abstract|super|this)\b/g,
  };

  const kw = kwMap[lang] || kwMap.python;
  s = s.replace(kw, '<span class="hl-kw">$1</span>');
  s = s.replace(/(&#34;[^&#]*&#34;|&#39;[^&#]*&#39;|`[^`]*`)/g, '<span class="hl-str">$1</span>');
  s = s.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="hl-str">$1</span>');
  s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-num">$1</span>');
  s = s.replace(/(\/\/[^\n]*|#[^\n]*)/g, '<span class="hl-comment">$1</span>');
  return s;
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
