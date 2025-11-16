import { useState } from 'react';
import { Check } from 'lucide-react';
import OptionCard from './OptionCard';
import { supabase } from '../lib/supabase';

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

type Step = 1 | 2 | 3;

const organizationSizes = [
  {
    value: 'small',
    icon: '🏢',
    title: 'Small team',
    description: '10-50 employees, 1-3 teams',
  },
  {
    value: 'growing',
    icon: '🏛️',
    title: 'Growing company',
    description: '50-200 employees, 4-10 teams',
  },
  {
    value: 'midsize',
    icon: '🏗️',
    title: 'Mid-size organization',
    description: '200-1000 employees, 10-25 teams',
  },
  {
    value: 'enterprise',
    icon: '🌆',
    title: 'Large enterprise',
    description: '1000+ employees, 25+ teams',
  },
];

const challenges = [
  {
    value: 'turnover',
    icon: '🔄',
    title: 'High turnover / retention issues',
    description: 'Employees leaving frequently',
  },
  {
    value: 'morale',
    icon: '😞',
    title: 'Low morale and motivation',
    description: 'Team lacks energy and enthusiasm',
  },
  {
    value: 'communication',
    icon: '💬',
    title: 'Poor communication across teams',
    description: 'Silos and information gaps',
  },
  {
    value: 'growth',
    icon: '📈',
    title: 'Lack of career growth opportunities',
    description: 'Limited development paths',
  },
  {
    value: 'balance',
    icon: '⚖️',
    title: 'Work-life balance concerns',
    description: 'Burnout and overwork issues',
  },
  {
    value: 'leadership',
    icon: '👔',
    title: 'Leadership and management quality',
    description: 'Management effectiveness concerns',
  },
];

const actionPlans = [
  {
    value: 'quick',
    icon: '⚡',
    title: 'Quick wins',
    description: '1-2 weeks, low effort, immediate impact',
  },
  {
    value: 'balanced',
    icon: '🎯',
    title: 'Balanced approach',
    description: '1-3 months, moderate effort, sustainable change',
  },
  {
    value: 'strategic',
    icon: '🚀',
    title: 'Strategic initiatives',
    description: '3-6 months, higher effort, transformational',
  },
];

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [organizationSize, setOrganizationSize] = useState<string>('');
  const [primaryChallenge, setPrimaryChallenge] = useState<string>('');
  const [actionPlanPreference, setActionPlanPreference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          organization_size: organizationSize,
          primary_challenge: primaryChallenge,
          action_plan_preference: actionPlanPreference,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return organizationSize !== '';
    if (currentStep === 2) return primaryChallenge !== '';
    if (currentStep === 3) return actionPlanPreference !== '';
    return false;
  };

  const getProgressPercentage = () => {
    return (currentStep / 3) * 100;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">All set!</h2>
          <p className="text-slate-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 mt-2 text-center">
            Step {currentStep} of 3
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  Let's personalize your experience
                </h1>
                <p className="text-slate-600 text-lg">
                  Answer 3 quick questions to get better AI insights (takes 30 seconds)
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  Tell us about your organization
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizationSizes.map((option) => (
                    <OptionCard
                      key={option.value}
                      icon={option.icon}
                      title={option.title}
                      description={option.description}
                      selected={organizationSize === option.value}
                      onClick={() => setOrganizationSize(option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  What's your biggest challenge?
                </h1>
                <p className="text-slate-600 text-lg">
                  Help us understand what matters most to your organization
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  What's your biggest challenge with employee engagement right now?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map((option) => (
                    <OptionCard
                      key={option.value}
                      icon={option.icon}
                      title={option.title}
                      description={option.description}
                      selected={primaryChallenge === option.value}
                      onClick={() => setPrimaryChallenge(option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  Almost done!
                </h1>
                <p className="text-slate-600 text-lg">
                  One last question to tailor your action plans
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  What type of action plans work best for your organization?
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {actionPlans.map((option) => (
                    <OptionCard
                      key={option.value}
                      icon={option.icon}
                      title={option.title}
                      description={option.description}
                      selected={actionPlanPreference === option.value}
                      onClick={() => setActionPlanPreference(option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8 pt-8 border-t border-slate-200">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={currentStep === 3 ? handleComplete : handleNext}
              disabled={!canProceed() || isSubmitting}
              className="ml-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? 'Saving...'
                : currentStep === 3
                ? 'Complete Setup'
                : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
