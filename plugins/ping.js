addCommand(
  {
    pattern: "ping",
    fromMe: true,
    desc: "Check bot alive"
  },
  async (message) => {
    await message.reply("🏓 Pong! Asena userbot active 😎");
  }
);
