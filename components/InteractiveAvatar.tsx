import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import RecordButton from "@/components/RecordButton";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { useStreamingAvatarContext } from "./logic/context";
import { LoadingIcon } from "./Icons";



const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "d888f58da09648bfb520315b93971945",
  knowledgeId: undefined,
  voice: {
    voiceId: "fb3dcd1398534927a2308c3d7ee10c5b",
    rate: 1,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "he",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.GLADIA,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { avatarRef } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [isAds, setIsAds] = useState(false);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const [language, setLanguage] = useState("he-IL");
  const appendTranscript = useMemoizedFn(async (text: string) => {
    if (
      sessionState === StreamingAvatarSessionState.CONNECTED &&
      avatarRef.current
    ) {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });

        const response = await res.json();
        // Send response to avatar
        console.log("response:", response);
        avatarRef.current.speak({
          text: response.response,
          task_type: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
        setIsAds(response.relatedquery);
      } catch (error) {
        console.error("Error sending message to avatar:", error);
      }
    }
  });

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
 
    try {
      setIsAds(false);
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      await startAvatar(config);
      if (isVoiceChat) {
        await startVoiceChat(true);
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });
  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full h-full">
      <div className="relative w-full h-full">
        {sessionState !== StreamingAvatarSessionState.INACTIVE && (
          <AvatarVideo ref={mediaStream} isAds={isAds} />
        )}

        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 items-center">
            <RecordButton
              onTranscript={appendTranscript}
              className="shadow-xl"
            />
          </div>
        )}

        {sessionState === StreamingAvatarSessionState.INACTIVE && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-row gap-4 z-30">
            <Button onClick={() => startSessionV2(true)}>Start</Button>
          </div>
        )}

        {sessionState === StreamingAvatarSessionState.CONNECTING && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
            <LoadingIcon />
          </div>
        )}
      </div>
      {sessionState === StreamingAvatarSessionState.CONNECTED && <></>}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
