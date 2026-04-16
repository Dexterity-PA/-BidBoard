"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  onboardingSchema,
  OnboardingValues,
  STEP_FIELDS,
} from "@/lib/onboarding-schema";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2Academics } from "./steps/Step2Academics";
import { Step3Demographics } from "./steps/Step3Demographics";
import { Step4Interests } from "./steps/Step4Interests";

const STEPS = [
  { number: 1, title: "Basic Info",    subtitle: "Tell us who you are" },
  { number: 2, title: "Academics",     subtitle: "Your academic background" },
  { number: 3, title: "Demographics",  subtitle: "Help us find the right scholarships" },
  { number: 4, title: "Interests",     subtitle: "What you love doing" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const done    = current > step.number;
        const active  = current === step.number;
        return (
          <div key={step.number} className="flex items-center">
            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                done
                  ? "bg-emerald-500 text-slate-950"
                  : active
                  ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 bg-slate-900 text-emerald-400"
                  : "bg-slate-700 text-slate-400",
              ].join(" ")}
            >
              {done ? <Check className="w-4 h-4" /> : step.number}
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  "h-px w-12 transition-colors duration-300",
                  current > step.number ? "bg-emerald-500" : "bg-slate-700",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const form = useForm<OnboardingValues, undefined, OnboardingValues>({
    resolver: zodResolver(onboardingSchema) as never,
    mode: "onTouched",
    defaultValues: {
      firstName:           "",
      lastName:            "",
      zipCode:             "",
      state:               "",
      city:                "",
      intendedMajor:       "",
      careerInterest:      "",
      ethnicity:           [],
      firstGeneration:     false,
      disabilities:        false,
      militaryFamily:      false,
      extracurriculars:    [],
      interests:           [],
    },
  });

  const currentStep = STEPS[step - 1];

  const transitionTo = (next: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 150);
  };

  const handleNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    transitionTo(step + 1);
  };

  const handleBack = () => {
    transitionTo(step - 1);
  };

  const onSubmit: SubmitHandler<OnboardingValues> = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data.detail ? `: ${data.detail}` : "";
        throw new Error((data.error ?? "Something went wrong. Please try again.") + detail);
      }
      // Hard navigation bypasses the Next.js client-side router cache.
      // router.push("/dashboard") would serve the cached redirect
      // (/dashboard → /onboarding) that middleware wrote before the profile
      // existed, looping the user back even though the profile is now saved.
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8">
        <StepIndicator current={step} />

        <div className="mb-6">
          <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest mb-1">
            Step {step} of {STEPS.length}
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {currentStep.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{currentStep.subtitle}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? "translateY(8px)" : "translateY(0)",
                transition: "opacity 150ms ease, transform 150ms ease",
              }}
            >
              {step === 1 && <Step1BasicInfo form={form} />}
              {step === 2 && <Step2Academics form={form} />}
              {step === 3 && <Step3Demographics form={form} />}
              {step === 4 && <Step4Interests form={form} />}
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
            )}

            <div className="flex items-center justify-between mt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                className="text-slate-400 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-colors"
              >
                Back
              </Button>

              {step < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-6 py-2.5 transition-colors duration-150"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-6 py-2.5 transition-colors duration-150 disabled:opacity-70"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
