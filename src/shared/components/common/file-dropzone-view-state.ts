import { cn } from "@/shared/lib/utils";

export type FileDropzoneVariant = "cover" | "avatar" | "compact" | "inline";

interface FileDropzoneViewStateInput {
  disabled: boolean;
  dropzoneClassName?: string;
  error: string | null;
  isDragging: boolean;
  isUploading: boolean;
  maxFiles?: number;
  multiple: boolean;
  title: string;
  variant: FileDropzoneVariant;
}

export interface FileDropzoneViewState {
  actionPillClassName: string;
  bodyClassName: string;
  descriptionClassName: string;
  dropHint: string;
  dropHintPillClassName: string;
  dropPillClassName: string;
  fileLimit: number;
  helperPillClassName: string;
  iconTileClassName: string;
  isInactive: boolean;
  rootButtonClassName: string;
  titleClassName: string;
  titleText: string;
  uploadIconClassName: string;
}

interface FileDropzoneVariantStyle {
  bodyClassName: string;
  descriptionClassName: string;
  dropHint: string;
  dropHintPillClassName: string;
  dropPillClassName: string;
  helperPillClassName: string;
  iconTileClassName: string;
  rootVariantClassName: string;
  titleClassName: string;
}

const COVER_DROPZONE_STYLE: FileDropzoneVariantStyle = {
  bodyClassName:
    "min-h-44 justify-end bg-linear-to-t from-black/60 via-black/24 to-transparent text-white",
  descriptionClassName: "text-white/78",
  dropHint: "Landscape image",
  dropHintPillClassName: "border-white/18 bg-white/10 text-white/80",
  dropPillClassName: "bg-white/20 text-white",
  helperPillClassName: "border-white/12 bg-white/6 text-white/60",
  iconTileClassName: "size-9 bg-white/14 text-white group-hover:bg-white/20",
  rootVariantClassName: "min-h-44 rounded-xl",
  titleClassName: "text-white",
};

const STANDARD_DROPZONE_STYLE: Omit<
  FileDropzoneVariantStyle,
  "dropHint" | "rootVariantClassName"
> = {
  bodyClassName: "",
  descriptionClassName: "text-slate-muted",
  dropHintPillClassName: "border-border/70 bg-muted/70 text-slate-muted",
  dropPillClassName: "bg-forge-teal text-white",
  helperPillClassName: "border-border/50 bg-muted/40 text-slate-muted/75",
  iconTileClassName:
    "size-9 bg-forge-teal/10 text-forge-teal group-hover:bg-forge-teal/15",
  titleClassName: "text-ink",
};

const FILE_DROPZONE_VARIANT_STYLES: Record<
  FileDropzoneVariant,
  FileDropzoneVariantStyle
> = {
  avatar: {
    ...STANDARD_DROPZONE_STYLE,
    dropHint: "Square image",
    rootVariantClassName: "min-h-20 rounded-lg sm:min-h-24",
  },
  compact: {
    ...STANDARD_DROPZONE_STYLE,
    dropHint: "Single file",
    rootVariantClassName: "min-h-28 rounded-lg",
  },
  cover: COVER_DROPZONE_STYLE,
  inline: {
    ...STANDARD_DROPZONE_STYLE,
    dropHint: "Single file",
    rootVariantClassName: "min-h-24 rounded-lg",
  },
};

export function getFileDropzoneViewState({
  disabled,
  dropzoneClassName,
  error,
  isDragging,
  isUploading,
  maxFiles,
  multiple,
  title,
  variant,
}: FileDropzoneViewStateInput): FileDropzoneViewState {
  const variantStyle = getVariantStyle(variant, multiple);
  const isCover = isCoverVariant(variant);
  const isInactive = disabled || isUploading;

  return {
    actionPillClassName: getActionPillClassName({ isCover, isDragging }),
    bodyClassName: cn(
      "relative z-10 flex w-full flex-col gap-2 px-5 py-4",
      variantStyle.bodyClassName,
    ),
    descriptionClassName: cn(
      "line-clamp-1 text-xs leading-snug",
      variantStyle.descriptionClassName,
    ),
    dropHint: variantStyle.dropHint,
    dropHintPillClassName: cn(
      "font-medium",
      variantStyle.dropHintPillClassName,
    ),
    dropPillClassName: cn(
      "type-signature-label px-2 py-0.5 font-semibold tracking-wide",
      variantStyle.dropPillClassName,
    ),
    fileLimit: maxFiles ?? (multiple ? 10 : 1),
    helperPillClassName: cn(
      "min-w-0 max-w-full truncate font-medium",
      variantStyle.helperPillClassName,
    ),
    iconTileClassName: getIconTileClassName(variantStyle, {
      isCover,
      isDragging,
    }),
    isInactive,
    rootButtonClassName: cn(
      "group relative flex h-auto w-full cursor-pointer overflow-hidden whitespace-normal border border-border/55 border-dashed bg-card p-0 text-left transition-all duration-200 focus-visible:ring-forge-teal/35",
      variantStyle.rootVariantClassName,
      isDragging
        ? "border-forge-teal/60 bg-forge-teal/5 ring-2 ring-forge-teal/15"
        : "hover:border-forge-teal/40 hover:bg-forge-teal/3 hover:ring-1 hover:ring-forge-teal/10",
      error && "border-destructive/45 bg-destructive/4",
      isInactive && "cursor-not-allowed opacity-60",
      dropzoneClassName,
    ),
    titleClassName: cn(
      "min-w-0 truncate font-semibold text-sm leading-tight tracking-tight",
      variantStyle.titleClassName,
    ),
    titleText: isUploading ? "Uploading…" : title,
    uploadIconClassName: cn(
      "size-4 transition-transform duration-200",
      isDragging && "-translate-y-px",
    ),
  };
}

export function getFiles(fileList: FileList | null, maxFiles: number) {
  return fileList ? Array.from(fileList).slice(0, maxFiles) : [];
}

function getVariantStyle(
  variant: FileDropzoneVariant,
  multiple: boolean,
): FileDropzoneVariantStyle {
  if (variant === "compact" && multiple) {
    return {
      ...FILE_DROPZONE_VARIANT_STYLES.compact,
      dropHint: "Multiple files",
    };
  }

  if (variant === "inline" && multiple) {
    return {
      ...FILE_DROPZONE_VARIANT_STYLES.inline,
      dropHint: "Multiple files",
    };
  }

  return FILE_DROPZONE_VARIANT_STYLES[variant];
}

function isCoverVariant(variant: FileDropzoneVariant) {
  return variant === "cover";
}

function getIconTileClassName(
  variantStyle: FileDropzoneVariantStyle,
  {
    isCover,
    isDragging,
  }: {
    isCover: boolean;
    isDragging: boolean;
  },
) {
  return cn(
    "transition-all duration-200",
    variantStyle.iconTileClassName,
    isDragging && !isCover && "scale-110 bg-forge-teal/18",
  );
}

function getActionPillClassName({
  isCover,
  isDragging,
}: {
  isCover: boolean;
  isDragging: boolean;
}) {
  return cn(
    "ml-auto hidden px-4 py-1.5 font-semibold transition-all duration-200 sm:inline-flex",
    isCover
      ? "border-white/28 bg-white/12 text-white group-hover:bg-white/22"
      : "border-forge-teal/25 bg-forge-teal/8 text-forge-teal group-hover:border-forge-teal/40 group-hover:bg-forge-teal/14",
    isDragging && !isCover && "border-forge-teal/50 bg-forge-teal/18",
  );
}
