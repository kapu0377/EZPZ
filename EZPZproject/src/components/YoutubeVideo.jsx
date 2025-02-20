import React from 'react';

const YoutubeVideo = () => {
  return (
    <div className="youtube-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      padding: '20px'
    }}>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/NkjUHze7tdY?si=VdvkWyXjRdXnJNGn"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          maxWidth: '100%'
        }}
      ></iframe>
    </div>
  );
};

export default YoutubeVideo;