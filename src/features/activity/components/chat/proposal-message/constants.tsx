import { Clock, FileText, MapPin } from "lucide-react";

export const FIELD_ICONS: Record<string, React.ReactNode> = {
  title: <FileText size={14} />,
  description: <FileText size={14} />,
  dateTime: <Clock size={14} />,
  location: <MapPin size={14} />,
};

export const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  dateTime: "Date & Time",
  location: "Location",
};
