const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const Tesseract = require("tesseract.js");

addCommand(
  {
    pattern: "ocr",
    fromMe: true,
    desc: "Extract text from replied image"
  },
  async (message) => {

    const quoted =
      message.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.imageMessage) {
      return await message.reply("❌ Reply to an image to use OCR");
    }

    await message.reply("📥 Downloading image...");

    // ✅ Proper Baileys download
    const buffer = await downloadMediaMessage(
      { message: quoted, key: {} },
      "buffer",
      {},
      { logger: console }
    );

    const filePath = "./ocr_image.png";
    fs.writeFileSync(filePath, buffer);

    await message.reply("🧠 Reading text...");

    const result = await Tesseract.recognize(
      filePath,
      "eng",
      { logger: m => console.log(m.status) }
    );

    fs.unlinkSync(filePath);

    const text = result.data.text.trim();
    if (!text) {
      return await message.reply("❌ No text found in image");
    }

    await message.reply("📄 *OCR RESULT:*\n\n" + text);
  }
);
