
import React, { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  userData: OnboardingData;
  isDark: boolean;
  onThemeToggle: () => void;
  onDataReset: () => void;
  onBack: () => void;
}

interface UserPreferences {
  email: string;
  phone: string;
  friendsEmails: string;
  receiveTips: boolean;
  ecoHolidays: boolean;
  darkMode: boolean;
}

export function Settings({ userData, isDark, onThemeToggle, onDataReset, onBack }: SettingsProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    email: '',
    phone: '',
    friendsEmails: '',
    receiveTips: true,
    ecoHolidays: false,
    darkMode: isDark
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use the singleton Supabase client
  const supabase = getSupabaseClient();
  
  useEffect(() => {
    setPreferences(prev => ({ ...prev, darkMode: isDark }));
    loadUserPreferences();
  }, [isDark]);

  const loadUserPreferences = async () => {
    try {
      const savedPrefs = localStorage.getItem('zz-user-preferences');
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences(prev => ({ ...prev, ...parsedPrefs }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('zz-user-preferences', JSON.stringify(preferences));
      
      // Save to Supabase if we have a server endpoint
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eebb7b0c/user-preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userData,
            preferences
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save to server');
        }
      } catch (serverError) {
        console.log('Server save failed, using local storage only:', serverError);
      }

      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const exportUserData = async () => {
    setIsExporting(true);
    try {
      const allData = {
        userData,
        preferences,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `zero-zero-data-${userData.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const deleteUserData = async () => {
    const confirmMessage = `Are you sure you want to delete all your data? This action cannot be undone.

Type "${userData.name}" to confirm:`;
    
    const confirmation = prompt(confirmMessage);
    if (confirmation !== userData.name) {
      return;
    }

    setIsDeleting(true);
    try {
      // Clear local storage
      localStorage.removeItem('zz-user-data');
      localStorage.removeItem('zz-user-preferences');
      localStorage.removeItem('zz-theme');

      // Try to delete from server
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eebb7b0c/user-data`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userData })
        });

        if (!response.ok) {
          throw new Error('Failed to delete from server');
        }
      } catch (serverError) {
        console.log('Server delete failed, local data cleared:', serverError);
      }

      toast.success('All data deleted successfully');
      
      // Reset the app after a short delay
      setTimeout(() => {
        onDataReset();
      }, 1000);
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Failed to delete data');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeToggle = () => {
    onThemeToggle();
    setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <div className="min-h-screen transition-all duration-500">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={onBack}
            className="zz-p1 opacity-60 hover:opacity-100 mb-8 transition-opacity duration-200"
          >
            ← back to dashboard
          </button>
          <h1 className="zz-h1 mb-4">settings</h1>
          <p className="zz-p1 opacity-60">manage your account and preferences</p>
        </div>

        {/* Account Section */}
        <div className="mb-12">
          <h2 className="zz-h3 mb-8">account</h2>
          <div className="space-y-6">
            
            {/* Email */}
            <div>
              <label className="zz-p1 block mb-2 opacity-80">email</label>
              <input
                type="email"
                value={preferences.email}
                onChange={(e) => handlePreferenceChange('email', e.target.value)}
                placeholder="your@email.com"
                className="zz-input"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="zz-p1 block mb-2 opacity-80">phone number</label>
              <input
                type="tel"
                value={preferences.phone}
                onChange={(e) => handlePreferenceChange('phone', e.target.value)}
                placeholder="+44..."
                className="zz-input"
              />
            </div>

            {/* Friends' Emails */}
            <div>
              <label className="zz-p1 block mb-2 opacity-80">friends' emails</label>
              <textarea
                value={preferences.friendsEmails}
                onChange={(e) => handlePreferenceChange('friendsEmails', e.target.value)}
                placeholder="friend1@email.com, friend2@email.com"
                rows={3}
                className="zz-input resize-none"
              />
              <p className="zz-p1 text-sm opacity-50 mt-2">
                separate multiple emails with commas
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-12">
          <h2 className="zz-h3 mb-8">preferences</h2>
          <div className="space-y-6">

            {/* Receive Tips Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-opacity-20 border-current">
              <div>
                <h3 className="zz-p1 mb-1">receive tips &amp; nudges</h3>
                <p className="zz-p1 text-sm opacity-60">
                  get personalized sustainability recommendations
                </p>
              </div>
              <button
                onClick={() => handlePreferenceChange('receiveTips', !preferences.receiveTips)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  preferences.receiveTips 
                    ? 'bg-current' 
                    : 'bg-current bg-opacity-20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    preferences.receiveTips ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Eco Holiday Suggestions Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-opacity-20 border-current">
              <div>
                <h3 className="zz-p1 mb-1">eco holiday suggestions</h3>
                <p className="zz-p1 text-sm opacity-60">
                  discover sustainable travel options
                </p>
              </div>
              <button
                onClick={() => handlePreferenceChange('ecoHolidays', !preferences.ecoHolidays)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  preferences.ecoHolidays 
                    ? 'bg-current' 
                    : 'bg-current bg-opacity-20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    preferences.ecoHolidays ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="zz-p1 mb-1">dark mode</h3>
                <p className="zz-p1 text-sm opacity-60">
                  toggle between light and dark themes
                </p>
              </div>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  isDark 
                    ? 'bg-current' 
                    : 'bg-current bg-opacity-20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Preferences Button */}
        <div className="mb-12">
          <button
            onClick={saveUserPreferences}
            disabled={isSaving}
            className={`zz-pill ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'saving...' : 'save preferences'}
          </button>
        </div>

        {/* Data Section */}
        <div className="mb-12">
          <h2 className="zz-h3 mb-8">your data</h2>
          <div className="space-y-4">
            
            {/* Export Data Button */}
            <button
              onClick={exportUserData}
              disabled={isExporting}
              className={`zz-pill w-full text-left ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="zz-p1 mb-1">↗ export my data</div>
                  <div className="zz-p1 text-sm opacity-60">
                    download all your data as JSON
                  </div>
                </div>
                {isExporting && (
                  <div className="text-sm opacity-60">exporting...</div>
                )}
              </div>
            </button>

            {/* Delete Data Button */}
            <button
              onClick={deleteUserData}
              disabled={isDeleting}
              className={`zz-pill w-full text-left border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="zz-p1 mb-1">× delete my data</div>
                  <div className="zz-p1 text-sm opacity-60">
                    permanently remove all your information
                  </div>
                </div>
                {isDeleting && (
                  <div className="text-sm opacity-60">deleting...</div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* User Info Display */}
        <div className="mb-12 p-6 border border-opacity-20 border-current">
          <h3 className="zz-p1 mb-4 opacity-80">current user data</h3>
          <div className="space-y-2 text-sm opacity-60">
            <div>name: {userData.name}</div>
            <div>location: {userData.postcode}</div>
            <div>home: {userData.homeType} • {userData.rooms} rooms • {userData.people} people</div>
            <div>energy: {userData.energySource}</div>
            <div>transport: {userData.transport}</div>
            <div>monthly spend: £{userData.monthlySpend.toLocaleString()}</div>
            <div>goals: {userData.goals.join(', ')}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="zz-p1 text-sm opacity-40">
            zero zero • sustainability made simple
          </p>
        </div>
      </div>
    </div>
  );
}
