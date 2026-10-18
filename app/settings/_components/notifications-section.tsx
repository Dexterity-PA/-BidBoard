import Link from "next/link";
import type { FC } from "react";
import type { SettingsData } from "../types";

interface Props {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
  onDirty: (dirty: boolean) => void;
}

export const NotificationsSection: FC<Props> = () => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Email notifications</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose which reminders and account emails you want to receive.
        </p>
      </div>
      <Link href="/settings/notifications" className="m-btn m-btn-primary">
        Manage email notifications
      </Link>
    </section>
  );
};
