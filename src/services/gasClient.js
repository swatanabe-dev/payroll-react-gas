import { GASClient } from "gas-client";

export const { serverFunctions } = new GASClient();

// NOTE: Well, unfortunately, the localhost dev env setups didn't work out after a few different approaches
// So, stick with "npm run build && clasp push"
// export const { serverFunctions } = new GASClient({
//   allowedDevelopmentDomains: (origin) =>
//     /https:\/\/.*\.googleusercontent\.com$/.test(origin),
// });

// const { serverFunctions } = new GASClient({
//   allowedDevelopmentDomains: "https://localhost:5173",
// });
