import { useEffect } from "react";

import {
  applyDocumentMetadata,
  type PageMetadata,
} from "@/shared/lib/document-metadata";

export function usePageMetadata(metadata: PageMetadata) {
  useEffect(() => applyDocumentMetadata(metadata), [metadata]);
}
