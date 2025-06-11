import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: input });
      const botMessage = {
        sender: 'bot',
        text: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error:', err);
    }

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const resetChat = () => setMessages([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-red-400">
      <div className="bg-red-500 text-white text-center py-3 font-semibold text-xl">🛍️ Sales Chatbot</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[75%] px-4 py-2 rounded-xl shadow text-sm ${
              msg.sender === 'user'
                ? 'ml-auto bg-red-200 text-right'
                : 'mr-auto bg-white text-left'
            }`}
          >
            <div>{msg.text}</div>
            <div className="text-gray-500 text-[0.7rem] mt-1">{msg.time}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t flex items-center gap-2 bg-white">
        <input
          type="text"
          placeholder="Ask about products..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-red-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={sendMessage}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Send
        </button>
        <button
          onClick={resetChat}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
