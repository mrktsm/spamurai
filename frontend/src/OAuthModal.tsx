function OAuthModal() {
  const handleAuthentication = () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Authentication failed: " + chrome.runtime.lastError.message
        );
        return;
      }
      console.log("Authenticated successfully, token: ", token);

      // Store the token in localStorage to mark the user as authenticated
      chrome.storage.local.set({ isAuthenticated: "true" }, () => {
        console.log("Authentication status:", "true");
        console.log("User authenticated and chrome.storage.local updated.");

        // Send a message to close the modal
        window.parent.postMessage({ action: "closeModal" }, "*");
      });
    });
  };

  return (
    <div
      className="flex rounded-2xl flex-col items-center justify-center px-10 h-96 text-center bg-gradient-to-r from-red-400 to-red-600 text-white"
      style={{ height: "492.5px", width: "576px" }}
    >
      <img
        src="icons/spamurai_white.png"
        alt="Image Placeholder"
        className="mb-4 w-40 h-40"
      />
      <h1 className="text-4xl font-medium mb-4">Welcome to Spamurai!</h1>
      <p className="text-base font-light mb-6">
        {" "}
        Sign in with Google to access Spamurai's AI-powered spam filtering
        features.
      </p>
      <button
        onClick={handleAuthentication}
        className="border-2 border-white bg-transparent text-white font-bold py-2 px-6 rounded-full uppercase hover:bg-white hover:text-red-600 transition duration-200"
      >
        Sign In with Google
      </button>
    </div>
  );
}

export default OAuthModal;
