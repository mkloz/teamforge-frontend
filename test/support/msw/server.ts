import { setupServer } from "msw/node";

import { defaultApiHandlers } from "./handlers";

export const server = setupServer(...defaultApiHandlers);
