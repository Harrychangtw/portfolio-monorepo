"use client";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface WaitlistFormProps {
  onClose: () => void;
  initialCount: number | null;
}

export default function WaitlistForm({ onClose, initialCount }: WaitlistFormProps) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    interests: [] as string[],
    tier: 'foundation',
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [position, setPosition] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const interestOptions = [
    { id: 'frameworks', label: t('lab.interests.frameworks', 'common') },
    { id: 'speaking', label: t('lab.interests.speaking', 'common') },
    { id: 'narrative', label: t('lab.interests.narrative', 'common') },
  ];

  const tierOptions = [
    { id: 'async', label: t('lab.tiers.async', 'common') },
    { id: 'cohort', label: t('lab.tiers.cohort', 'common') },
    { id: 'consulting', label: t('lab.tiers.consulting', 'common') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    const payload = {
      ...formData,
      locale: language,
      referralSource: searchParams.get('ref'),
      utmSource: searchParams.get('utm_source'),
      utmMedium: searchParams.get('utm_medium'),
      utmCampaign: searchParams.get('utm_campaign'),
    };
    
    try {
      const response = await fetch('/api/lab/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setPosition(data.position);
      } else {
        setStatus('error');
        setErrorMessage(data.error || t('lab.errorGeneric', 'common'));
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(t('lab.errorNetwork', 'common'));
    }
  };

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  if (status === 'success') {
    return (
      <div
        className="bg-[#111] rounded-2xl p-8 max-w-md w-full mx-2 border border-primary/20 text-center"
      >
        <div className="mb-4 text-4xl">🎉</div>
        <h2 className="text-2xl font-space-grotesk font-bold mb-4">
          {t('lab.successTitle', 'common')}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t('lab.successMessage', 'common').replace('{position}', String(position))}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary text-background rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          {t('lab.close', 'common')}
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-[#111] rounded-2xl p-6 md:p-8 max-w-lg w-full mx-2 border border-white/20 max-h-[90vh] overflow-y-auto relative"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-space-grotesk font-bold mb-2 text-white">
        {t('lab.formTitle', 'common')}
      </h2>
      
      <p className="text-sm text-muted-foreground mb-6">
        {t('lab.formSubtitle', 'common')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder={t('lab.firstName', 'common')}
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="px-4 py-2 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/80"
          />
          <input
            type="text"
            placeholder={t('lab.lastName', 'common')}
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="px-4 py-2 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/80"
          />
        </div>

        <input
          ref={emailInputRef}
          type="email"
          required
          placeholder={t('lab.emailRequired', 'common')}
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-2 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/80"
        />

        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">
            {t('lab.whatInterests', 'common')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {interestOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleInterest(option.id)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  formData.interests.includes(option.id)
                    ? 'bg-primary text-background border-primary'
                    : 'bg-transparent border-white/20 hover:border-white/40 text-white/80'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">
            {t('lab.preferredTier', 'common')}
          </label>
          <select
            value={formData.tier}
            onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
            className="w-full px-4 py-2 bg-[#111] border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white"
          >
            {tierOptions.map(option => (
              <option key={option.id} value={option.id} className="bg-[#111] text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {status === 'error' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 bg-primary text-background rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' 
            ? t('lab.processing', 'common')
            : t('lab.joinWaitlist', 'common')}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          {t('lab.privacyNote', 'common')}
        </p>
      </form>
    </div>
  );
}
