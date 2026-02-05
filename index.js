const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Load Asena-style system
require("./events");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    browser: ["Asena Userbot", "Linux", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  // 🔹 Connection / QR
  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) qrcode.generate(qr, { small: true });

    if (connection === "open")
      console.log("✅ ASENA USERBOT CONNECTED");

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) startBot();
    }
  });

  // 🔹 Load plugins
  fs.readdirSync("./plugins").forEach(file => {
    require(`./plugins/${file}`);
  });

  // 🔥 MESSAGE HANDLER (ASENA CORE)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    for (let cmd of Commands) {

      // fromMe: true logic
      if (cmd.fromMe && !msg.key.fromMe) continue;

      const regex = new RegExp("^" + cmd.pattern + "$", "i");
      const match = text.match(regex);

      if (match) {
        await cmd.func(
          {
            sock,
            message: msg,
            reply: async (txt) =>
              await sock.sendMessage(msg.key.remoteJid, { text: txt })
          },
          match
        );
      }
    }
  });
}

startBot();
