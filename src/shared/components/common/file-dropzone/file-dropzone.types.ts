import type { ReactNode, RefObject } from "react";
import type {
  FileDropzoneVariant,
  FileDropzoneViewState,
} from "@/shared/components/common/file-dropzone-view-state";

export interface FileDropzoneProps {
  accept?: string;
  actionLabel?: string;
  className?: string;
  description?: string;
  disabled?: boolean;
  dropzoneClassName?: string;
  error?: string | null;
  helper?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  isUploading?: boolean;
  maxFiles?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  preview?: ReactNode;
  showMeta?: boolean;
  title: string;
  variant?: FileDropzoneVariant;
}

export interface FilePreviewListProps {
  files: File[];
  onRemove?: (index: number) => void;
}

export interface FilePreviewItemProps {
  file: File;
  index: number;
  onRemove?: (index: number) => void;
}

export interface DropzonePreviewLayersProps {
  isDragging: boolean;
  preview?: ReactNode;
}

export interface DropzoneIconProps {
  isUploading: boolean;
  viewState: FileDropzoneViewState;
}

export interface DropzoneTextProps {
  description?: string;
  isDragging: boolean;
  viewState: FileDropzoneViewState;
}

export interface DropzoneActionPillProps {
  actionLabel?: string;
  showMeta: boolean;
  viewState: FileDropzoneViewState;
}

export interface DropzoneMetaRowProps {
  actionLabel?: string;
  helper?: string;
  showMeta: boolean;
  viewState: FileDropzoneViewState;
}
