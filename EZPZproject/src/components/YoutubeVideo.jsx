import React, { useState } from 'react';
import "./YoutubeVideo.css";

const YoutubeVideo = () => {
  const videoList = [
    "NkjUHze7tdY",
    "lL50mfAA9HY",
    "iyjGDYcZluM",
    "390DJiHxDpw",
    "poVJpl-iDWo",
    "YXGR8JRrK5I",
    "dPYidPBFH5I"
  ];

  const getRandomVideo = () => {
    return videoList[Math.floor(Math.random() * videoList.length)];
  };

  const [videoId, setVideoId] = useState(getRandomVideo());

  return (
    <div className="youtube-container">
      <div className="youtube-wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <button className="random-video-btn" onClick={() => setVideoId(getRandomVideo())}>
        새 영상 보기 ▶️
      </button>
    </div>
  );
};

export default YoutubeVideo;
