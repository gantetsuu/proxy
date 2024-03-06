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
      ?.on("error", (err) => {
        console.error("Error streaming video:", err);
        res.status(500).send("Error streaming video");
      });
  } catch (err) {
    console.error("Error fetching video info:", err);
    res.status(500).send("Error fetching video info");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
