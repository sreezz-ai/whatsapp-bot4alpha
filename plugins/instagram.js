const { exec } = require("child_process");
const fs = require("fs");

addCommand(
  {
    pattern: "ig ?(.*)",
    fromMe: true,
    desc: "Download Instagram reel/post"
  },
  async (message, match) => {

    const url = match[1];
    if (!url || !url.includes("instagram.com")) {
      return await message.reply("❌ Give a valid Instagram link");
    }

    await message.reply("📥 Downloading from Instagram...");

    const output = `./temp/ig_${Date.now()}.mp4`;

    exec(
      `yt-dlp -f mp4 -o "${output}" "${url}"`,
      async (error) => {

        if (error || !fs.existsSync(output)) {
          console.error(error);
          return await message.reply("❌ Instagram download failed");
        }

        await message.sock.sendMessage(
          message.message.key.remoteJid,
          {
            video: fs.readFileSync(output),
            caption: "📸 Instagram Download"
          }
        );

        fs.unlinkSync(output);
      }
    );
  }
);
