// components/lab/waitlist-form.tsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { X } from "lucide-react";

interface WaitlistFormProps {
  onClose: () => void;
}

export default function WaitlistForm({ onClose }: WaitlistFormProps) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const firstNameRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    interests: [] as string[],
    tier: "quickConsult",
    background: "",
    challenges: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      firstNameRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const interestOptions = [
    { id: "frameworks", label: t("lab.interests.frameworks", "common") },
    { id: "speaking", label: t("lab.interests.speaking", "common") },
    { id: "narrative", label: t("lab.interests.narrative", "common") },
  ];

  const tierOptions = [
    { id: "quickConsult", label: t("lab.tiers.quickConsult", "common") },
    { id: "deepDive", label: t("lab.tiers.deepDive", "common") },
    { id: "writtenReview", label: t("lab.tiers.writtenReview", "common") },
  ];

  const validate = (): boolean => {
    const errors: Record<string, boolean> = {};
    if (!formData.firstName.trim()) errors.firstName = true;
    if (!formData.lastName.trim()) errors.lastName = true;
    if (!formData.email.trim()) errors.email = true;
    if (formData.interests.length === 0) errors.interests = true;
    if (!formData.background.trim()) errors.background = true;
    if (!formData.challenges.trim()) errors.challenges = true;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    const payload = {
      ...formData,
      locale: language,
      referralSource: searchParams.get("ref"),
      utmSource: searchParams.get("utm_source"),
      utmMedium: searchParams.get("utm_medium"),
      utmCampaign: searchParams.get("utm_campaign"),
    };

    try {
      const response = await fetch("/api/lab/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || t("lab.errorGeneric", "common"));
      }
    } catch {
      setStatus("error");
      setErrorMessage(t("lab.errorNetwork", "common"));
    }
  };

  const toggleInterest = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
    // Clear interest validation error on toggle
    if (validationErrors.interests) {
      setValidationErrors((prev) => ({ ...prev, interests: false }));
    }
  };

  const fieldClass = (field: string, base: string) =>
    `${base} ${validationErrors[field] ? "border-red-500/60 focus:border-red-500" : "border-border focus:border-primary"}`;

  if (status === "success") {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-8 max-w-md w-full mx-2 border border-border text-center shadow-lg"
      >
        <div className="mb-4 text-4xl">✓</div>
        <h2 className="text-2xl font-heading font-bold mb-4 text-foreground">
          {t("lab.successTitle", "common")}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t("lab.successMessage", "common")}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 font-heading bg-primary text-background rounded-md hover:bg-primary/90 transition-colors"
        >
          {t("lab.close", "common")}
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-card rounded-2xl p-6 md:p-8 max-w-lg w-full mx-2 border border-border max-h-[90vh] overflow-y-auto relative shadow-2xl"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-background transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-heading font-bold mb-2 text-foreground">
        {t("lab.formTitle", "common")}
      </h2>

      <p className="text-sm font-heading text-muted-foreground mb-6">
        {t("lab.formSubtitle", "common")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <input
            ref={firstNameRef}
            type="text"
            required
            placeholder={`${t("lab.firstName", "common")} *`}
            value={formData.firstName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, firstName: e.target.value }));
              if (validationErrors.firstName)
                setValidationErrors((prev) => ({ ...prev, firstName: false }));
            }}
            className={fieldClass(
              "firstName",
              "px-4 py-2 bg-background border rounded-lg focus:outline-none transition-colors text-foreground placeholder:text-secondary",
            )}
          />
          <input
            type="text"
            required
            placeholder={`${t("lab.lastName", "common")} *`}
            value={formData.lastName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, lastName: e.target.value }));
              if (validationErrors.lastName)
                setValidationErrors((prev) => ({ ...prev, lastName: false }));
            }}
            className={fieldClass(
              "lastName",
              "px-4 py-2 bg-background border rounded-lg focus:outline-none transition-colors text-foreground placeholder:text-secondary",
            )}
          />
        </div>

        {/* Email */}
        <input
          type="email"
          required
          placeholder={t("lab.emailRequired", "common")}
          value={formData.email}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, email: e.target.value }));
            if (validationErrors.email)
              setValidationErrors((prev) => ({ ...prev, email: false }));
          }}
          className={fieldClass(
            "email",
            "w-full px-4 py-2 bg-background border rounded-lg focus:outline-none transition-colors text-foreground placeholder:text-secondary",
          )}
        />

        {/* Background */}
        <div>
          <label className="block text-sm font-heading font-medium mb-1.5 text-foreground/80">
            {t("lab.backgroundLabel", "common")} *
          </label>
          <textarea
            required
            rows={2}
            placeholder={t("lab.backgroundPlaceholder", "common")}
            value={formData.background}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, background: e.target.value }));
              if (validationErrors.background)
                setValidationErrors((prev) => ({ ...prev, background: false }));
            }}
            className={fieldClass(
              "background",
              "w-full px-4 py-2 bg-background border rounded-lg focus:outline-none transition-colors text-foreground placeholder:text-secondary resize-none",
            )}
          />
        </div>

        {/* Challenges */}
        <div>
          <label className="block text-sm font-heading font-medium mb-1.5 text-foreground/80">
            {t("lab.challengesLabel", "common")} *
          </label>
          <textarea
            required
            rows={3}
            placeholder={t("lab.challengesPlaceholder", "common")}
            value={formData.challenges}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, challenges: e.target.value }));
              if (validationErrors.challenges)
                setValidationErrors((prev) => ({ ...prev, challenges: false }));
            }}
            className={fieldClass(
              "challenges",
              "w-full px-4 py-2 bg-background border rounded-lg focus:outline-none transition-colors text-foreground placeholder:text-secondary resize-none",
            )}
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-heading font-medium mb-1.5 text-foreground/80">
            {t("lab.whatInterests", "common")} *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {interestOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleInterest(option.id)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  formData.interests.includes(option.id)
                    ? "bg-primary text-background border-primary"
                    : validationErrors.interests
                      ? "bg-background border-red-500/60 text-muted-foreground hover:bg-background"
                      : "bg-background border-border hover:border-primary/50 text-muted-foreground hover:bg-background"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {validationErrors.interests && (
            <p className="text-xs text-red-400 mt-1.5">
              {t("lab.errorSelectInterest", "common")}
            </p>
          )}
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm font-heading font-medium mb-1.5 text-foreground/80">
            {t("lab.preferredTier", "common")} *
          </label>
          <select
            value={formData.tier}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tier: e.target.value }))
            }
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
          >
            {tierOptions.map((option) => (
              <option
                key={option.id}
                value={option.id}
                className="bg-background text-foreground"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3 bg-primary text-background rounded-lg font-heading hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading"
            ? t("lab.processing", "common")
            : t("lab.submitApplication", "common")}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          {t("lab.privacyNote", "common")}
        </p>
      </form>
    </div>
  );
}
