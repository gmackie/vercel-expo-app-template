import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./routers/index.js";

export const trpc = createTRPCReact<AppRouter>();
