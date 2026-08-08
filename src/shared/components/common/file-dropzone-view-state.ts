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
    "size-9 bg-forge-teal/10 text-foreground group-hover:bg-forge-teal/15",
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

const MULTIPLE_FILE_DROP_HINT_BY_VARIANT: Partial<
  Record<FileDropzoneVariant, string>
> = {
  compact: "Multiple files",
  inline: "Multiple files",
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
  const isInactive = isFileDropzoneInactive({ disabled, isUploading });

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
    fileLimit: getFileLimit({ maxFiles, multiple }),
    helperPillClassName: cn(
      "min-w-0 max-w-full truncate font-medium",
      variantStyle.helperPillClassName,
    ),
    iconTileClassName: getIconTileClassName(variantStyle, {
      isCover,
      isDragging,
    }),
    isInactive,
    rootButtonClassName: getRootButtonClassName({
      dropzoneClassName,
      error,
      isDragging,
      isInactive,
      variantStyle,
    }),
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
  const variantStyle = FILE_DROPZONE_VARIANT_STYLES[variant];
  const multipleDropHint = multiple
    ? MULTIPLE_FILE_DROP_HINT_BY_VARIANT[variant]
    : undefined;

  return multipleDropHint
    ? { ...variantStyle, dropHint: multipleDropHint }
    : variantStyle;
}

function isCoverVariant(variant: FileDropzoneVariant) {
  return variant === "cover";
}

function isFileDropzoneInactive({
  disabled,
  isUploading,
}: Pick<FileDropzoneViewStateInput, "disabled" | "isUploading">) {
  return disabled || isUploading;
}

function getFileLimit({
  maxFiles,
  multiple,
}: Pick<FileDropzoneViewStateInput, "maxFiles" | "multiple">) {
  return maxFiles ?? (multiple ? 10 : 1);
}

function getRootInteractionClassName(isDragging: boolean) {
  return isDragging
    ? "border-foreground/45 bg-forge-teal/8 ring-1 ring-foreground/20"
    : "hover:border-foreground/35 hover:shadow-soft-sm";
}

function getRootButtonClassName({
  dropzoneClassName,
  error,
  isDragging,
  isInactive,
  variantStyle,
}: {
  dropzoneClassName?: string;
  error: string | null;
  isDragging: boolean;
  isInactive: boolean;
  variantStyle: FileDropzoneVariantStyle;
}) {
  return cn(
    "group relative flex h-auto w-full cursor-pointer overflow-hidden whitespace-normal border border-border/55 border-dashed bg-card p-0 text-left transition-[border-color,box-shadow,color] duration-200 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantStyle.rootVariantClassName,
    getRootInteractionClassName(isDragging),
    error && "border-destructive/45 bg-destructive/4",
    isInactive && "cursor-not-allowed opacity-60",
    dropzoneClassName,
  );
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
      : "border-border/55 bg-muted/60 text-foreground group-hover:border-foreground/25 group-hover:shadow-soft-sm",
    isDragging &&
      !isCover &&
      "border-transparent bg-primary text-primary-foreground shadow-soft-sm",
  );
}
