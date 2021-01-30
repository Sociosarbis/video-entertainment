window.addEventListener("load", () => {
  const prevURL = window.localStorage.getItem('PREV_URL') || ''
  const urlRegExp = /([a-zA-Z0-9]+:)?\/*?([^#\?\/:]+)(:\d+)?([^:#\?]*?)(\?[^#]*)?(#.*)?$/;
  const replaceButton = document.getElementById("replace-video-button");
  const player = document.getElementById("player");
  const urlInput = document.getElementById("url-input");
  urlInput.value = prevURL;
  const hls = new Hls();
  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    player.play();
  });
  replaceButton.addEventListener("click", function () {
    const match = urlInput.value.trim().match(urlRegExp);
    hls.detachMedia();
    if (match) {
      let url = match[0];
      if (match[1] === "http:") {
        url = url.replace(/^http:/, "https:");
      }
      urlInput.value = url;
      window.localStorage.setItem('PREV_URL', url);
      if (/\.m3u8/.test(url)) {
        hls.attachMedia(player);
        hls.loadSource(url);
      } else {
        player.setAttribute("src", url);
        player.play();
      }
    }
  });
});
