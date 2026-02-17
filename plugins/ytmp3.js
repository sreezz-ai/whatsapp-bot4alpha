const { execFile } = require("child_process");
const fs = require("fs");

addCommand(
  {
    pattern: /^ytmp3\s+(.*)/i,
    fromMe: true,
    desc: "Download YouTube audio as MP3"
  },
  async (message, match) => {

    const url = match[1];

    if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
      return await message.reply("❌ Give a valid YouTube link");
    }

    await message.sock.sendMessage(message.chat, {
      react: { text: "⏳", key: message.key }
    });

    const output = `./temp/yt_${Date.now()}.mp3`;

    execFile(
      "yt-dlp",
      [
        "-x",                     // extract audio
        "--audio-format", "mp3",  // convert to mp3
        "--audio-quality", "0",   // best quality
        "-o", output,
        url
      ],
      async (error) => {

        if (error || !fs.existsSync(output)) {
          return await message.reply("❌ Download failed");
        }

        await message.sock.sendMessage(
          message.chat,
          {
            audio: { url: output },
            mimetype: "audio/mpeg",
            fileName: "YouTube.mp3"
          }
        );

        fs.unlinkSync(output);

        await message.sock.sendMessage(message.chat, {
          react: { text: "✅", key: message.key }
        });
      }
    );
  }
);
