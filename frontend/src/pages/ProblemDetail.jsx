import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MessageBubble from '../components/MessageBubble';
import DifficultyPill from '../components/DifficultyPill';
import { getProblem } from '../services/problems';
import { createConversation, endConversation } from '../services/conversations';
import { get as apiGet } from '../services/api';
import { sendMessage } from '../services/messages';
import { get, put, getStoredUser } from '../services/api';

const LANGUAGES = ['python', 'javascript', 'java'];

const STARTER = {
  python:     `def solution():\n    # Write your solution here\n    pass\n`,
  javascript: `function solution() {\n    // Write your solution here\n}\n`,
  java:       `class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}\n`,
};

const INITIAL_GREETING = "What's your first instinct when you see this problem?";

export default function ProblemDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const bottomRef    = useRef(null);
  const socketRef    = useRef(null);
  const chatInputRef = useRef(null);

  const [problem,    setProblem]    = useState(null);
  const [convId,     setConvId]     = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [sending,    setSending]    = useState(false);
  const [typing,     setTyping]     = useState(false);
  const [language,   setLanguage]   = useState('python');
  const [code,       setCode]       = useState(STARTER.python);
  const [activeTab,  setActiveTab]  = useState('aristobot');
  const [elapsed,    setElapsed]    = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  /* ---- Timer ---- */
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  /* ---- Load problem + create conversation + connect socket ---- */
  useEffect(() => {
    let socket;

    let isMounted = true;

    async function init() {
      try {
        const prob = await getProblem(id);
        if (!isMounted) return;
        setProblem(prob);
        setCode(prob.starterCode?.[language] ?? STARTER[language]);

        // Check for existing open conversation for this problem
        const existing = await apiGet(`/conversations?problemId=${id}`).catch(() => []);
        if (!isMounted) return;
        const openConv = Array.isArray(existing) ? existing.find(c => !c.endedAt) : null;

        let conv;
        if (openConv) {
          conv = openConv;
          const msgs = (openConv.Messages || [])
            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
            .map(m => ({ id: m.id, role: m.role, content: m.content }));
          setMessages(msgs);
        } else {
          conv = await createConversation(Number(id), language);
          if (!isMounted) return;
          await sendMessage(conv.id, 'assistant', INITIAL_GREETING);
          setMessages([{ id: Date.now(), role: 'assistant', content: INITIAL_GREETING }]);
        }
        setConvId(conv.id);

        // Connect socket
        const newSocket = io('http://localhost:3000', { transports: ['websocket'] });
        socketRef.current = newSocket;
        newSocket.emit('join-conversation', { conversationId: conv.id });

        newSocket.on('typing', () => {
          if (!isMounted) return;
          setTyping(true);
          setSending(false);
        });

        newSocket.on('receive-message', ({ message }) => {
          if (!isMounted) return;
          setTyping(false);
          setSending(false);
          setMessages(prev => {
            // Deduplicate by DB id
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, {
              id:      message.id ?? Date.now(),
              role:    message.role,
              content: message.content,
            }];
          });
          setTimeout(() => chatInputRef.current?.focus(), 50);
        });

      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---- Scroll to bottom on new message ---- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* ---- Language change ---- */
  function handleLanguageChange(lang) {
    setLanguage(lang);
    setCode(problem?.starterCode?.[lang] ?? STARTER[lang]);
  }

  /* ---- Send user message via socket ---- */
  function handleSend() {
    if (!input.trim() || sending || typing || !convId || !socketRef.current) return;
    const userText = input.trim();
    setInput('');
    setSending(true);

    // Add user message to UI immediately (optimistic)
    setMessages(prev => [...prev, { id: `local-${Date.now()}`, role: 'user', content: userText }]);

    // Send via socket — include current language so AristoBot uses the right syntax
    socketRef.current.emit('send-message', {
      conversationId: convId,
      content: userText,
      userId: getStoredUser()?.userId,
      language,
    });

  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  /* ---- Submit ---- */
  async function handleSubmit() {
    if (!convId) return;
    try {
      // Send final code as last message via REST
      await sendMessage(convId, 'user', `[Final submission]\n\`\`\`${language}\n${code}\n\`\`\``);

      // REST call sets endedAt + triggers Claude AI evaluation
      await endConversation(convId);

      // Socket event notifies other tabs in the room
      if (socketRef.current) {
        socketRef.current.emit('conversation-ended', { conversationId: convId });
      }

      // Mark progress as completed
      const user = getStoredUser();
      if (user) {
        const allProgress = await get('/progress').catch(() => []);
        const record = Array.isArray(allProgress)
          ? allProgress.find(p => (p.problemId || p.Problem?.id) === parseInt(id) && p.userId === user.userId)
          : null;
        if (record) await put(`/progress/${record.id}`, { status: 'completed' }).catch(() => {});
      }
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

        {/* MIDDLE — Code editor */}
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
                  requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4; });
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
                {/* Step 5: typing indicator */}
                {typing && (
                  <div className="bubble-row bubble-row-ai">
                    <div className="bubble bubble-ai typing-indicator">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="pd-input-row">
                <textarea
                  ref={chatInputRef}
                  className="pd-chat-input"
                  placeholder="Ask AristoBot for a hint…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={sending || typing}
                />
                <button
                  className="btn btn-primary pd-send-btn"
                  onClick={handleSend}
                  disabled={sending || typing || !input.trim()}
                >
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
