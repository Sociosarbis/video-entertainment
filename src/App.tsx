import React, { useCallback, useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import PlayList from './components/PlayList';

const urlRegExp = /([a-zA-Z0-9]+:)?\/*?([^#?/:]+)(:\d+)?([^:#?]*?)(\?[^#]*)?(#.*)?$/;

function App() {
  const prevURL = window.localStorage.getItem('PREV_URL') || '';

  const [inputValue, setInputValue] = useState(prevURL);

  const [videoUrl, setVideoUrl] = useState('');

  const hlsRef = useRef<Hls | null>(null);

  const playerRef = useRef<HTMLVideoElement | null>(null);

  const handlePlay = useCallback((url: string) => {
    const player = playerRef.current as HTMLVideoElement;
    const hls = hlsRef.current as Hls;
    const match = url.trim().match(urlRegExp);
    hls.detachMedia();
    if (match) {
      let url = match[0];
      if (match[1] === 'http:') {
        url = url.replace(/^http:/, 'https:');
      }
      setInputValue(url);
      setVideoUrl(url);
      window.localStorage.setItem('PREV_URL', url);
      if (/\.m3u8/.test(url)) {
        hls.attachMedia(player);
        hls.loadSource(url);
      } else {
        setInputValue(url);
        player.setAttribute('src', url);
        player.play();
      }
    }
  }, []);

  useEffect(() => {
    const hls = new Hls();
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      (playerRef.current as HTMLVideoElement).play();
    });
    hlsRef.current = hls;
  }, []);

  return (
    <div>
      <input
        className="w-full mb-2 bg-black input"
        id="url-input"
        placeholder="视频链接"
        onChange={(e) => setInputValue(e.target.value)}
      />
      <div className="mb-2">
        <input
          id="replace-video-button"
          className="mr-1 btn"
          type="button"
          value="替换视频"
          onClick={() => handlePlay(inputValue)}
        />
        <button className="btn">
          <a
            className="text-btn"
            href="http://www.zuidazy3.net/index.php"
            target="resource-center"
          >
            资源中心
          </a>
        </button>
      </div>
      <div className="text-center mb-2">
        <video
          className="w-full"
          id="player"
          ref={playerRef}
          controls={true}
          crossOrigin="anonymous"
        ></video>
      </div>
      <PlayList currentUrl={videoUrl} onSelect={(url) => handlePlay(url)} />
    </div>
  );
}

export default App;
