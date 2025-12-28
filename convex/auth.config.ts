import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://arriving-rabbit-65.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
