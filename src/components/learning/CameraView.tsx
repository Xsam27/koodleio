
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from 'lucide-react';

interface CameraViewProps {
  onCameraToggle: (isOn: boolean) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCameraToggle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const toggleCamera = async () => {
    try {
      if (!isCameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        onCameraToggle(true);
      } else {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        onCameraToggle(false);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-48 h-36 rounded-lg bg-black ${!isCameraOn ? 'hidden' : ''}`}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={toggleCamera}
        className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
      >
        {isCameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default CameraView;
