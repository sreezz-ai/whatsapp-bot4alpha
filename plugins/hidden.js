module.exports = {
  name: "hidetag",
  alias: ["silenttag", "mentionall"],
  desc: "Mention all group members without showing @tags",
  category: "group",
  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ This command works only in groups");

    const groupMetadata = await sock.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);

    await sock.sendMessage(
      m.chat,
      {
        text: "👀", // You can keep this empty "" if you want
        mentions: participants
      },
      { quoted: m }
    );
  }
};
