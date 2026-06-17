import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MessageBubble from '../components/MessageBubble';
import DifficultyPill from '../components/DifficultyPill';
import { getProblem } from '../services/problems';
import { createConversation, endConversation } from '../services/conversations';
import { sendMessage } from '../services/messages';

const LANGUAGES = ['python', 'javascript', 'java'];

const MENTOR_REPLIES = [
  "What's your first instinct when you see this problem?",
  "Good. What would be the time complexity of that approach?",
  "Can you think of a data structure that might help reduce that complexity?",
  "What edge cases should you consider here?",
  "How would your solution handle an empty input?",
  "You're thinking in the right direction. What's the space complexity?",
  "Try to explain your approach as if I had never seen this problem.",
  "What would happen if all elements in the array are the same?",
];

const STARTER = {
  python:     `def solution():\n    # Write your solution here\n    pass\n`,
  javascript: `function solution() {\n    // Write your solution here\n}\n`,
  java:       `class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}\n`,
};

export default function ProblemDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const bottomRef    = useRef(null);
  const replyIndex   = useRef(0);

  const [problem, setProblem]         = useState(null);
  const [convId, setConvId]           = useState(null);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [sending, setSending]         = useState(false);
  const [language, setLanguage]       = useState('python');
  const [code, setCode]               = useState(STARTER.python);
  const [activeTab, setActiveTab]     = useState('aristobot');
  const [elapsed, setElapsed]         = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  /* ---- Timer ---- */
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  /* ---- Load problem + create conversation ---- */
  useEffect(() => {
    async function init() {
      try {
        const prob = await getProblem(id);
        setProblem(prob);
        setCode(prob.starterCode?.[language] ?? STARTER[language]);

        const conv = await createConversation(Number(id), language);
        setConvId(conv.id);

        // Auto-send first AristoBot greeting
        const greeting = MENTOR_REPLIES[0];
        replyIndex.current = 1;
        await sendMessage(conv.id, 'assistant', greeting);
        setMessages([{ id: Date.now(), role: 'assistant', content: greeting }]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---- Scroll to bottom on new message ---- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Language change ---- */
  function handleLanguageChange(lang) {
    setLanguage(lang);
    setCode(problem?.starterCode?.[lang] ?? STARTER[lang]);
  }

  /* ---- Send user message + mocked reply ---- */
  async function handleSend() {
    if (!input.trim() || sending || !convId) return;
    const userText = input.trim();
    setInput('');
    setSending(true);

    const userMsg = { id: Date.now(), role: 'user', content: userText };
    setMessages(m => [...m, userMsg]);

    try {
      await sendMessage(convId, 'user', userText);

      // Mocked AristoBot reply
      const reply = MENTOR_REPLIES[replyIndex.current % MENTOR_REPLIES.length];
      replyIndex.current += 1;
      await sendMessage(convId, 'assistant', reply);
      setMessages(m => [...m, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(m => [...m, { id: Date.now() + 2, role: 'assistant', content: `(Error: ${err.message})` }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  /* ---- Submit ---- */
  async function handleSubmit() {
    if (!convId) return;
    try {
      await sendMessage(convId, 'user', `[Final submission]\n\`\`\`${language}\n${code}\n\`\`\``);
      await endConversation(convId);
    } catch { /* best-effort */ }
    navigate('/dashboard');
  }

  if (loading) return <div className="pd-loading"><div className="page-loader"><div className="page-loader-spinner" /><span className="page-loader-text">Loading problem…</span></div></div>;
  if (error)   return <div className="pd-loading error-text">{error}</div>;

  return (
    <div className="pd-root">
      {/* ---- Top bar ---- */}
      <div className="pd-topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>← Problems</button>
        <span className="pd-title">{problem?.title}</span>

        <select
          className="pd-lang-select"
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>

        <span className="pd-timer">🕐 {mm}:{ss}</span>

        <div className="pd-topbar-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Exit</button>
        </div>
      </div>

      {/* ---- Three panels ---- */}
      <div className="pd-panels">

        {/* LEFT — Description */}
        <div className="pd-panel pd-description">
          <div className="pd-desc-meta">
            <DifficultyPill difficulty={problem?.difficulty} />
            <span className="muted" style={{ fontSize: 'var(--text-sm)' }}>{problem?.topic} · {problem?.type}</span>
          </div>
          <h2 className="pd-problem-title">{problem?.title}</h2>
          <p className="pd-desc-text">{problem?.description}</p>

          {problem?.constraints && (
            <>
              <h3 className="pd-section-title">Constraints</h3>
              <p className="pd-desc-text muted">{problem.constraints}</p>
            </>
          )}

          {problem?.examples?.length > 0 && (
            <>
              <h3 className="pd-section-title">Examples</h3>
              {problem.examples.map((ex, i) => (
                <div key={i} className="pd-example">
                  <span className="subtle">Input:</span> {ex.input}<br />
                  <span className="subtle">Output:</span> {ex.output}
                  {ex.explanation && <><br /><span className="subtle">Explanation:</span> {ex.explanation}</>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* MIDDLE — Code editor + Test cases */}
        <div className="pd-panel pd-editor">
          <div className="pd-editor-top">
            <h3 className="pd-section-title" style={{ margin: 0 }}>Code</h3>
            <textarea
              className="pd-code-area"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const el = e.target;
                  const start = el.selectionStart;
                  const end = el.selectionEnd;
                  const next = code.substring(0, start) + '    ' + code.substring(end);
                  setCode(next);
                  requestAnimationFrame(() => {
                    el.selectionStart = el.selectionEnd = start + 4;
                  });
                }
              }}
              spellCheck={false}
            />
          </div>
          <div className="pd-tests">
            <h3 className="pd-section-title" style={{ margin: '0 0 10px' }}>Test Cases</h3>
            {problem?.testCases?.length > 0 ? (
              problem.testCases.map((tc, i) => (
                <div key={i} className="pd-test-case">
                  <span className="pd-test-label">{tc.label || `Case ${i + 1}`}</span>
                  <div className="pd-test-row"><span className="subtle">Input:</span> <code>{tc.stdin}</code></div>
                  <div className="pd-test-row"><span className="subtle">Expected:</span> <code>{tc.expected}</code></div>
                </div>
              ))
            ) : (
              <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>No test cases available.</p>
            )}
          </div>
        </div>

        {/* RIGHT — AristoBot */}
        <div className="pd-panel pd-chat">
          {/* Tabs */}
          <div className="pd-tabs">
            {['aristobot', 'guide'].map(tab => (
              <button
                key={tab}
                className={`pd-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'aristobot' ? 'AristoBot' : 'Guide'}
              </button>
            ))}
          </div>

          {activeTab === 'guide' ? (
            <div className="pd-guide-content">
              <p className="pd-desc-text">{problem?.description}</p>
            </div>
          ) : (
            <>
              {/* Chat messages */}
              <div className="pd-messages">
                {messages.length === 0 && (
                  <div className="pd-empty-state">
                    <div className="pd-bot-icon">🤖</div>
                    <p className="pd-bot-name">AristoBot</p>
                    <p className="muted" style={{ fontSize: 'var(--text-sm)', textAlign: 'center' }}>
                      I'll guide your thinking, but I won't give you the answer.
                    </p>
                  </div>
                )}
                {messages.map(msg => (
                  <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                ))}
                {sending && (
                  <div className="bubble-row bubble-row-ai">
                    <div className="bubble bubble-ai"><span className="spinner" /></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="pd-input-row">
                <textarea
                  className="pd-chat-input"
                  placeholder="Ask for a hint…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={sending}
                />
                <button className="btn btn-primary pd-send-btn" onClick={handleSend} disabled={sending || !input.trim()}>
                  ↑
                </button>
              </div>
              <p className="pd-msg-count subtle">{messages.length} / 30 messages</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
