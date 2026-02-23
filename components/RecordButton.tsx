"use client";

import { useRef, useState } from "react";

interface Props {
  onTranscript: (finalText: string) => void;
  onStatusChange?: (status: string) => void;
  className?: string;
}

export default function RecordButton({
  onTranscript,
  onStatusChange,
  className = "",
}: Props) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    if (isRecording) return;
    onStatusChange?.("Preparing microphone…");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstart = () => {
      setIsRecording(true);
      onStatusChange?.("Listening");
    };

    recorder.start();
  }

  async function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    onStatusChange?.("Stopping…");

    recorder.onstop = async () => {
      setIsRecording(false);
      onStatusChange?.("Transcribing…");

      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("file", audioBlob, "speech.webm");

      const res = await fetch("/api/tts", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      onTranscript(text);
      onStatusChange?.("Idle");
    };

    recorder.stop();
  }

  return (
    <button
      className={`rounded-full px-6 py-3 text-white font-semibold transition ${
        isRecording ? "bg-red-600 scale-105" : "bg-blue-600 hover:bg-blue-700"
      } ${className}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
    >
      {isRecording ? "Recording…" : "Hold to Speak!"}
    </button>
  );
}
