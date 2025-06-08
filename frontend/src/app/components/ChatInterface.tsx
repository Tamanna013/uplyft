"use client"
import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';
import { format } from 'date-fns';
import axios from 'axios';
import nlp from 'compromise';
import ProductDetail from './ProductDetail';

const sendSound = typeof Audio !== 'undefined' ? new Audio('/send.mp3') : null;

    export default function ChatInterface() {
        type Message = {
        id: string;
        text: string;
        sender: 'user' | 'bot';
        timestamp: Date;
        isProduct?: boolean;
        productId?: number;
    };

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  type User = { username: string };
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<number | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) addBotMessage("Hello! I'm your shopping assistant. What can I help you find today?");
  }, []);

  const addBotMessage = (text: string, isProduct: boolean = false, productId?: number) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'bot',
        timestamp: new Date(),
        isProduct,
        productId
      };
      try { sendSound?.play(); } catch (e) {}
      setMessages(prev => [...prev, newMessage]);
    };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    try { sendSound?.play(); } catch (e) {}
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const lowerInput = input.toLowerCase();

      if (input === '/reset') return resetChat();
      if (input === '#help') {
        addBotMessage("Try commands like:\n- Show me electronics\n- Find books\n- What products do you have?");
        return;
      }

      const doc = nlp(lowerInput);
      const categoryMatch = doc.match('(electronics|books|textiles)').text();

      if (categoryMatch) {
        const res = await axios.get('http://localhost:5000/api/products', { params: { category: categoryMatch } });
        const products = res.data;

        if (products.length) {
          addBotMessage(`Here are some ${categoryMatch} products:`);
          products.slice(0, 5).forEach((p: any) =>
            addBotMessage(`${p.name} - $${p.price}\n${p.description}`, true, p.id)
          );
        } else {
          addBotMessage(`No ${categoryMatch} products found.`);
        }
        return;
      }

      const res = await axios.get('http://localhost:5000/api/products', { params: { search: input } });
      const products = res.data;

      if (products.length) {
        addBotMessage(`Found ${products.length} products:`);
        products.slice(0, 3).forEach((p: any) =>
          addBotMessage(`${p.name} - $${p.price}\n${p.description}`, true, p.id)
        );
      } else {
        addBotMessage("Couldn't find anything. Try different words.");
      }
    } catch (err) {
      console.error(err);
      addBotMessage("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', loginForm);
      setUser(res.data.user);
      setShowLogin(false);
      addBotMessage(`Welcome back, ${res.data.user.username}!`);
    } catch {
      addBotMessage("Login failed.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    addBotMessage("You've been logged out.");
  };

  const resetChat = () => {
    setMessages([]);
    addBotMessage("Chat reset. What can I help with?");
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} flex flex-col h-screen`}>
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">E-Commerce Chatbot</h1>
        <div className="flex space-x-3">
          <button onClick={() => setDarkMode(!darkMode)} className="px-2 py-1 bg-gray-800 rounded">🌓</button>
          {user ? (
            <>
              <span className="flex items-center"><FiUser className="mr-1" /> {user.username}</span>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded"><FiLogOut /> Logout</button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-green-500 px-3 py-1 rounded"><FiLogIn /> Login</button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg w-80 text-black">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <input placeholder="Username" className="w-full p-2 border rounded mb-3" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
            <input type="password" placeholder="Password" className="w-full p-2 border rounded mb-3" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowLogin(false)} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
              <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-1 rounded">Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start mb-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <img src={msg.sender === 'bot' ? '/bot-avatar.png' : '/user-avatar.png'} className="w-8 h-8 rounded-full mx-2" alt="avatar" />
            <div className={`${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black'} p-3 rounded-lg max-w-[75%] shadow`}>
              {msg.isProduct ? (
                <>
                  <p><strong>{msg.text.split('\n')[0]}</strong></p>
                  <p>{msg.text.split('\n')[1]}</p>
                  <button
                    onClick={() => {
                      if (typeof msg.productId === 'number') setViewingProduct(msg.productId);
                    }}
                    className="text-sm text-blue-600 underline mt-1"
                  >View</button>
                </>
              ) : (
                <p className="whitespace-pre-line">{msg.text}</p>
              )}
              <span className="text-xs opacity-60 mt-1 block">{format(new Date(msg.timestamp), 'hh:mm a')}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-1 px-4 py-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex space-x-2">
        <button onClick={resetChat} className="px-3 py-2 bg-gray-200 rounded">↻</button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything..."
          className="flex-1 border rounded px-3 py-2"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
        >
          <FiSend className="mr-1" /> Send
        </button>
      </div>

      {/* Product View */}
      {viewingProduct && <ProductDetail productId={viewingProduct} onClose={() => setViewingProduct(null)} />}
    </div>
  );
}
