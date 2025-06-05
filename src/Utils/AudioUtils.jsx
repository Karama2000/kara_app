export const getSupportedAudioFormats = () => {
  const audio = document.createElement('audio');
  const formats = {
    mp3: audio.canPlayType('audio/mpeg'),
    wav: audio.canPlayType('audio/wav'),
    ogg: audio.canPlayType('audio/ogg; codecs="vorbis"'),
    webm: audio.canPlayType('audio/webm; codecs="opus"'),
    opus: audio.canPlayType('audio/ogg; codecs="opus"'),
  };
  return formats;
};