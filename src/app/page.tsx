import ThreeDCanvas from "@/components/layout/3D-canvas";
import AudioPlayer from "@/components/layout/audio-player";
import StageSidebar from "@/components/quiz/StageSidebar";

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row justify-center items-center p-4 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="w-full md:w-1/4 h-[70vh] p-2">
        <StageSidebar />
      </div>
      <div className="w-full md:w-3/4 flex flex-col md:flex-row gap-2 p-2">
        <div className="w-full md:w-2/3 h-[70vh]">
          <ThreeDCanvas />
        </div>
        <div className="w-full md:w-1/3 h-[70vh]">
          <AudioPlayer />
        </div>
      </div>
    </main>
  );
}
