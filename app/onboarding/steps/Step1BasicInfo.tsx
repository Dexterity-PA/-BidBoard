"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingValues, GRADE_LEVEL_OPTIONS } from "@/lib/onboarding-schema";

interface Props {
  form: UseFormReturn<OnboardingValues, undefined, OnboardingValues>;
}

export function Step1BasicInfo({ form }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">
                First Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Jane"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 py-2.5 transition-colors duration-150"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">
                Last Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Smith"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 py-2.5 transition-colors duration-150"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="gradeLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-200">
              Grade Level
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-emerald-500 transition-colors duration-150">
                  <SelectValue placeholder="Select your grade level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 border-slate-700">
                {GRADE_LEVEL_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-slate-200 focus:bg-slate-700 focus:text-white"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400 text-xs" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">
                City
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Portland"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 py-2.5 transition-colors duration-150"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">
                State
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="OR"
                  maxLength={2}
                  {...field}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 py-2.5 transition-colors duration-150"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-200">
              ZIP Code
            </FormLabel>
            <FormControl>
              <Input
                placeholder="97201"
                maxLength={5}
                {...field}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 py-2.5 transition-colors duration-150"
              />
            </FormControl>
            <FormMessage className="text-red-400 text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
