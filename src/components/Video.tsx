import React, { useCallback, useRef, useEffect, useContext } from 'react';
import Hls from 'hls.js';
import { HistoryItem, Work } from '../apis/work';
import { omit } from '../utils/obj';
import { PlayerContext, Player } from '../hooks/usePlayer';
import { DBContext } from '../contexts/db';

const urlRegExp = /([a-zA-Z0-9]+:)?\/*?([^#?/:]+)(:\d+)?([^:#?]*?)(\?[^#]*)?(#.*)?$/;

export default function Video() {
  const db = useContext(DBContext);
  const player = useContext(PlayerContext) as Player;
  const hlsRef = useRef<Hls | null>(null);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const initTime = useRef(0);
  const lastTime = useRef(0);
  const handlePlay = useCallback(
    async (url: string) => {
      const playerEl = playerRef.current as HTMLVideoElement;
      const hls = hlsRef.current as Hls;
      const match = url.trim().match(urlRegExp);
      hls.detachMedia();
      if (match) {
        let url = match[0];
        if (match[1] === 'http:') {
          url = url.replace(/^http:/, 'https:');
        }
        player.setVideoUrl(url);
        const item = await db.get<HistoryItem>('history', url);
        initTime.current = (item && item.currentTime) || 0;
        if (player.work) {
          if (~player.epIndex) {
            const chap = player.work.playList[player.epIndex];
            const currentTime = Math.floor(new Date().valueOf() / 1000);
            db.set(
              'work',
              String(player.work.id),
              omit({ ...player.work, visited_at: currentTime }, ['playList']),
            ).then(() =>
              db.set('history', url, {
                ...item,
                url,
                utime: currentTime,
                chap: chap.name,
                id: (player.work as Work).id,
              }),
            );
          }
        }
        if (/\.m3u8/.test(url)) {
          hls.attachMedia(playerEl);
          hls.loadSource(url);
        } else {
          playerEl.setAttribute('src', url);
          playerEl.play();
        }
      }
    },
    [player, db],
  );

  useEffect(() => {
    const hls = new Hls();
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      playerRef.current?.play();
    });
    hlsRef.current = hls;
  }, []);

  useEffect(() => {
    player.controller.current = {
      handlePlay,
    };
    playerRef.current?.addEventListener('loadedmetadata', () => {
      if (playerRef.current) {
        playerRef.current.currentTime = initTime.current;
        lastTime.current = initTime.current;
      }
    });
    playerRef.current?.addEventListener('timeupdate', () => {
      if (playerRef.current && !playerRef.current.paused) {
        const currentTime = playerRef.current.currentTime;
        if (Math.abs(currentTime - lastTime.current) > 5) {
          lastTime.current = playerRef.current.currentTime;
          db.set('history', player.videoUrl, {
            url: player.videoUrl,
            currentTime,
            duration: playerRef.current.duration,
            utime: Math.floor(new Date().valueOf() / 1000),
            chap: player.work?.playList[player.epIndex].name || '',
            id: player.work?.id || 0,
          });
        }
      }
    });
  }, [handlePlay]);
  return (
    <video
      className="w-full"
      id="player"
      ref={playerRef}
      controls={true}
      crossOrigin="anonymous"
    ></video>
  );
}
