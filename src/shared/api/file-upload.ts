import { z } from "zod";

import { apiClient } from "@/shared/api/api";

export const uploadedFileUrlSchema = z.object({
  url: z.string().url(),
});

export type UploadedFileUrl = z.infer<typeof uploadedFileUrlSchema>;

export function buildFileUploadBody(file: File, fieldName = "file") {
  const body = new FormData();
  body.set(fieldName, file);

  return body;
}

export class FileUploadApi {
  static async uploadImage(file: File): Promise<UploadedFileUrl> {
    const response = await apiClient
      .post("file-upload/image", {
        body: buildFileUploadBody(file),
      })
      .json<unknown>();

    return uploadedFileUrlSchema.parse(response);
  }

  static async uploadChatAttachment(file: File): Promise<UploadedFileUrl> {
    const response = await apiClient
      .post("file-upload/chat-attachment", {
        body: buildFileUploadBody(file),
      })
      .json<unknown>();

    return uploadedFileUrlSchema.parse(response);
  }
}
