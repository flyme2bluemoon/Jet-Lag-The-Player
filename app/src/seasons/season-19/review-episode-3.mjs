/**
 * Browser-only evidence helper; not imported by the application.
 * Evaluate this function in the Episode 3 YouTube tab, then take a T3 snapshot.
 * Pass up to four video timestamps in seconds. Reload the page to remove it.
 */
export default async function reviewEpisodeThreeFrames(times = [961, 1957, 2629, 3582]) {
  const video = document.querySelector("video");
  if (new URL(location.href).searchParams.get("v") !== "uzr_gkc81SQ" || !video) {
    throw new Error("Open Season 19 Episode 3 on YouTube first.");
  }
  if (times.length < 1 || times.length > 4 || times.some(
    (time) => !Number.isFinite(time) || time < 0 || time >= video.duration,
  )) {
    throw new Error("Supply one to four timestamps within the video.");
  }

  video.pause();
  let canvas = document.getElementById("season-19-episode-3-review");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "season-19-episode-3-review";
    document.body.appendChild(canvas);
  }
  canvas.width = 1000;
  canvas.height = 610;
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:auto;visibility:visible!important;z-index:2147483647;background:black";
  const context = canvas.getContext("2d");
  for (const [index, time] of times.entries()) {
    if (video.currentTime !== time || video.seeking) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          video.removeEventListener("seeked", onSeeked);
          reject(new Error(`Video did not finish seeking to ${time}.`));
        }, 10000);
        function onSeeked() {
          clearTimeout(timeout);
          resolve();
        }
        video.addEventListener("seeked", onSeeked, { once: true });
        video.currentTime = time;
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
    const x = (index % 2) * 500;
    const y = Math.floor(index / 2) * 305;
    context.drawImage(video, x, y + 24, 500, 281);
    context.fillStyle = "black";
    context.fillRect(x, y, 500, 24);
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(`${time} seconds`, x + 10, y + 20);
  }
  return { video: "uzr_gkc81SQ", timestamps: times };
}
