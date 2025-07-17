import React, { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface ZaiChatProps {
  userData: OnboardingData;
  content: {
    type: 'metric' | 'tip' | 'offer' | 'task';
    title: string;
    description: string;
  };
  isVisible: boolean;
}

export function ZaiChat({ userData, content, isVisible }: ZaiChatProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isVisible && content) {
      setIsTyping(true);
      
      // Generate contextual message based on content type
      const generateMessage = () => {
        switch (content.type) {
          case 'metric':
            if (content.title.includes('footprint')) {
              return `${userData.name}, your carbon footprint is based on your ${userData.homeType} with ${userData.people} people and ${userData.transport} transport. want to reduce it?`;
            }
            if (content.title.includes('home')) {
              return `your home energy from ${userData.energySource} creates this impact. switching to renewable could reduce it by 40%.`;
            }
            if (content.title.includes('transport')) {
              return `${userData.transport} transport creates this impact. small changes like walking once a week can help.`;
            }
            return `this metric shows your current impact. i can help you improve it.`;
            
          case 'tip':
            return `based on your goals: ${userData.goals.slice(0, 2).join(', ')}, here are practical steps you can take.`;
            
          case 'offer':
            return `in ${userData.postcode}, there are sustainability options that match your goals. want to explore them?`;
            
          case 'task':
            return `tracking "${content.title}" can help you ${userData.goals.includes('save money') ? 'save money and' : ''} reduce your impact.`;
            
          default:
            return `hi ${userData.name}, i'm zai. i can help you with sustainability tips and savings.`;
        }
      };

      const fullMessage = generateMessage();
      
      setTimeout(() => {
        setMessage(fullMessage);
        setIsTyping(false);
      }, 1000);
    } else {
      setMessage('');
      setIsTyping(false);
    }
  }, [isVisible, content, userData]);

  if (!isVisible) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="text-center">
        <div className="w-4 h-4 bg-white rounded-full mx-auto mb-4"></div>
        <h3 className="zz-h3">zai</h3>
      </div>
      
      <div className="space-y-4">
        {isTyping ? (
          <p className="zz-p1">typing...</p>
        ) : (
          <p className="zz-p1">{message}</p>
        )}
      </div>
    </div>
  );
}