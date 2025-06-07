import React, { useState, useEffect } from 'react';
import "./YoutubeVideo.css";

const YoutubeVideo = () => {
  const videoList = [ //채널명-영상 제목
    "NkjUHze7tdY",  //인천공항-수하물 스티커를 떼야 하는 이유
    "lL50mfAA9HY",  //올댓크루-항공승무원 기내 안전 데모
    "iyjGDYcZluM", //KTV NEWS-"선반에 넣지 마세요" ... 보조배터리, 기내에서 '이렇게' 보관해야 한다
    "390DJiHxDpw",  //행정안전부-항공기 탑승 및 사고 시 국민행동요령
    "poVJpl-iDWo",  //국토교통부-수하물 위탁, 기다리지 말고 셀프로 하세요! [탑승수속꿀팁)
    "YXGR8JRrK5I", //KBS News-"항공기내 보조배터리 5개 제한…보관은 비닐백에" / KBS 2025.02.13.
    "dPYidPBFH5I" //YTN-[자막뉴스] "벌써 절차 끝?!" 인천공항 새 출국 시스템 사용기
  ];

  const getRandomVideo = () => {
    return videoList[Math.floor(Math.random() * videoList.length)];
  };

  const [videoId, setVideoId] = useState(getRandomVideo());
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    // 클라이언트 측에서만 window.location 접근
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&origin=${origin}&enablejsapi=0&rel=0&modestbranding=1`);
  }, [videoId]);

  return (
    <div className="youtube-container">
      <div className="youtube-wrapper">
        <iframe
          src={videoUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          loading="lazy"
          crossOrigin="anonymous"
        ></iframe>
      </div>
      <button className="random-video-btn" onClick={() => setVideoId(getRandomVideo())}>
        새 영상 보기 ▶️
      </button>
    </div>
  );
};

export default YoutubeVideo;
