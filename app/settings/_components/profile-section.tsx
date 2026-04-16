import type { SettingsData } from "../types";

type Props = {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
  onDirty: (dirty: boolean) => void;
};

export function ProfileSection(_props: Props) { return null; }
