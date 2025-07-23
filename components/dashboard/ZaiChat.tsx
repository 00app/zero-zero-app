import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import aiService, { type ChatMessage } from '../../services/aiService';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface ZaiChatProps {
  userData: OnboardingData;
  isDark: boolean;
}

export function ZaiChat({ userData, isDark }: ZaiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation with starter message
  useEffect(() => {
    if (!isInitialized && isOpen) {
      const starterMessage = aiService.getConversationStarter(userData);
      setMessages([aiService.formatMessage(starterMessage, 'assistant')]);
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized, userData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = aiService.formatMessage(inputValue.trim(), 'user');
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(
        userMessage.content, 
        userData, 
        messages
      );

      const assistantMessage = aiService.formatMessage(response.content, 'assistant');
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage = aiService.formatMessage(
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

  const handleClose = () => {
    setIsOpen(false);
  };

  const connectionStatus = aiService.getConnectionStatus();

  return (
    <>
      {/* Zai Chat Bubble - Text Symbol Only */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40"
        style={{
          width: '56px',
          height: '56px',
          fontSize: '20px',
          border: 'none',
          borderRadius: '50%',
          background: 'var(--zz-accent)',
          color: 'var(--zz-bg)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 'var(--font-medium)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          scale: [1, 1.05, 1],
          transition: { duration: 2, repeat: Infinity }
        }}
      >
        zai
      </motion.button>

      {/* Connection Status Indicator */}
      {!connectionStatus.isReady && (
        <div 
          className="fixed bottom-20 right-6 z-30 px-3 py-2 text-xs opacity-70"
          style={{
            background: 'var(--zz-card)',
            border: 'none',
            borderRadius: '0',
            color: 'var(--zz-text)',
            fontFamily: 'Roboto, sans-serif',
            maxWidth: '120px',
            textAlign: 'center',
            lineHeight: 1.3
          }}
        >
          {connectionStatus.mode} mode
        </div>
      )}

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md mx-auto"
              style={{
                background: 'var(--zz-card)',
                border: 'none',
                borderRadius: '0',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4"
                style={{ 
                  borderBottom: '1px solid var(--zz-grey)',
                  borderColor: 'var(--zz-grey)'
                }}
              >
                <div>
                  <div className="zz-medium" style={{ lineHeight: 1.2 }}>
                    chat with zai
                  </div>
                  <div 
                    className="zz-small mt-1" 
                    style={{ 
                      opacity: 0.7,
                      lineHeight: 1.3
                    }}
                  >
                    {connectionStatus.mode} • sustainability assistant
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    width: '32px',
                    height: '32px',
                    fontSize: '20px',
                    border: 'none',
                    borderRadius: '50%',
                    background: 'transparent',
                    color: 'var(--zz-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ 
                  minHeight: '200px',
                  maxHeight: '400px'
                }}
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[80%] p-3"
                      style={{
                        background: message.role === 'user' 
                          ? 'var(--zz-accent)' 
                          : 'var(--zz-grey)',
                        color: message.role === 'user' 
                          ? 'var(--zz-bg)' 
                          : 'var(--zz-text)',
                        borderRadius: '0',
                        fontSize: 'var(--text-small)',
                        lineHeight: 1.4,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {message.content}
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
                      className="p-3"
                      style={{
                        background: 'var(--zz-grey)',
                        color: 'var(--zz-text)',
                        borderRadius: '0',
                        fontSize: 'var(--text-small)'
                      }}
                    >
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        zai is thinking...
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div 
                className="p-4"
                style={{ 
                  borderTop: '1px solid var(--zz-grey)',
                  borderColor: 'var(--zz-grey)'
                }}
              >
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="ask zai about sustainability tips..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0',
                      color: 'var(--zz-text)',
                      padding: '12px',
                      fontSize: 'var(--text-medium)',
                      fontWeight: 'var(--font-regular)',
                      outline: 'none',
                      resize: 'none',
                      minHeight: '44px',
                      maxHeight: '120px',
                      lineHeight: 1.4,
                      fontFamily: 'Roboto, sans-serif'
                    }}
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                      width: '44px',
                      height: '44px',
                      fontSize: '18px',
                      border: 'none',
                      borderRadius: '50%',
                      background: 'transparent',
                      color: 'var(--zz-text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: (!inputValue.trim() || isLoading) ? 0.5 : 1
                    }}
                  >
                    →
                  </button>
                </div>
                
                {!connectionStatus.isReady && (
                  <div 
                    className="mt-2 text-xs opacity-60"
                    style={{ 
                      lineHeight: 1.3,
                      fontSize: '11px'
                    }}
                  >
                    running in {connectionStatus.mode} mode
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}