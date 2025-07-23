
import { useState } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface SignupCardProps {
  onClose: () => void;
  userData: OnboardingData;
}

export function SignupCard({ onClose, userData }: SignupCardProps) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSignup = (method: 'apple' | 'google' | 'email') => {
    // Mock signup - in real app would integrate with auth providers
    alert(`signing up with ${method}...`);
    onClose();
  };

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock feedback submission
    console.log('Feedback to gary@lomi-lomi.co.uk:', feedback);
    setFeedbackSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div className="bg-card border border-border zz-radius-lg p-6 w-full max-w-md space-y-6">
        <div className="text-center">
          <h3 className="zz-h4 mb-2">hi {userData.name}!</h3>
          <p className="zz-p2 text-muted-foreground">
            sign up to save your progress and get personalized recommendations
          </p>
        </div>

        {!feedbackSent ? (
          <>
            <div className="space-y-3">
              <button
                onClick={() => handleSignup('apple')}
                className="w-full bg-foreground text-background zz-radius py-3 px-4 zz-p1 hover:bg-foreground/90 transition-colors"
              >
                continue with apple
              </button>
              
              <button
                onClick={() => handleSignup('google')}
                className="w-full bg-foreground text-background zz-radius py-3 px-4 zz-p1 hover:bg-foreground/90 transition-colors"
              >
                continue with google
              </button>
              
              <button
                onClick={() => handleSignup('email')}
                className="w-full bg-foreground text-background zz-radius py-3 px-4 zz-p1 hover:bg-foreground/90 transition-colors"
              >
                continue with email
              </button>
            </div>

            <div className="border-t border-border pt-4">
              <form onSubmit={handleFeedback} className="space-y-3">
                <label className="zz-p3 text-muted-foreground">
                  or send feedback instead:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="what would you like to see in zero zero?"
                  className="w-full bg-input border border-border zz-radius p-3 zz-p2 resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!feedback.trim()}
                  className="w-full bg-accent text-accent-foreground zz-radius py-2 px-4 zz-p2 disabled:opacity-50 hover:bg-accent/90 transition-colors"
                >
                  send feedback
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-accent zz-h3">✓</div>
            <p className="zz-p1">feedback sent to gary@lomi-lomi.co.uk</p>
            <p className="zz-p2 text-muted-foreground">thank you!</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 zz-p2 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
