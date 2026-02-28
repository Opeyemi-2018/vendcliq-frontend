

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
    googleMapsScriptLoading?: boolean;
  }
}

/**
 * Loads the Google Maps JavaScript API script
 * The API key is fetched from the server to keep it secure
 */
export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    if (window.googleMapsScriptLoading) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Timeout loading Google Maps"));
      }, 10000);
      return;
    }

    window.googleMapsScriptLoading = true;

    // Fetch API key from server
    fetch("/api/google-maps-key")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch API key");
        }
        return res.json();
      })
      .then((data) => {
        if (!data.apiKey) {
          throw new Error("API key not found in response");
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          window.googleMapsScriptLoading = false;
          resolve();
        };

        script.onerror = () => {
          window.googleMapsScriptLoading = false;
          reject(new Error("Failed to load Google Maps script"));
        };

        document.head.appendChild(script);
      })
      .catch((error) => {
        window.googleMapsScriptLoading = false;
        reject(error);
      });
  });
};

/**
 * Initializes Google Places Autocomplete on an input element
 * @param input - The input element to attach autocomplete to
 * @param onPlaceSelected - Callback when a place is selected
 * @returns Cleanup function to remove listeners
 */
export const initializeAutocomplete = (
  input: HTMLInputElement,
  onPlaceSelected: (address: string) => void
): (() => void) => {
  if (!window.google?.maps?.places) {
    console.error("Google Maps not loaded");
    return () => {};
  }

  try {
    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ["address"],
      fields: ["formatted_address", "address_components", "geometry"],
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        onPlaceSelected(place.formatted_address);
      }
    });

    // Return cleanup function
    return () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  } catch (error) {
    console.error("Error initializing autocomplete:", error);
    return () => {};
  }
};

