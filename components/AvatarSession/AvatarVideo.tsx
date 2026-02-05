import React, { forwardRef } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

interface AvatarVideoProps {
  isAds?: boolean;
  adImageUrl?: string;
}

export const AvatarVideo = forwardRef<HTMLVideoElement, AvatarVideoProps>(
  ({ isAds = false, adImageUrl }, ref) => {
    const { sessionState, stopAvatar } = useStreamingAvatarSession();
    const { connectionQuality } = useConnectionQuality();

    const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

    return (
      <>
        {connectionQuality !== ConnectionQuality.UNKNOWN && (
          // <div className="fixed top-3 left-3 bg-black text-white rounded-lg px-3 py-2 z-30">
          //   Connection Quality: {connectionQuality}
          // </div>
          <></>
        )}
        {isLoaded && (
          // <Button
          //   className="fixed top-3 right-3 !p-2 bg-zinc-700 bg-opacity-50 z-30"
          //   onClick={stopAvatar}
          // >
          //   <CloseIcon />
          // </Button>
          <></>
        )}

        <video
          ref={ref}
          autoPlay
          playsInline
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "contain",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        >
          {/* <track kind="captions" /> */}
        </video>
        {isAds && (
          <>
            <img
              src={adImageUrl || "/ads.jpg"}
              alt="Advertisement"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 object-contain"
              style={{
                width: "40vh",
                height: "40vh",
                objectFit: "contain",
              }}
            />
            <img
              src={adImageUrl || "qr.png"}
              alt="Advertisement"
              className="fixed top-0 left-[calc(50%+23vh)] -translate-x-1/2  z-20 object-contain"
              style={{
                width: "10vh",
                height: "10vh",
                objectFit: "contain",
              }}
            />
          </>
        )}
        {!isLoaded && (
          <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-10">
            Loading...
          </div>
        )}
      </>
    );
  },
);
AvatarVideo.displayName = "AvatarVideo";
