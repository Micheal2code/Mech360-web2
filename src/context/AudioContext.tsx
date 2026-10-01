import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { LectureRecording } from '../types';

interface AudioContextType {
  currentLecture: LectureRecording | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  showDock: boolean;
  playLecture: (lecture: LectureRecording) => void;
  togglePlay: () => void;
  seekTo: (timeInSeconds: number) => void;
  setSpeed: (rate: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  closeDock: () => void;
  skipSeconds: (seconds: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLecture, setCurrentLecture] = useState<LectureRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1800);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showDock, setShowDock] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const playLecture = (lecture: LectureRecording) => {
    setCurrentLecture(lecture);
    setShowDock(true);
    if (audioRef.current) {
      audioRef.current.src = lecture.audioUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.log('Audio autoplay prevented or error:', e);
          setIsPlaying(true);
        });
    } else {
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentLecture) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(true));
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const skipSeconds = (sec: number) => {
    if (audioRef.current) {
      const nextTime = Math.max(0, Math.min(audioRef.current.currentTime + sec, duration));
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setVolumeLevel = (vol: number) => {
    setVolume(vol);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const closeDock = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setShowDock(false);
  };

  return (
    <AudioContext.Provider
      value={{
        currentLecture,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        volume,
        isMuted,
        showDock,
        playLecture,
        togglePlay,
        seekTo,
        setSpeed,
        setVolumeLevel,
        toggleMute,
        closeDock,
        skipSeconds,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioProvider');
  }
  return context;
};
