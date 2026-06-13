export type NotificationPrefs = {
  deadlines_7d: boolean;
  deadlines_3d: boolean;
  deadlines_1d: boolean;
  weekly_digest: boolean;
  product_updates: boolean;
};

export type SettingsData = {
  // Clerk
  email: string;
  imageUrl: string;
  // users table
  firstName: string;
  lastName: string;
  // student_profiles
  graduationYear: number | null;
  schoolName: string | null;
  gpa: string | null;
  intendedMajor: string | null;
  state: string | null;
  gradeLevel: string | null;
  minAwardAmount: number | null;
  categoriesOfInterest: string[];
  maxHoursWilling: number | null;
  preferredDeadlineRange: string | null;
  notificationPreferences: NotificationPrefs;
};
