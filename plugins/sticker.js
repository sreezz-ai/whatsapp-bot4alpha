const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

addCommand(
  {
    pattern: "sticker|s",
    fromMe: true,
    desc: "Create sticker from image/video"
  },
  async (message) => {

    const quoted =
      message.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
      return await message.reply("❌ Reply to an image or video");
    }

    const isImage = quoted.imageMessage;
    const isVideo = quoted.videoMessage;

    if (!isImage && !isVideo) {
      return await message.reply("❌ Only image or video supported");
    }

    await message.reply("🛠️ Creating sticker...");

    // Download media
    const buffer = await downloadMediaMessage(
      { message: quoted, key: {} },
      "buffer",
      {},
      { logger: console }
    );

    const input = `./temp/input_${Date.now()}`;
    const output = `./temp/sticker_${Date.now()}.webp`;

    fs.writeFileSync(input, buffer);

    // 🖼️ IMAGE → STICKER
    if (isImage) {
      await sharp(input)
        .resize(512, 512, { fit: "inside" })
        .webp()
        .toFile(output);
    }

    // 🎞️ VIDEO → STICKER
    if (isVideo) {
      const seconds = quoted.videoMessage.seconds || 0;
      if (seconds > 10) {
        fs.unlinkSync(input);
        return await message.reply("❌ Video too long (max 10s)");
      }

      await new Promise((resolve, reject) => {
        ffmpeg(input)
          .outputOptions([
            "-vcodec libwebp",
            "-vf scale=512:512:force_original_aspect_ratio=decrease",
            "-loop 0",
            "-preset default",
            "-an",
            "-vsync 0"
          ])
          .toFormat("webp")
          .save(output)
          .on("end", resolve)
          .on("error", reject);
      });
    }

    await message.sock.sendMessage(
      message.message.key.remoteJid,
      { sticker: fs.readFileSync(output) }
    );

    fs.unlinkSync(input);
    fs.unlinkSync(output);
  }
);
