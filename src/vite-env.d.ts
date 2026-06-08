/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "lucide-react/dist/esm/icons/*.js" {
  import type { LucideIcon } from "lucide-react";

  const icon: LucideIcon;
  export default icon;
}
