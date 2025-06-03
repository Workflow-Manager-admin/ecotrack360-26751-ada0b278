import React, { useState, useRef, useEffect } from 'react';

/**
 * PUBLIC_INTERFACE
 * AiAssistant provides a chat or advice interface for eco guidance, offering suggestions and answering questions using static/canned responses.
 * Now stateful and interactive: user can submit sample questions, receives canned/mock responses, and chat history persists in React state.
 * All logic is frontend only; NO real AI/external calls.
 */

// Sample question options for quick one-click testing
const SAMPLE_QUESTIONS = [
  "Sustainable travel ideas",
  "How can I lower my home energy emissions?",
  "What’s my biggest carbon contributor?",
  "Simple eco habits for beginners",
  "Low-carbon recipes?"
];

// Maps some question keywords/phrases to mock responses. Falls back to a default for unknowns.
const MOCK_AI_RESPONSES = [
  {
    keywords: ["travel", "sustainable", "commute"],
    response: "Consider biking, walking, or using public transit. If you must drive, carpool and group trips together whenever possible!"
  },
  {
    keywords: ["energy", "home", "emissions", "electric"],
    response: "Switch to LED bulbs, unplug unused electronics, and optimize heating/cooling schedules. Green power plans also help."
  },
  {
    keywords: ["carbon contributor", "biggest", "main source"],
    response:
      "For most people, transportation (especially driving and flights) makes up the largest share of their carbon footprint."
  },
  {
    keywords: ["eco habits", "beginners", "start", "simple"],
    response:
      "Start by reducing food waste, bringing reusable bags/bottles, turning off lights, and eating more plant-based meals."
  },
  {
    keywords: ["recipe", "food", "plant-based"],
    response: "Try oat porridge with fruit, veggie stir-frys, or chickpea salad. Beans and seasonal veggies are climate friendly!"
  },
];

function getMockAiResponse(userMsg) {
  // Lowercase; check for any keyword match; otherwise a default response.
  const txt = userMsg.trim().toLowerCase();
  for (let entry of MOCK_AI_RESPONSES) {
    if (entry.keywords.some(kw => txt.includes(kw))) {
      return entry.response;
    }
  }
  // Default fallback canned response
  return "Great eco question! Consider simple daily changes—I'm here to guide you on your path toward a smaller carbon footprint. 🚀🌱";
}

// Returns HH:MM format for chat timestamp
function getCurrentTimeString() {
  const d = new Date();
  return d
    .toTimeString()
    .slice(0, 5); // "13:26..."
}

/**
 * PUBLIC_INTERFACE
 * Stateful, interactive AI Assistant demo for EcoTrack360.
 * Allows user input (or quick sample buttons), keeps frontend-only chat history,
 * and displays canned mock responses as AI.
 */
function AiAssistant() {
  // State for chat history: array of {sender, avatar, text, time}
  const [history, setHistory] = useState([
    {
      sender: "ai",
      avatar: "🤖",
      text: "Hi! I'm your Eco Assistant. Ask me anything about shrinking your carbon footprint.",
      time: getCurrentTimeString()
    }
  ]);
  // User input state
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // PUBLIC_INTERFACE
  function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    // Add user message
    setHistory(hist => [
      ...hist,
      {
        sender: "user",
        avatar: "🧑",
        text: trimmed,
        time: getCurrentTimeString()
      }
    ]);
    setInput("");
    // Add AI reply (with slight delay for effect)
    setTimeout(() => {
      setHistory(hist => [
        ...hist,
        {
          sender: "ai",
          avatar: "🤖",
          text: getMockAiResponse(trimmed),
          time: getCurrentTimeString()
        }
      ]);
    }, 650);
  }

  // PUBLIC_INTERFACE
  function handleSampleClick(txt) {
    setInput(txt);
    setTimeout(() => {
      // Auto-submit for sample
      document.getElementById("ai-chat-input")?.focus();
      // Only run send if there's no pending input (avoid duplicate submissions)
      handleSend({ preventDefault: () => {} });
    }, 10);
  }

  // Handle enter key for submit (handled natively by form)
  return (
    <div>
      <h2 className="mb-md">AI Assistant</h2>
      <div className="eco-card" style={{ maxWidth: 540, margin: "auto" }}>
        <div style={{ fontSize: 15, color: "var(--text-faint)", marginBottom: 8 }}>
          Ask anything about sustainable living. (All answers are simulated!)
        </div>
        {/* Chat bubble area */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: 10,
            padding: "10px 12px",
            minHeight: 140,
            maxHeight: 275,
            overflowY: "auto",
            marginBottom: 6
          }}
          tabIndex={0}
          aria-label="Chat conversation"
        >
          {history.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                margin: "9px 0",
                gap: 7
              }}
            >
              {msg.sender === "ai" && (
                <span
                  style={{
                    fontSize: "1.2em",
                    minWidth: 27,
                    marginTop: 2
                  }}
                  aria-label="AI bot"
                >
                  {msg.avatar}
                </span>
              )}
              <div
                style={{
                  background:
                    msg.sender === "ai"
                      ? "var(--card-bg)"
                      : "var(--primary)",
                  color:
                    msg.sender === "ai"
                      ? "var(--text-secondary)"
                      : "#fff",
                  borderRadius: 9,
                  padding: "9px 14px",
                  fontSize: "1.01em",
                  boxShadow: "var(--shadow-light)",
                  maxWidth: 340,
                  whiteSpace: "pre-wrap"
                }}
                aria-label={msg.sender === "ai" ? "AI message" : "User message"}
              >
                {msg.text}
                <span style={{ marginLeft: 12, fontSize: 11, color: "var(--text-faint)" }}>
                  {msg.time}
                </span>
              </div>
              {msg.sender === "user" && (
                <span
                  style={{
                    fontSize: "1.16em",
                    minWidth: 27,
                    marginTop: 2
                  }}
                  aria-label="You"
                >
                  {msg.avatar}
                </span>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 4
          }}
          onSubmit={handleSend}
        >
          <input
            id="ai-chat-input"
            type="text"
            value={input}
            autoComplete="off"
            spellCheck={true}
            placeholder="Type your eco question here..."
            style={{
              flex: 1,
              background: "var(--background)",
              borderRadius: 7,
              border: "1px solid var(--card-border)",
              color: "var(--text-color)",
              padding: "9px 12px"
            }}
            aria-label="Chat input"
            onChange={e => setInput(e.target.value)}
          />
          <button
            className="btn"
            type="submit"
            aria-label="Send message"
            disabled={!input.trim()}
            style={{ opacity: input.trim() ? 1 : 0.65 }}
          >
            Send
          </button>
        </form>
        <div className="mt-sm" style={{ fontSize: 13, color: "var(--text-faint)" }}>
          Try a sample:&nbsp;
          {SAMPLE_QUESTIONS.map((txt, idx) => (
            <button
              key={txt}
              className="btn"
              style={{
                fontSize: 12,
                padding: "3px 9px",
                marginRight: 5,
                background: "var(--accent-dark)",
                color: "#202924",
                fontWeight: 600,
                border: "none"
              }}
              tabIndex={0}
              type="button"
              onClick={() => handleSampleClick(txt)}
            >
              {txt}
            </button>
          ))}
        </div>
        <div className="mt-sm" style={{ fontSize: 12, color: "var(--text-faint)" }}>
          All replies are mock/demo. No data leaves your device.
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
