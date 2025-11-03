"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface WaitlistFormProps {
  onClose: () => void;
  initialCount: number | null;
}

export default function WaitlistForm({ onClose, initialCount }: WaitlistFormProps) {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  
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

  const interestOptions = [
    { id: 'ai-safety', label: language === 'zh-TW' ? 'AI 安全研究' : 'AI Safety Research' },
    { id: 'portfolio', label: language === 'zh-TW' ? '作品集開發' : 'Portfolio Development' },
    { id: 'speaking', label: language === 'zh-TW' ? '演講技巧' : 'Public Speaking' },
    { id: 'debate', label: language === 'zh-TW' ? '辯論訓練' : 'Debate Training' },
    { id: 'coding', label: language === 'zh-TW' ? '程式開發' : 'Software Development' },
    { id: 'content', label: language === 'zh-TW' ? '內容創作' : 'Content Creation' },
  ];

  const tierOptions = [
    { id: 'foundation', label: language === 'zh-TW' ? '基礎課程' : 'Foundation Courses' },
    { id: 'cohort', label: language === 'zh-TW' ? '小班精英' : 'Cohort Programs' },
    { id: 'premium', label: language === 'zh-TW' ? '一對一顧問' : 'Premium Consulting' },
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
      const response = await fetch('/api/studio/waitlist', {
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
        setErrorMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-primary/20 text-center"
      >
        <div className="mb-4 text-4xl">🎉</div>
        <h2 className="text-2xl font-space-grotesk font-bold mb-4">
          {language === 'zh-TW' ? '成功加入！' : "You're on the list!"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {language === 'zh-TW'
            ? `您是第 ${position} 位加入等候名單的人。請查看您的信箱以驗證電子郵件。`
            : `You're #${position} on the waitlist. Check your email to verify your spot.`}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary text-background rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          {language === 'zh-TW' ? '關閉' : 'Close'}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-lg w-full mx-4 border border-primary/20 max-h-[90vh] overflow-y-auto"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/10 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-space-grotesk font-bold mb-2">
        {language === 'zh-TW' ? '加入等候名單' : 'Join the Waitlist'}
      </h2>
      
      <p className="text-sm text-muted-foreground mb-6">
        {language === 'zh-TW'
          ? '2026年2月正式推出。搶先獲得早鳥優惠。'
          : 'Launching February 2026. Get early access and exclusive pricing.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder={language === 'zh-TW' ? '名字' : 'First Name'}
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="px-4 py-2 bg-background border border-primary/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="text"
            placeholder={language === 'zh-TW' ? '姓氏' : 'Last Name'}
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="px-4 py-2 bg-background border border-primary/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Email Field */}
        <input
          type="email"
          required
          placeholder={language === 'zh-TW' ? '電子郵件 *' : 'Email *'}
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
        />

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {language === 'zh-TW' ? '您感興趣的領域' : 'What interests you?'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {interestOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleInterest(option.id)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  formData.interests.includes(option.id)
                    ? 'bg-primary text-background border-primary'
                    : 'bg-background border-primary/20 hover:border-primary/40'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tier Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {language === 'zh-TW' ? '偏好的服務等級' : 'Preferred tier'}
          </label>
          <select
            value={formData.tier}
            onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
            className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
          >
            {tierOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {status === 'error' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 bg-primary text-background rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' 
            ? (language === 'zh-TW' ? '處理中...' : 'Processing...') 
            : (language === 'zh-TW' ? '加入等候名單' : 'Join Waitlist')}
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-muted-foreground text-center">
          {language === 'zh-TW'
            ? '我們尊重您的隱私，絕不會分享您的資訊。'
            : 'We respect your privacy and will never share your information.'}
        </p>
      </form>
    </motion.div>
  );
}
