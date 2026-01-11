export class NavigatorPositionProvider {
  // Method to get the current position using the browser's geolocation API
  getPosition(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      // Setting options for the geolocation request
      const options: PositionOptions = {
        timeout: 10000,             // Set timeout to 10 seconds
        maximumAge: 900000,        // Set maximum age to 15 minutes
        enableHighAccuracy: false, // Set high accuracy to false
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          const latLngProvider = new LatLngCookiePositionProvider('33.1234|-84.1234');
          if (position?.coords?.latitude && position?.coords?.longitude) {
            latLngProvider.setPosition(position.coords.latitude, position.coords.longitude); // Sets the lat_lgn cookie
          }       
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              // User denied the request for Geolocation
              reject(new Error('User denied Geolocation'));
              break;
            case error.POSITION_UNAVAILABLE:
              // Location information is unavailable
              reject(new Error('Location information is unavailable'));
              break;
            case error.TIMEOUT:
              // The request to get user location timed out
              reject(new Error('Geolocation request timed out'));
              break;
            default:
              // An unknown error occurred
              reject(new Error('An unknown geolocation error occurred'));
              break;
          }
        },
        options
      );
    });
  }
}

export class LatLngCookiePositionProvider {
  private latLngCookie: string;
  constructor(latLngCookie) {
    this.latLngCookie = latLngCookie;
  }

  getPosition(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve) => {
      resolve({
        latitude: parseFloat(this.latLngCookie.split('|')[0]),
        longitude: parseFloat(this.latLngCookie.split('|')[1])
      })
    });
  }

  setPosition(latitude: number, longitude: number): void {
    const cookieValue = `${latitude}|${longitude}`;

    // Set or update the cookie with the new lat_lng value
    document.cookie = `lat_lgn=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=None; Secure`; // Cookie expires in 30 days

    // Update the local latLngCookie property
    this.latLngCookie = cookieValue;
  }
}

export class StaticPositionProvider {
  private latitude: number;
  private longitude: number;

  constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  getPosition(): Promise<{ latitude: number; longitude: number }> {
    // Simply resolve the promise with the static latitude and longitude values
    return Promise.resolve({
      latitude: this.latitude,
      longitude: this.longitude,
    });
  }
}


  /**
   * The `IGeolocationPosition` interface describes a geolocation position
   * usable by the [DistanceResources]{@link DistanceResources} component.
   */
  export interface IGeolocationPosition {
    longitude: number;
    latitude: number;
  }
  /**
   * The `IGeolocationPositionProvider` interface describes an object with a method that can provide
   * a geolocation position to the [DistanceResources]{@link DistanceResources} component.
   */
  export interface IGeolocationPositionProvider {
    getPosition(): Promise<IGeolocationPosition>;
  }
