import Canvas from "@/components/layout/canvas";
import AudioPlayer from "@/components/layout/audio-player";

export default function Home() {
  return (
    <main className="w-full h-screen relative overflow-hidden">
      <Canvas />
      <div className="absolute top-4 right-4 z-10">
        <AudioPlayer />
      </div>
    </main>
  );
}
