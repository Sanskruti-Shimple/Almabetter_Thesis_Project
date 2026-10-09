import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { connectDatabase } from "./db.js";

async function start() {
  const config = getConfig();
  await connectDatabase(config.mongoUri);
  const app = createApp(config);
  const server = app.listen(config.port, () => {
    console.log(`MarketNest API listening on port ${config.port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close(async () => {
        const mongoose = await import("mongoose");
        await mongoose.default.disconnect();
        process.exit(0);
      });
    });
  }
}

start().catch((error) => {
  console.error("Failed to start MarketNest API:", error);
  process.exitCode = 1;
});
