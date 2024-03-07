const express = require("express");
const ytdl = require("ytdl-core");
const app = express();
const port = 3000;
app.get("/youtube/:id", async (req, res) => {
  const videoId = req.params.id;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const info = await ytdl?.getInfo(url);
    const format = ytdl?.chooseFormat(info?.formats, { quality: "highest" });
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${videoId}.mp4"`
    );
    res.setHeader("Content-Length", format.contentLength);
    ytdl(url, { format: format })
      ?.pipe(res)
      ?.on("error", (e) => {
        throw new Error("Error streaming video:", e);
      });
  } catch (er) {
    console.error("Error fetching video info:", er);
    const data = await fetch(
      `https://m3u8proxy-m3u8proxy.owiwfk.easypanel.host/youtube/${videoId}`
    );
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${videoId}.mp4"`
    );
    res.setHeader("Content-Length", data.headers.get("Content-Length"));
    res.status(200).send(data.body);
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
