"use client";

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
import { OnboardingValues } from "@/lib/onboarding-schema";

interface Props {
  form: UseFormReturn<OnboardingValues, undefined, OnboardingValues>;
}

const inputClass =
  "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 py-2.5 transition-colors duration-150";

export function Step2Academics({ form }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="gpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">GPA</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={4.0}
                  placeholder="3.8"
                  {...field}
                  value={field.value ?? ""}
                  className={inputClass}
                />
              </FormControl>
              <FormDescription className="text-xs text-slate-500">0.0 – 4.0</FormDescription>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="satScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">SAT</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={400}
                  max={1600}
                  placeholder="1400"
                  {...field}
                  value={field.value ?? ""}
                  className={inputClass}
                />
              </FormControl>
              <FormDescription className="text-xs text-slate-500">400 – 1600</FormDescription>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="actScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">ACT</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={36}
                  placeholder="32"
                  {...field}
                  value={field.value ?? ""}
                  className={inputClass}
                />
              </FormControl>
              <FormDescription className="text-xs text-slate-500">1 – 36</FormDescription>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="intendedMajor"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-200">
              Intended Major
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Computer Science"
                {...field}
                className={inputClass}
              />
            </FormControl>
            <FormMessage className="text-red-400 text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="careerInterest"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-200">
              Career Interest
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Software Engineering"
                {...field}
                className={inputClass}
              />
            </FormControl>
            <FormMessage className="text-red-400 text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
