import { randomUUID } from "crypto";
import readline from "readline";
import { createClient } from "redis";

const CHANNEL = "chat";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askUsername = () =>
  new Promise((resolve) => {
    rl.question("Enter your username: ", (answer) => {
      resolve(answer.trim() || `User-${randomUUID().slice(0, 4)}`);
    });
  });

const main = async () => {
  const username = await askUsername();

  const client = createClient();
  client.on("error", console.error);
  await client.connect();

  const subscriber = client.duplicate();
  await subscriber.connect();

  await subscriber.subscribe(CHANNEL, (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.from === username) return;

      const time = new Date(msg.timestamp).toLocaleTimeString();

      if (msg.type === "status") {
        console.log(`[${time}] *** ${msg.from} ${msg.text} ***`);
      } else if (msg.type === "message") {
        console.log(`[${time}] ${msg.from}: ${msg.text}`);
      }

      process.stdout.write("> ");
    } catch {
      console.log("Malformed message:", raw);
    }
  });

  // Broadcast join message
  await client.publish(
    CHANNEL,
    JSON.stringify({
      type: "status",
      from: username,
      text: "has joined the chat",
      timestamp: new Date().toISOString(),
    })
  );

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", async (line) => {
    const text = line.trim();
    if (!text) {
      rl.prompt();
      return;
    }
    await client.publish(
      CHANNEL,
      JSON.stringify({
        type: "message",
        from: username,
        text,
        timestamp: new Date().toISOString(),
      })
    );
    rl.prompt();
  });

  const shutdown = async () => {
    await client.publish(
      CHANNEL,
      JSON.stringify({
        type: "status",
        from: username,
        text: "has left the chat",
        timestamp: new Date().toISOString(),
      })
    );

    rl.close();
    await subscriber.unsubscribe(CHANNEL);
    await subscriber.quit();
    await client.quit();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

main();
