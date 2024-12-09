import { useState } from "react";
import Switch from "./components/Switch";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGear } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [definitionEnabled, setDefinitionEnabled] = useState(true);
  const [playSoundEnabled, setPlaySoundEnabled] = useState(false);

  return (
    <div className="bg-zinc-800 text-white overflow-hidden">
      {/* Header */}
      <div className="w-full">
        <header className="bg-zinc-900 flex justify-between items-center p-3">
          <div className="flex items-center">
            <h1 className="text-sm text-left font-medium text-gray-100 ml-2">
              Spamurai
            </h1>
          </div>
        </header>
      </div>
      <div className="px-2">
        <div className="p-3 w-80">
          <h2 className="text-sm font-bold text-left mb-4 text-gray-100">
            Quick settings
          </h2>

          {/* Display Button Setting */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-100">Settings 1</span>
              <div className="ml-auto">
                <Switch
                  isOn={definitionEnabled}
                  handleToggle={() => setDefinitionEnabled(!definitionEnabled)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Settings 1 description</p>
            <hr className="my-3 border-gray-700" />
          </div>

          {/* Play Sound Setting */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-100">Setting 2</span>
              <div className="ml-auto">
                <Switch
                  isOn={playSoundEnabled}
                  handleToggle={() => setPlaySoundEnabled(!playSoundEnabled)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Settings 2 description</p>
          </div>
        </div>
      </div>
      {/* Settings */}
    </div>
  );
}

export default App;
