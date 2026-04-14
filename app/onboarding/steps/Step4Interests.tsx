"use client";

import { useState, KeyboardEvent } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { OnboardingValues, EXTRACURRICULAR_OPTIONS } from "@/lib/onboarding-schema";

interface Props {
  form: UseFormReturn<OnboardingValues, undefined, OnboardingValues>;
}

export function Step4Interests({ form }: Props) {
  const [interestInput, setInterestInput] = useState("");

  return (
    <div className="space-y-6">
      {/* Extracurriculars — chip toggles */}
      <FormField
        control={form.control}
        name="extracurriculars"
        render={({ field }) => {
          const selected = field.value ?? [];
          return (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">
                Extracurriculars
              </FormLabel>
              <FormDescription className="text-xs text-slate-500">
                Select all that apply
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {EXTRACURRICULAR_OPTIONS.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        field.onChange(
                          isSelected
                            ? selected.filter((v) => v !== opt.value)
                            : [...selected, opt.value]
                        );
                      }}
                      className={[
                        "px-3 py-1.5 rounded-full text-sm border transition-all duration-150 cursor-pointer select-none active:scale-[0.97]",
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          );
        }}
      />

      {/* Interests — free-text tag input */}
      <FormField
        control={form.control}
        name="interests"
        render={({ field }) => {
          const tags = field.value ?? [];

          const addTag = () => {
            const trimmed = interestInput.trim();
            if (trimmed === "") return;
            if (!tags.includes(trimmed)) {
              field.onChange([...tags, trimmed]);
            }
            setInterestInput("");
          };

          const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          };

          return (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">
                Other Interests
              </FormLabel>
              <FormDescription className="text-xs text-slate-500">
                Type an interest and press Enter to add it
              </FormDescription>
              <FormControl>
                <Input
                  placeholder="e.g. machine learning, photography..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={addTag}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 py-2.5 transition-colors duration-150"
                />
              </FormControl>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 pr-1.5 gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(tags.filter((t) => t !== tag))
                        }
                        className="ml-0.5 hover:text-white text-slate-400 transition-colors"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
