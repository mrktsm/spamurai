function OAuthModal() {
  const create_oauth2_url = () => {
    const clientId = encodeURIComponent(
      "1089158818812-rnpeui53rt8er93jph1e7u0e3komk7rm.apps.googleusercontent.com"
    );
    const responseType = encodeURIComponent("token");
    const redirectURI = encodeURIComponent(
      "https://aelogdngopigomkfnmpnngfnbdmehkjg.chromiumapp.org"
    );
    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/gmail.readonly"
    );
    const state = encodeURIComponent("jfkls3n");
    const prompt = encodeURIComponent("consent");

    let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectURI}&state=${state}&scope=${scope}&prompt=${prompt}`;

    return url;
  };

  const handleAuthentication = () => {
    chrome.identity.launchWebAuthFlow(
      {
        url: create_oauth2_url(),
        interactive: true,
      },
      function (redirect_url: any) {
        if (chrome.runtime.lastError) {
          console.error(
            "Authentication failed: " + chrome.runtime.lastError.message
          );
          return;
        }
        // Extract the access token from the redirect URL
        const urlParams = new URLSearchParams(
          new URL(redirect_url).hash.substring(1)
        );
        const accessToken = urlParams.get("access_token");
        if (accessToken) {
          console.log("Access Token: ", accessToken);
          // Now you can use the access token to call Google Calendar API
        } else {
          console.error("Access token not found in the redirect URL.");
        }
      }
    );
  };

  return (
    <div className="bg-red-500 w-96 h-96 flex justify-center items-center">
      <h1>temp</h1>
      <button onClick={handleAuthentication}>Authenticate with Google</button>
    </div>
  );
}

export default OAuthModal;
