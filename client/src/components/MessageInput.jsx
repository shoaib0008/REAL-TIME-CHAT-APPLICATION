import { useState, useRef, useEffect, useCallback } from 'react';

const EMOJIS = ['😀','😂','😍','🤔','👍','👎','❤️','🔥','🎉','💯','😎','🙌','✨','🚀','💡','😮','😢','🤝','💪','🎯'];

export default function MessageInput({ onSend, onTyping, disabled, connectionStatus }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [text]);

  const emitTyping = useCallback((isTyping) => {
    if (isTypingRef.current !== isTyping) {
      isTypingRef.current = isTyping;
      onTyping(isTyping);
    }
  }, [onTyping]);

  const handleChange = (e) => {
    setText(e.target.value);
    // Typing indicator
    emitTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    emitTyping(false);
    clearTimeout(typingTimer.current);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e) => {
      if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-btn')) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  const placeholder =
    connectionStatus === 'connected'   ? 'Type a message… (Enter to send)' :
    connectionStatus === 'connecting'  ? 'Connecting to server…' :
                                         'Reconnecting…';

  return (
    <div className="chat-input-area" style={{ position: 'relative' }}>
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="emoji-picker" id="emoji-picker">
          {EMOJIS.map(e => (
            <button
              key={e}
              className="emoji-option"
              type="button"
              onClick={() => insertEmoji(e)}
              title={e}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-wrapper">
        <textarea
          id="message-input"
          ref={textareaRef}
          className="chat-textarea"
          placeholder={placeholder}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          maxLength={2000}
          autoComplete="off"
          spellCheck="true"
        />

        <div className="input-actions">
          {/* Emoji toggle */}
          <button
            id="emoji-toggle-btn"
            type="button"
            className="emoji-btn"
            onClick={() => setShowEmoji(v => !v)}
            title="Emoji"
            disabled={disabled}
          >
            😊
          </button>

          {/* Send */}
          <button
            id="send-message-btn"
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            title="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Character count hint */}
      {text.length > 1800 && (
        <p style={{ fontSize: 11, color: text.length > 1950 ? 'var(--error)' : 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
          {2000 - text.length} characters remaining
        </p>
      )}
    </div>
  );
}
