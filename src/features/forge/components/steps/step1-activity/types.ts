export interface Step1ActivityProps {
  selectedActivity: string | null;
  onSelect: (activity: string) => void;
  shakeRequestId?: number;
}
