
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { DashboardModule, DashboardLevel } from './Dashboard';

interface DashboardHeaderProps {
  userData: OnboardingData;
  currentModule: DashboardModule;
  currentLevel: DashboardLevel;
}

export function DashboardHeader({ userData, currentModule, currentLevel }: DashboardHeaderProps) {
  // Mock location detection based on postcode
  const getLocation = (postcode: string) => {
    // Simple mock - in real app would use geocoding API
    if (postcode.startsWith('SW') || postcode.startsWith('SE')) {
      return 'london, uk';
    }
    if (postcode.startsWith('M')) {
      return 'manchester, uk';
    }
    if (postcode.startsWith('90')) {
      return 'los angeles, usa';
    }
    return 'location unknown';
  };

  const getModuleTitle = () => {
    switch (currentModule) {
      case 'carbon': return 'carbon impact';
      case 'money': return 'savings tracker';
      case 'local': return 'local community';
      case 'partners': return 'partner rewards';
      default: return 'dashboard';
    }
  };

  return (
    <div className="text-center space-y-2 py-4">
      <h1 className="zz-h3">
        hello {userData.name}
      </h1>
      <p className="zz-p2 text-muted-foreground">
        {getLocation(userData.postcode)}
      </p>
      {currentLevel !== 'modules' && (
        <p className="zz-p3 text-accent">
          {getModuleTitle()}
        </p>
      )}
    </div>
  );
}
