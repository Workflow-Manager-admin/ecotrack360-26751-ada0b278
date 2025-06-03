import React from 'react';

/**
 * PUBLIC_INTERFACE
 * AiAssistant provides a chat or advice interface for eco guidance,
 * offering suggestions and answering questions using static/canned responses.
 */
function AiAssistant() {
  return (
    <div>
      <h2>AI Assistant</h2>
      {/* Placeholder: chat area and suggestion panel */}
      <div style={{ border: '1px solid #444', borderRadius: '10px', background: '#232c29', padding: '20px', color: '#bdbdbd'}}>
        <p>[AI Assistant]: Ask anything about reducing your carbon footprint, or try:</p>
        <ul>
          <li>"How can I reduce energy usage at home?"</li>
          <li>"Suggest a sustainable commute for me."</li>
        </ul>
        {/* TODO: Chat UI, input box, canned responses */}
      </div>
    </div>
  );
}

export default AiAssistant;
