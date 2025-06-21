// Google Maps API Manager - Centralized system to prevent conflicts
class GoogleMapsManager {
  private static instance: GoogleMapsManager;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private callbacks: (() => void)[] = [];
  private apiKey: string = 'AIzaSyAe57f_PT4dsrCcwK_UPN7nY4SERmnH254C';

  private constructor() {}

  public static getInstance(): GoogleMapsManager {
    if (!GoogleMapsManager.instance) {
      GoogleMapsManager.instance = new GoogleMapsManager();
    }
    return GoogleMapsManager.instance;
  }

  public loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (this.isLoaded && window.google && window.google.maps) {
        resolve();
        return;
      }

      // Add callback to queue
      this.callbacks.push(resolve);

      // If already loading, just wait
      if (this.isLoading) {
        return;
      }

      // Start loading
      this.isLoading = true;

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create new script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initGoogleMapsGlobal`;
      script.async = true;
      script.defer = true;

      // Global callback function
      (window as any).initGoogleMapsGlobal = () => {
        this.isLoaded = true;
        this.isLoading = false;
        
        // Execute all callbacks
        this.callbacks.forEach(callback => callback());
        this.callbacks = [];
      };

      script.onerror = () => {
        this.isLoading = false;
        this.callbacks.forEach(callback => reject(new Error('Failed to load Google Maps API')));
        this.callbacks = [];
      };

      document.head.appendChild(script);
    });
  }

  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded && window.google && window.google.maps;
  }
}

export default GoogleMapsManager;
