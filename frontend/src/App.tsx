import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons"; // Import the GitHub icon
import Switch from "./components/Switch";

function App() {
  const [definitionEnabled, setDefinitionEnabled] = useState(true);
  const [playSoundEnabled, setPlaySoundEnabled] = useState(false);

  return (
    <div className="bg-zinc-800 text-white overflow-hidden">
      {/* Header */}
      <div className="w-full">
        <header className="bg-zinc-900 flex justify-between items-center p-3">
          <div className="flex items-center">
            <h1 className="text-sm text-left font-semibold text-rose-300 ml-2">
              Spamurai
            </h1>
          </div>
          {/* GitHub Icon in the header, aligned to the right */}
          <a
            href="https://github.com/mrktsm/spamurai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-300 transform transition-all duration-300 hover:text-rose-500 hover:scale-105"
          >
            <FontAwesomeIcon icon={faGithub} className="w-5 h-5 mr-2" />
          </a>
        </header>
      </div>

      <div className="px-2">
        <div className="p-3 w-80">
          <h2 className="text-sm font-bold text-left mb-4 text-rose-100">
            Quick settings
          </h2>

          {/* Display Button Setting */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-100">Protection Mode</span>
              <div className="ml-auto">
                <Switch
                  isOn={definitionEnabled}
                  handleToggle={() => setDefinitionEnabled(!definitionEnabled)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Enable or disable Spamurai's advanced spam filtering for your
              emails.
            </p>
            <hr className="my-3 border-gray-700" />
          </div>

          {/* Play Sound Setting */}
          <div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-100">
                Auto Popup for Spam Emails{" "}
              </span>
              <div className="ml-auto">
                <Switch
                  isOn={playSoundEnabled}
                  handleToggle={() => setPlaySoundEnabled(!playSoundEnabled)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Opens the popup automatically when spam is detected in an email.
            </p>
          </div>
        </div>
      </div>
      {/* Settings */}
    </div>
  );
}

export default App;
