
import React, { useState, useRef, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface ZaiChatModalProps {
  userData: OnboardingData;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'zai';
  timestamp: Date;
}

export function ZaiChatModal({ userData, isOpen, onClose }: ZaiChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message when chat opens
      const welcomeMessage: Message = {
        id: '1',
        content: `hello ${userData.name}! i'm zai, your sustainability assistant. i can help you understand your carbon footprint, find local eco-friendly options, or answer questions about sustainable living. what would you like to know?`,
        sender: 'zai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userData.name, messages.length]);

  const generateZaiResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based responses - in a real app this would use AI
    if (message.includes('carbon') || message.includes('footprint')) {
      return `based on your data, your annual carbon footprint is approximately ${(Math.random() * 5 + 8).toFixed(1)} tonnes. this is ${Math.random() > 0.5 ? 'below' : 'close to'} the uk average. your biggest impact areas are ${userData.transport === 'car' ? 'transport and' : ''} home energy. would you like specific tips to reduce these?`;
    }
    
    if (message.includes('save') || message.includes('money')) {
      return `great question! based on your £${userData.monthlySpend} monthly spending, you could potentially save £${Math.floor(userData.monthlySpend * 0.15)} per month through sustainable choices. this includes energy efficiency, reducing waste, and choosing local options. shall i show you specific ways to start?`;
    }
    
    if (message.includes('local') || message.includes(userData.postcode.toLowerCase())) {
      return `in your area (${userData.postcode}), there are several sustainable options available. i can help you find local farmers markets, repair cafes, renewable energy suppliers, and eco-friendly businesses. what type of local options interest you most?`;
    }
    
    if (message.includes('goal') || message.includes('target')) {
      return `you've set ${userData.goals.length} sustainability goals: ${userData.goals.slice(0, 2).join(', ')}${userData.goals.length > 2 ? ' and others' : ''}. i can help you track progress and suggest specific actions for each goal. which goal would you like to focus on first?`;
    }
    
    if (message.includes('help') || message.includes('start')) {
      return `i'm here to help! i can assist with carbon footprint analysis, money-saving tips, local sustainable options, goal tracking, and general sustainability advice. try asking me about specific topics like "how can i reduce my transport emissions?" or "what are good local eco options?"`;
    }
    
    // Default response
    return `that's a great question about sustainable living. while i'm still learning, i can help you with carbon footprint insights, money-saving tips, local eco options, and goal tracking. could you ask me something more specific about these areas?`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Zai typing delay
    setTimeout(() => {
      const zaiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateZaiResponse(inputValue),
        sender: 'zai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, zaiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 zz-chat-backdrop"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl h-[600px] backdrop-blur-sm border-2 flex flex-col zz-chat-modal"
        style={{ 
          backgroundColor: 'var(--zz-card)',
          borderColor: 'var(--zz-border)',
          color: 'var(--zz-card-text)'
        }}
      >
        
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ borderColor: 'var(--zz-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: 'var(--zz-text)' }}
              >
                <span className="text-sm">○</span>
              </div>
              <div>
                <h3 className="zz-h3">zai</h3>
                <p className="zz-p1 opacity-60 text-sm">sustainability assistant</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="zz-circle-button"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg zz-chat-message ${
                  message.sender === 'user' ? 'user' : 'zai'
                }`}
                style={{
                  backgroundColor: message.sender === 'user' 
                    ? 'var(--zz-accent)' 
                    : 'var(--zz-bg)',
                  color: message.sender === 'user' 
                    ? 'var(--zz-bg)' 
                    : 'var(--zz-text)',
                  border: message.sender === 'user' 
                    ? `1px solid var(--zz-accent)` 
                    : `1px solid var(--zz-border)`
                }}
              >
                <p className="zz-p1">{message.content}</p>
                <p className="text-xs mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div 
                className="p-4 max-w-[80%] rounded-lg zz-chat-message zai"
                style={{ 
                  backgroundColor: 'var(--zz-bg)',
                  border: `1px solid var(--zz-border)`
                }}
              >
                <p className="zz-p1 opacity-60">zai is typing...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div 
          className="p-6 border-t"
          style={{ borderColor: 'var(--zz-border)' }}
        >
          <div className="flex space-x-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ask zai anything about sustainability..."
              className="flex-1 zz-chat-input resize-none h-12"
              style={{
                backgroundColor: 'transparent',
                border: `2px solid var(--zz-border)`,
                borderRadius: '8px',
                color: 'var(--zz-text)',
                padding: '12px'
              }}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`zz-circle-button ${
                !inputValue.trim() || isTyping ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
