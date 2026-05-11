import { z } from "zod";

import { apiClient } from "@/shared/api/api";
import {
  CHAT_ATTACHMENT_ACCEPTED_EXTENSIONS,
  CHAT_ATTACHMENT_ACCEPTED_TYPES,
  CHAT_ATTACHMENT_MAX_SIZE_BYTES,
  IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
  IMAGE_UPLOAD_ACCEPTED_TYPES,
  IMAGE_UPLOAD_MAX_SIZE_BYTES,
} from "@/shared/api/api-constraints";

export const uploadedFileUrlSchema = z.object({
  url: z.string().url(),
});

export type UploadedFileUrl = z.infer<typeof uploadedFileUrlSchema>;

export function buildFileUploadBody(file: File, fieldName = "file") {
  const body = new FormData();
  body.set(fieldName, file);

  return body;
}

export function assertAcceptedFile(
  file: File,
  options: {
    acceptedExtensions: readonly string[];
    acceptedTypes: readonly string[];
    maxSizeBytes: number;
    sizeLabel: string;
  },
) {
  if (file.size > options.maxSizeBytes) {
    throw new Error(`File must be ${options.sizeLabel} or smaller.`);
  }

  const extensionIndex = file.name.lastIndexOf(".");
  const extension =
    extensionIndex >= 0 ? file.name.slice(extensionIndex).toLowerCase() : "";
  const hasAcceptedType =
    file.type !== "" && options.acceptedTypes.includes(file.type);
  const hasAcceptedExtension = options.acceptedExtensions.includes(extension);

  if (
    file.type
      ? !hasAcceptedType || !hasAcceptedExtension
      : !hasAcceptedExtension
  ) {
    throw new Error("This file type is not supported.");
  }
}

export class FileUploadApi {
  static async uploadImage(file: File): Promise<UploadedFileUrl> {
    assertAcceptedFile(file, {
      acceptedExtensions: IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
      acceptedTypes: IMAGE_UPLOAD_ACCEPTED_TYPES,
      maxSizeBytes: IMAGE_UPLOAD_MAX_SIZE_BYTES,
      sizeLabel: "30 MB",
    });

    const response = await apiClient
      .post("file-upload/image", {
        body: buildFileUploadBody(file),
      })
      .json<unknown>();

    return uploadedFileUrlSchema.parse(response);
  }

  static async uploadChatAttachment(file: File): Promise<UploadedFileUrl> {
    assertAcceptedFile(file, {
      acceptedExtensions: CHAT_ATTACHMENT_ACCEPTED_EXTENSIONS,
      acceptedTypes: CHAT_ATTACHMENT_ACCEPTED_TYPES,
      maxSizeBytes: CHAT_ATTACHMENT_MAX_SIZE_BYTES,
      sizeLabel: "40 MB",
    });

    const response = await apiClient
      .post("file-upload/chat-attachment", {
        body: buildFileUploadBody(file),
      })
      .json<unknown>();

    return uploadedFileUrlSchema.parse(response);
  }
}
