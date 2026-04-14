"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  OnboardingValues,
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  CITIZENSHIP_OPTIONS,
  INCOME_OPTIONS,
} from "@/lib/onboarding-schema";

interface Props {
  form: UseFormReturn<OnboardingValues, undefined, OnboardingValues>;
}

const selectTriggerClass =
  "bg-slate-800 border-slate-700 text-white focus:ring-emerald-500 transition-colors duration-150";
const selectContentClass = "bg-slate-800 border-slate-700";
const selectItemClass = "text-slate-200 focus:bg-slate-700 focus:text-white";

export function Step3Demographics({ form }: Props) {
  return (
    <div className="space-y-6">
      {/* Ethnicity */}
      <FormField
        control={form.control}
        name="ethnicity"
        render={() => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-200">
              Ethnicity <span className="text-slate-500 font-normal">(select all that apply)</span>
            </FormLabel>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ETHNICITY_OPTIONS.map((option) => (
                <FormField
                  key={option}
                  control={form.control}
                  name="ethnicity"
                  render={({ field }) => {
                    const values = field.value ?? [];
                    return (
                      <FormItem className="flex items-center gap-2.5 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={values.includes(option)}
                            onCheckedChange={(checked) => {
                              field.onChange(
                                checked
                                  ? [...values, option]
                                  : values.filter((v) => v !== option)
                              );
                            }}
                            className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-slate-300 font-normal cursor-pointer">
                          {option}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage className="text-red-400 text-xs" />
          </FormItem>
        )}
      />

      {/* Gender + Citizenship */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={selectContentClass}>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className={selectItemClass}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="citizenship"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-200">Citizenship</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={selectContentClass}>
                  {CITIZENSHIP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className={selectItemClass}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Family Income */}
      <FormField
        control={form.control}
        name="familyIncomeBracket"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-200">
              Family Income Bracket
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className={selectContentClass}>
                {INCOME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className={selectItemClass}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400 text-xs" />
          </FormItem>
        )}
      />

      {/* Boolean toggles */}
      <div className="space-y-3">
        {(
          [
            { name: "firstGeneration", label: "I am a first-generation college student" },
            { name: "disabilities",    label: "I have a documented disability" },
            { name: "militaryFamily",  label: "I come from a military family" },
          ] as const
        ).map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-slate-800 px-4 py-3 bg-slate-800/40">
                <FormControl>
                  <Checkbox
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                    className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                </FormControl>
                <FormLabel className="text-sm text-slate-300 font-normal cursor-pointer">
                  {label}
                </FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}
