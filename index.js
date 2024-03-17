const express = require("express");
const axios = require("axios");
const ytdl = require("ytdl-core");
const app = express();
const port = 3000;
app.get("/", (req, res) => {
  res.send("🍆");
});
app.get("/youtube/:id", async (req, res) => {
  const videoId = req.params.id;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const info = await ytdl?.getInfo(url);
    const format = ytdl?.chooseFormat(info?.formats, {
      quality: "highest",
      filter: "videoandaudio",
    });
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
    try {
      const data = await fetch(
        `https://m3u8proxy-m3u8proxy.owiwfk.easypanel.host/youtube/${videoId}`
      );
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${videoId}.mp4"`
      );
      if (data.headers.get("Content-Length")) {
        res.setHeader("Content-Length", data.headers.get("Content-Length"));
      }
      res.status(200).send(data.body);
    } catch (err) {
      console.log(err?.message);
      res.status(500).send("internal err");
    }
  }
});
app.get("kavin/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const u = `https://pipedapi.kavin.rocks/streams/${id}`;
    const { data } = await axios.get(u);
    const format =
      data?.videoStreams?.find(
        (f) =>
          (f?.quality === "720p" ||
            f?.quality === "1080p" ||
            f?.quality === "480p") &&
          f?.videoOnly !== true &&
          f?.mimeType === "video/mp4"
      )?.url || data?.hls;
    res.status(200).send(format);
  } catch (error) {
    res.status(500).send("internal err");
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
