
import React, { useState } from 'react';
import { NameStep } from './NameStep';
import { LocationStep } from './LocationStep';
import { HomeTypeStep } from './HomeTypeStep';
import { EnergySourceStep } from './EnergySourceStep';
import { TransportStep } from './TransportStep';
import { RoomsPeopleStep } from './RoomsPeopleStep';
import { SpendStep } from './SpendStep';
import { GoalsStep } from './GoalsStep';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { isSupabaseConfigured } from '../../utils/supabase/client';
import { toast } from "sonner@2.0.3";
import { getLocaleFromPostcode } from '../../utils/localization';

export interface OnboardingData {
  name: string;
  postcode: string;
  homeType: 'flat' | 'house' | 'shared';
  energySource: 'grid' | 'renewable' | 'mixed';
  transport: 'car' | 'public' | 'bike' | 'walk' | 'mixed';
  carType?: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  rooms: number;
  people: number;
  monthlySpend: number;
  goals: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  isDark: boolean;
}

export function OnboardingFlow({ onComplete, isDark }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({
    goals: []
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    NameStep,
    LocationStep,
    HomeTypeStep,
    EnergySourceStep,
    TransportStep,
    RoomsPeopleStep,
    SpendStep,
    GoalsStep,
  ];

  const saveOnboardingData = async (onboardingData: OnboardingData) => {
    try {
      setIsSaving(true);
      
      // Check if Supabase is configured before trying to save
      if (!isSupabaseConfigured()) {
        console.log('ℹ️ Supabase not configured - skipping data save (demo mode)');
        return null;
      }
      
      // Generate a unique ID for this user's onboarding session
      const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save onboarding data to Supabase using the server endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eebb7b0c/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          sessionId,
          data: onboardingData,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Onboarding data saved successfully:', result);
      
      return result;
    } catch (error) {
      console.warn('⚠️ Failed to save onboarding data:', error);
      // Don't block the user experience - still proceed
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async (stepData: Partial<OnboardingData>) => {
    const newData = { ...data, ...stepData };
    setData(newData);

    setIsTransitioning(true);
    
    setTimeout(async () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      } else {
        // Final step - save data and complete onboarding
        const completeData = newData as OnboardingData;
        
        // Save to Supabase in the background
        await saveOnboardingData(completeData);
        
        // Show success message with locale awareness
        const locale = getLocaleFromPostcode(completeData.postcode);
        if (isSupabaseConfigured()) {
          toast.success('profile saved successfully!');
        } else {
          toast.success(`profile saved to ${locale === 'US' ? 'device' : 'device'}!`);
        }
        
        // Complete the onboarding flow
        onComplete(completeData);
        setIsTransitioning(false);
      }
    }, 350);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 350);
    }
  };

  const CurrentStepComponent = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`min-h-screen transition-all duration-500 ease-out`}>
      
      {/* Progress Bar */}


      {/* Step Counter */}
      <div className="fixed top-20 left-6 z-30">

      </div>

      {/* Saving Indicator */}
      {isSaving && (
        <div className="fixed top-32 left-6 z-30">
          <span className="zz-small opacity-60">saving...</span>
        </div>
      )}

      {/* Content */}
      <div className={`min-h-screen transition-all duration-350 ease-out ${
        isTransitioning ? 'opacity-50 scale-99' : 'opacity-100 scale-100'
      }`}>
        <div className="min-h-screen flex flex-col justify-center px-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="zz-fade-in">
              <CurrentStepComponent
                data={data}
                onNext={handleNext}
                onBack={handleBack}
                currentStep={currentStep}
                totalSteps={steps.length}
                isDark={isDark}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
