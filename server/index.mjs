import { createApp } from "./app.mjs";

const port = Number(process.env.PORT ?? "8787");
const host = process.env.HOST ?? "127.0.0.1";
const server = createApp();

server.listen(port, host, () => {
  console.log(`FireScope server listening on http://${host}:${port}`);
});
