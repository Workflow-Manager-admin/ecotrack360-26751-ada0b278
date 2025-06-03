import React from 'react';

/**
 * PUBLIC_INTERFACE
 * AiAssistant provides a chat or advice interface for eco guidance,
 * offering suggestions and answering questions using static/canned responses.
 * Features a mock chat interface, with bubble messages and a disabled input,
 * styled for eco/minimal look per requirements.
 */
const MOCK_HISTORY = [
  {
    sender: "ai",
    avatar: "🤖",
    text: "Hi! I'm your Eco Assistant. Ask me anything about shrinking your carbon footprint.",
    time: '09:31'
  },
  {
    sender: "user",
    avatar: "🧑",
    text: "Give me a quick energy-saving tip?",
    time: '09:32'
  },
  {
    sender: "ai",
    avatar: "🤖",
    text: "Switching off electronics at the wall eliminates hidden standby consumption. Try using a smart power strip!",
    time: '09:33'
  }
];

function AiAssistant() {
  // All input and interaction is mocked (MVP)
  return (
    <div>
      <h2 className="mb-md">AI Assistant</h2>
      <div className="eco-card" style={{maxWidth:540, margin:"auto"}}>
        <div style={{fontSize:15, color:"var(--text-faint)", marginBottom:8}}>
          Suggestions for eco living, via static conversation
        </div>
        {/* Mock chat bubble area */}
        <div style={{ background:"var(--surface)", borderRadius:10, padding:"10px 12px", minHeight:140}}>
          {MOCK_HISTORY.map((msg,i) => (
            <div key={i} style={{
              display:"flex",
              alignItems:"flex-start",
              justifyContent: msg.sender === "user" ? "flex-end":"flex-start",
              margin:"9px 0",
              gap: 7
            }}>
              {msg.sender === "ai" &&
                <span style={{
                  fontSize:"1.2em",
                  minWidth:27,
                  marginTop:2
                }}>{msg.avatar}</span>
              }
              <div style={{
                background: msg.sender === 'ai' ? "var(--card-bg)" : "var(--primary)",
                color: msg.sender === 'ai' ? "var(--text-secondary)": "#fff",
                borderRadius: 9,
                padding:"9px 14px",
                fontSize:"1.01em",
                boxShadow: "var(--shadow-light)",
                maxWidth: 340
              }}>
                {msg.text}
              </div>
              {msg.sender === "user" &&
                <span style={{
                  fontSize:"1.16em",
                  minWidth:27,
                  marginTop:2
                }}>{msg.avatar}</span>
              }
            </div>
          ))}
        </div>
        {/* Static input bar (mock/non-functional, styled) */}
        <form style={{
          display:"flex",
          alignItems:"center",
          gap:8,
          marginTop:18
        }} onSubmit={e=>e.preventDefault()}>
          <input
            type="text"
            disabled
            value=""
            placeholder='Type your eco question here...'
            style={{
              flex:1,
              background:"var(--background)",
              borderRadius:7,
              border:"1px solid var(--card-border)",
              color:"var(--text-color)",
              padding: "9px 12px"
            }}
            aria-label="Chat input"
          />
          <button className="btn" aria-disabled="true" disabled>Send</button>
        </form>
        <div className="mt-sm" style={{ fontSize:13, color:"var(--text-faint)" }}>
          Try: "Sustainable travel ideas", "What’s my biggest carbon contributor?"
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
