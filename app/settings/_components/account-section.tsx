import type { SettingsData } from "../types";

type Props = {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
};

export function AccountSection(_props: Props) { return null; }
