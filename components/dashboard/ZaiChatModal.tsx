import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import openaiService, { ChatMessage } from '../../services/openaiService';

interface ZaiChatModalProps {
  userData: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ZaiChatModal({ userData, isOpen, onClose }: ZaiChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      setMessages([]);
      setInputValue('');
      setConversationId('');
    }
  }, [isOpen]);

  const initializeConversation = async () => {
    setIsLoading(true);
    
    try {
      // Generate conversation ID
      const newConversationId = openaiService.generateConversationId();
      setConversationId(newConversationId);

      // Get personalized conversation starter
      const starter = await openaiService.getConversationStarter(userData?.id || 'demo-user');
      
      const welcomeMessage = openaiService.formatMessage(starter, 'assistant');
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('❌ Error initializing conversation:', error);
      
      // Fallback welcome message with user's name
      const userName = userData?.name || 'there';
      const fallbackMessage = openaiService.formatMessage(
        `hi ${userName}! 👋\n\ni'm zai, your sustainability assistant. i'm here to help you reduce your carbon footprint and save money.\n\nwhat would you like to chat about today?`,
        'assistant'
      );
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = openaiService.formatMessage(inputValue.trim(), 'user');
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { response, conversationId: newConversationId } = await openaiService.sendMessage(
        userData?.id || 'demo-user',
        userMessage.content,
        conversationId
      );

      // Update conversation ID if needed
      if (newConversationId !== conversationId) {
        setConversationId(newConversationId);
      }

      const aiMessage = openaiService.formatMessage(response, 'assistant');
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      const errorMessage = openaiService.formatMessage(
        "sorry, i'm having trouble right now. please try again in a moment!",
        'assistant'
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const connectionStatus = openaiService.getConnectionStatus();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full h-full md:w-full md:max-w-lg md:h-auto md:max-h-[90vh] flex flex-col"
          style={{
            background: 'var(--zz-bg)',
            border: '2px solid var(--zz-border)',
            color: 'var(--zz-text)',
            fontFamily: 'Roboto, sans-serif'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b-2 sticky top-0"
            style={{ 
              borderColor: 'var(--zz-border)',
              background: 'var(--zz-bg)'
            }}
          >
            <div>
              <div className="zz-medium mb-1">chat with zai</div>
              <div className="zz-small opacity-60">
                {connectionStatus.mode === 'live' ? 'ai-powered sustainability assistant' : 'demo mode active'}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="zz-circle-button"
              style={{ width: '40px', height: '40px', fontSize: '20px' }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 ${
                    message.role === 'user'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                  style={{
                    background: message.role === 'user' ? 'var(--zz-accent)' : 'var(--zz-card)',
                    color: message.role === 'user' ? 'var(--zz-bg)' : 'var(--zz-text)',
                    border: message.role === 'user' ? 'none' : '1px solid var(--zz-border)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="zz-small" style={{ lineHeight: 1.5 }}>
                    {message.content.split('\n').map((line, index) => (
                      <div key={index}>
                        {line}
                        {index < message.content.split('\n').length - 1 && <br />}
                      </div>
                    ))}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div 
                      className="zz-small mt-2 opacity-50"
                      style={{ fontSize: '10px' }}
                    >
                      zai • {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div
                  className="p-4"
                  style={{
                    background: 'var(--zz-card)',
                    border: '1px solid var(--zz-border)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="zz-small">zai is thinking</div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--zz-text)' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div 
            className="p-6 border-t-2 sticky bottom-0"
            style={{ 
              borderColor: 'var(--zz-border)',
              background: 'var(--zz-bg)'
            }}
          >
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="ask zai about sustainable living..."
                  disabled={isLoading}
                  className="w-full p-4 resize-none zz-small"
                  style={{
                    background: 'var(--zz-card)',
                    border: '1px solid var(--zz-border)',
                    borderRadius: '16px',
                    color: 'var(--zz-text)',
                    outline: 'none',
                    minHeight: '56px',
                    maxHeight: '120px',
                    lineHeight: 1.4
                  }}
                  rows={1}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="zz-action-button"
                style={{ 
                  width: '56px', 
                  height: '56px',
                  fontSize: '20px',
                  flexShrink: 0
                }}
              >
                →
              </button>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-between mt-4">
              <div className="zz-small opacity-60">
                {connectionStatus.mode === 'live' 
                  ? `ai-powered by openai • conversation saved`
                  : 'demo mode - add openai_api_key for full features'
                }
              </div>
              
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    background: connectionStatus.isConnected ? '#4ade80' : 'var(--zz-grey)'
                  }}
                />
                <div className="zz-small opacity-60">
                  {connectionStatus.isConnected ? 'connected' : 'demo'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}