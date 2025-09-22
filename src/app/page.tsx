import Canvas from "@/components/layout/canvas";
import AudioPlayer from "@/components/layout/audio-player";
export default function Home() {
  return (
    <main className="w-full h-full flex flex-col md:flex-row justify-center items-center">
      <Canvas />
      <AudioPlayer />
    </main>
  );
}
