import { useState } from "react";
import { useSceneStore } from "../../stores/use-scene-store";
import { CameraPosition, Scene } from "../../types/scene";
import { Button } from "./button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { Landmark, MapPin, Layers, ChevronRight, Navigation } from "lucide-react";

export default function LandmarkSelector() {
  const { currentScene, currentLandmark, allScenes, moveCameraToLandmark, setCurrentScene } = useSceneStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLandmarkSelect = (landmark: CameraPosition) => {
    moveCameraToLandmark(landmark);
    setIsOpen(false); // Close the sheet after selection
  };

  const handleSceneSelect = (scene: Scene) => {
    setCurrentScene(scene);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="fixed bottom-4 left-4 z-10 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MapPin className="h-4 w-4" />
          <span>Tokyo Landmarks</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[400px] bg-gradient-to-b from-gray-900 to-gray-800 text-white p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-400" />
              <SheetTitle className="text-white text-lg">Tokyo Explorer</SheetTitle>
            </div>
            <p className="text-sm text-gray-400 mt-1">Select a scene and landmark to explore</p>
          </SheetHeader>
          
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-xs uppercase font-semibold text-gray-400 mb-3 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Scene Categories
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allScenes.map((scene, index) => (
                <Button
                  key={index}
                  variant={currentScene?.id === scene.id ? "default" : "outline"}
                  size="sm"
                  className={`text-xs py-2 transition-colors ${
                    currentScene?.id === scene.id 
                      ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-600'
                  }`}
                  onClick={() => handleSceneSelect(scene)}
                >
                  <span className="truncate">{scene.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-200">
                Landmarks in <span className="text-blue-400">{currentScene?.name}</span>
              </h3>
              <span className="text-xs text-gray-500">
                {currentScene?.cameraPositions.length} locations
              </span>
            </div>
            
            <div className="space-y-3">
              {currentScene?.cameraPositions.map((landmark, index) => (
                <div 
                  key={index}
                  className={`rounded-xl border transition-all cursor-pointer group ${
                    currentLandmark?.name === landmark.name 
                      ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border-blue-600/50 shadow-lg shadow-blue-900/10' 
                      : 'bg-gray-800/40 hover:bg-gray-700/50 border-gray-700/50'
                  }`}
                  onClick={() => handleLandmarkSelect(landmark)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 p-2 rounded-lg ${
                        currentLandmark?.name === landmark.name 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${
                          currentLandmark?.name === landmark.name ? 'text-blue-300' : 'text-gray-200'
                        }`}>
                          {landmark.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-2">
                          {landmark.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 flex-shrink-0 ml-1" />
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {landmark.position.map(n => Math.round(n)).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-500">Tokyo Sounds Experience</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}