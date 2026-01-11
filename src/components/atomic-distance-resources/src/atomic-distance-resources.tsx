import { Bindings, initializeBindings } from '@coveo/atomic';
import { Component, Prop, Element, h, State, Fragment, forceUpdate, Watch } from '@stencil/core';
import {
  SearchStatusState,
  buildSearchStatus,
  buildFacet,
  Facet,
  FacetState,
  FacetOptions,
  SearchEngine,
  Unsubscribe,
  loadAdvancedSearchQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions
} from '@coveo/headless';
import { FacetInfo } from '@coveo/atomic/dist/types/components/common/facets/facet-common-store';
import {
  NavigatorPositionProvider, StaticPositionProvider, IGeolocationPositionProvider, IGeolocationPosition, LatLngCookiePositionProvider
} from '../src/providers';

@Component({
  tag: 'atomic-distance-resources',
  styleUrl: 'atomic-distance-resources.css',
  shadow: true,
})
export class AtomicDistanceResources {
  /**
  * @part panel - The root element of the component.
  * @part label-button - The button that toggles the collapse/expand of the panel.
  * @part label-button-icon - The icon inside the label button.
  * @part content - The container for the panel content.
  * @part metric-container - The container for the distance unit radio buttons.
  * @part km-input - The radio input for selecting kilometers.
  * @part km-label - The label for the kilometers radio input.
  * @part mile-input - The radio input for selecting miles.
  * @part mile-label - The label for the miles radio input.
  * @part form-container - The container for the distance selector and location input.
  * @part distance-selector-container - The container for the distance selector dropdown.
  * @part distance-selector-wrapper - The wrapper around the distance selector dropdown.
  * @part distance-selector - The distance selector dropdown.
  * @part from-box - The "from" text between the distance selector and location input.
  * @part postal-field-container - The container for the location input field.
  * @part postal-filter-input - The input field for entering postal code or city.
  * @part postal-submit-button - The button to apply the location filter on mobile devices.
  * @part error-message - The container for displaying error messages related to location input.
  **/

  // The Atomic bindings to be resolved on the parent atomic-search-interface.
  // Used to access the Headless engine in order to create controllers, dispatch actions, access state, etc.
  private bindings?: Bindings;

  // We recommend recording possible errors thrown during the configuration.
  @State() private error?: Error;

  // When disconnecting components from the page, we recommend removing
  // state change listeners as well by calling the unsubscribe methods.
  private statusUnsubscribe: Unsubscribe = () => { };
  private facetUnsubscribe: Unsubscribe = () => { };
  private i18nUnsubscribe = () => { };

  @Element() private element!: HTMLElement;

  private firstSearchCompleted: boolean = false;
  private pendingApplyGeospatialFilter = false;
  private isSearchInProgress: boolean = false;
  /** The input element reference for location filtering */
  private postalInputEl?: HTMLInputElement;

  // Headless controller state property, using the `@State()` decorator.
  // Headless will automatically update these objects when the state related
  // to the controller has changed.
  @State() private statusState!: SearchStatusState;
  @State() searchEngine!: SearchEngine; // Assume this is passed down from atomic-search-interface
  @State() distance: string = '1000000';
  @State() distanceValues: string[] = [];
  @State() unit: 'Miles' | 'Kilometers' = 'Miles';
  @State() location: string;

  private latitude: number;
  private longitude: number;
  private distances: Map<string, string> = new Map();
  private facetRegistered = false;
  private Id: string = 'atomic-distance-resources-id';
  private label: string = 'Distance';
  private distanceFacet: Facet;
  private distanceFacetState: FacetState;

  /**
   * Specifies the name of the field in which to store the distance value.
   */
  @Prop() distanceField!: string;
  /**
 * Specifies the name of the field that contains the latitude value.
 */
  @Prop() latitudeField!: string;
  /**
* Specifies the name of the field that contains the longitude value.
*/
  @Prop() longitudeField!: string;
  /**
 * Whether to request the geolocation service of the web browser. If not defined, will not try to request the service.
 * Defaults to `true`.
 */
  @Prop() useNavigator: boolean = true;
  /**
 * The default latitude value to be used if no other location is provided.
 * 
 */
  @Prop() defaultLatitude: number = 33.9348279;
  /**
  * The default longitude value to be used if no other location is provided.
  */
  @Prop() defaultLongitude: number = -84.3546017;
  /**
  * A valid Google API key to be used for geocoding a city or postal code.
  */
  @Prop() googleApiKey!: string;
  /**
    * The array of geospatial distances, as a string (e.g., `"[25, 50, 100]"`), which will be parsed
    * and converted into options for the distance dropdown.
    */
  @Prop() geospatialDistances!: string[] | string;
  /**
   * The text that appears in the header.
   */
  @Prop() panelTitle: string = 'Distance';
  /**
 * Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
 */
  @Prop({ reflect: true, mutable: true }) public isCollapsed = false;

  /** Mobile breakpoint at which the Apply button becomes visible */
  @Prop() mobileBreakpoint = '640px';
  @State() private validatedBreakpoint = this.mobileBreakpoint;

  constructor() {
    this.debouncedSearch = this.debounce(() => this.executeSearchWithChecks(), 200);
  }

  @Watch('mobileBreakpoint')
  protected validateMobileBreakpoint(newVal: string) {
    // Accept only numeric values ending in px or rem (e.g. "1024px", "1.5rem")
    const valid = /^\d+(px|rem)$/i.test(newVal);
    if (valid) {
      this.validatedBreakpoint = newVal;
    } else {
      console.warn(
        `[atomic-distance-resources] invalid mobileBreakpoint: "${newVal}". Falling back to default.`
      );
      this.validatedBreakpoint = '640px';
    }
  }

  componentWillLoad() {
    this.validateMobileBreakpoint(this.mobileBreakpoint);
    this.registerDistanceValues();
  }

  // We recommend initializing the bindings and the Headless controllers
  // using the `connectedCallback` lifecycle method with async/await.
  // Using `componentWillLoad` will hang the parent atomic-search-interface initialization.
  public async connectedCallback() {
    try {
      // Wait for Atomic to load and initialize
      await customElements.whenDefined('atomic-search-interface');
      this.bindings = await initializeBindings(this.element);

      // Initialize the status controller
      const statusController = buildSearchStatus(this.bindings.engine);
      this.searchEngine = this.bindings.engine;

      // Subscribe to state changes
      this.statusUnsubscribe = statusController.subscribe(() => {
        this.statusState = statusController.state
      });

      this.registerDistanceValues()

      // Set up location providers and try to set the position
      const providers = this.getProvidersFromOptions();
      await this.tryToSetPositionFromProviders(providers);


      this.distanceFacet = buildFacet(this.bindings.engine, { options: this.facetOptions });

      this.facetUnsubscribe = this.distanceFacet.subscribe(() => {
        this.distanceFacetState = this.distanceFacet.state;
      });

      this.registerFacet();
      // Re‐render on language change (i18n)
      const updateLanguage = () => forceUpdate(this);
      this.bindings.i18n.on('languageChanged', updateLanguage);
      this.i18nUnsubscribe = () => this.bindings.i18n.off('languageChanged', updateLanguage);

    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
        this.error = error as Error;
      }
    }

    // Ensure executeFirstSearch is completed before any further actions
    if (this.searchEngine) {
      //await this.searchEngine.executeFirstSearch();
      this.firstSearchCompleted = true;

      // If applyGeospatialFilter was called before firstSearchCompleted, execute it now
      if (this.pendingApplyGeospatialFilter) {
        this.applyGeospatialFilter();
        this.pendingApplyGeospatialFilter = false;
      }
    }
  }

  // The `disconnectedCallback` lifecycle method should be used to unsubcribe controllers and
  // possibly the i18n language change listener.
  public disconnectedCallback() {
    this.facetUnsubscribe();
    this.statusUnsubscribe();
    this.i18nUnsubscribe();
  }

  public setPosition(latitude: number, longitude: number): void {
    // Only update and trigger the search if the position actually changes
    if (latitude !== this.latitude || longitude !== this.longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
      this.applyGeospatialFilter();
    }
  }

  public get labelValue() {
    return this.label;
  }

  public hasActiveValues() {
    return this.distanceFacet?.state?.values?.some((v) => v.state === 'selected') ?? false;
  }

  public numberOfSelectedValues() {
    return this.distanceFacet?.state?.values?.filter((v) => v.state === 'selected').length ?? 0;
  }

  private debouncedSearch: () => void;

  private toggleCollapse = () => {
    this.isCollapsed = !this.isCollapsed;
  };

  private registerFacet() {
    if (this.facetRegistered) {
      return;
    }
    this.bindings.store.registerFacet('facets', this.facetInfo);
    this.facetRegistered = true;
  }

  private get facetOptions(): FacetOptions {
    const opts: FacetOptions = {
      facetId: this.Id,
      field: this.distanceField,
      hasBreadcrumbs: false
    };
    return opts;
  }

  private get facetInfo(): FacetInfo {
    return {
      facetId: this.Id!,
      element: this.element,
      label: () => this.bindings.i18n.t(this.label as any)
    };
  }

  private getLatLngCookie() {
    var i, x, y, ARRcookies = document.cookie.split(';');
    for (i = 0; i < ARRcookies.length; i++) {
      if (x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('=')), y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1), 'lat_lgn' == (x = x.replace(/^\s+|\s+$/g, ''))) return unescape(y);
    }
    return ''
  }

  private async tryToSetPositionFromProviders(providers: IGeolocationPositionProvider[]): Promise<void> {
    try {
      const position = await this.tryGetPositionFromProviders(providers);

      if (position) {
        this.setPosition(position.latitude, position.longitude);
      } else {
        // If no position is found, trigger a fallback behavior
        this.setPosition(this.defaultLatitude, this.defaultLongitude);
      }
    } catch (error) {
      if (error.message !== "User denied Geolocation" || error.message !== "User denied geolocation prompt") {
        this.error = error as Error;
      }
      this.setPosition(this.defaultLatitude, this.defaultLongitude);
    }
  }

  private async tryGetPositionFromProviders(providers: IGeolocationPositionProvider[]): Promise<IGeolocationPosition | null> {
    while (providers.length > 0) {
      const provider = providers.shift();
      try {
        const position = await provider.getPosition();
        if (position?.latitude && position?.longitude) {
          return position; // Return the first valid position
        }
        else {
          return null;
        }
        // No else needed, as position null will continue the loop
      } catch (error) {
        if (error.message === 'User denied Geolocation' || error.message === "User denied geolocation prompt") {
          console.warn('User denied geolocation permission.');
        } else {
          this.error = error;
          console.warn('Error resolving position from provider:', error);
        }
        // If no position was found from any providers
        return null;
      }
    }
  }

  private getProvidersFromOptions(): IGeolocationPositionProvider[] {
    const providers: IGeolocationPositionProvider[] = [];

    var cookie = this.getLatLngCookie();

    if (cookie.length > 0) {
      providers.push(new LatLngCookiePositionProvider(cookie));
    }

    if (this.useNavigator) {
      providers.push(new NavigatorPositionProvider());
    }

    if (this.defaultLatitude && this.defaultLongitude) {
      providers.push(new StaticPositionProvider(this.defaultLatitude, this.defaultLongitude));
    }

    return providers;
  }

  private async applyGeospatialFilter() {
    if (!this.latitude && !this.longitude && !this.distance) {
      console.error("Location and distance not set.");
      return;
    }

    try {
      const radiusInMeters = this.convertDistanceToMeters(this.distance);
      const geoQueryExp = this.getGeoQueryExpression(this.latitude, this.longitude, radiusInMeters);
      const action1 = loadAdvancedSearchQueryActions(this.searchEngine).updateAdvancedSearchQueries({
        aq: geoQueryExp
      });

      // Dispatch the action to update the advanced query
      this.searchEngine.dispatch(action1);

      // Call the debounced search function
      this.debouncedSearch();

    } catch (error) {
      console.error("Failed to apply distance sorting", error);
    }
  }

  private async executeSearchWithChecks() {
    // If a search is already in progress, do not execute a new one
    if (this.isSearchInProgress) {
      console.warn("Search is already in progress. Aborting additional search execution.");
      return;
    }

    // If the first search is not yet completed, mark as pending and return
    if (!this.firstSearchCompleted) {
      console.warn("Attempt to execute a search before the first search was completed.");
      this.pendingApplyGeospatialFilter = true;
      return;
    }

    this.isSearchInProgress = true;

    try {
      const { executeSearch } = loadSearchActions(this.searchEngine);
      const { logInterfaceLoad } = loadSearchAnalyticsActions(this.searchEngine);

      // Dispatch the action and wait for the search to complete
      await this.searchEngine.dispatch(executeSearch(logInterfaceLoad()));
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Search failed with an unexpected error:", error);
      }
    } finally {
      // Reset the lock after the search completes
      this.isSearchInProgress = false;
    }
  }

  private debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function (...args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  private async resolveLocationToCoordinates(location: string): Promise<{ latitude: number, longitude: number }> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.googleApiKey}&sensor=false`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const latitude = data.results[0].geometry.location.lat;
        const longitude = data.results[0].geometry.location.lng;
        return { latitude, longitude };
      } else {
        console.error('Geocoding API error:', data.status);
        return Promise.reject('Failed to resolve location');
      }
    } catch (error) {
      console.error('Error calling the Geocoding API', error);
      this.error = error as Error;
      return Promise.reject(error);
    }
  }

  private getGeoQueryExpression(latitude: number, longitude: number, radius: number) {
    return `(@distance <= ${radius}) $qf(function:'dist(@${this.latitudeField}, @${this.longitudeField}, ${latitude}, ${longitude})', fieldName: 'distance')`;
  }

  private registerDistanceValues() {
    let distancesArray: string[] = [];

    if (typeof this.geospatialDistances === 'string') {
      try {
        // Parse the string into an array
        distancesArray = JSON.parse(this.geospatialDistances);

        // Validate that the parsed array is actually an array
        if (!Array.isArray(distancesArray)) {
          throw new Error('Parsed geospatialDistances is not an array.');
        }
      } catch (error) {
        console.error('Error parsing geospatialDistances:', error);
        this.distanceValues = [];
        return; // Stop further processing if parsing fails
      }
    } else {
      console.error(
        'geospatialDistances must be a string representation of an array.'
      );
      this.distanceValues = [];
      return; // Stop further processing if geospatialDistances is not a string
    }

    // Validate that each item in the array is a valid number or a numeric string
    const validDistances = distancesArray.every((value) =>
      !isNaN(Number(value))
    );

    if (validDistances) {
      // Initialize the distances array with "Any Distance"
      this.distanceValues = ['1000000'];

      // Convert all values to strings to ensure consistency
      this.distanceValues = this.distanceValues.concat(
        distancesArray.map((value) => String(Number(value)))
      );

      // Generate distance labels based on the unit (Miles or Kilometers)
      const distanceLabels = this.unit === 'Miles'
        ? ['Any Distance', ...distancesArray.map((value) => `${Number(value)} Miles`)]
        : ['Any Distance', ...distancesArray.map((value) => `${Number(value)} Kilometers`)];

      // Check length match before creating the Map
      if (distanceLabels.length !== this.distanceValues.length) {
        console.error('Mismatch between distance labels and values length:', distanceLabels, this.distanceValues);
        return;
      }

      // Create a Map of labels to values
      this.distances = new Map(
        distanceLabels.map((label, index) => [label, this.distanceValues[index]])
      );
    } else {
      console.error(
        'geospatialDistances must be an array of numeric values or numeric strings. (i.e. [25, 50] or ["25", "50"]).'
      );
      this.distanceValues = [];
    }
  }

  async handleLocationInput(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.applyLocation();
  }

  /** Handle Apply button click on mobile */
  private applyLocation = async () => {
    if (!this.postalInputEl) return;
    const value = this.postalInputEl.value.trim();
    const errorEl = this.element.shadowRoot!.getElementById('error-message');
    if (!value) {
      if (errorEl) errorEl.textContent = 'Please enter a valid city or postal code.';
      return;
    }
    try {
      const { latitude, longitude } = await this.resolveLocationToCoordinates(value);
      this.setPosition(latitude, longitude);
      if (errorEl) errorEl.textContent = '';
    } catch {
      if (errorEl) errorEl.textContent = 'Location not found. Please enter a valid city or postal code.';
    }
  };

  setUnit(unit: 'Miles' | 'Kilometers') {
    this.unit = unit;
    this.registerDistanceValues();
    this.applyGeospatialFilter();
  }

  setDistance(event: Event) {
    this.distance = (event.target as HTMLSelectElement).value;
    this.applyGeospatialFilter();
  }

  private convertDistanceToMeters(distance: string): number {
    const value = parseFloat(distance.split(' ')[0]); // Extracting the numeric value
    if (this.unit === 'Miles') {
      return value * 1609.34; // Miles to meters conversion factor
    } else { // Kilometers
      return value * 1000; // Kilometers to meters conversion factor
    }
  }

  render() {
    if (this.error) {
      return (
        <atomic-component-error element={this.element} error={this.error}></atomic-component-error>
      );
    }

    if (!this.bindings || !this.statusState.hasResults) {
      return;
    }

    if (!this.distanceFacetState) {
      console.warn('Distance facet state is not initialized yet.');
      return;
    }

    // plain chevron pointing down
    const chevronSvg =
      '<svg viewBox="0 0 12.6 7.2" xmlns="http://www.w3.org/2000/svg"><path d="m11.3 7.04c-.3 0-.5-.1-.7-.3l-4.6-4.6-4.6 4.6c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l5.2-5.2c.4-.4 1.2-.4 1.6 0l5.2 5.2c.4.4.4 1 0 1.4-.2.2-.4.3-.7.3"/></svg>';

    return (
      <div class="distance-panel" part="panel">
        <button
          class="btn-text-transparent flex w-full justify-between rounded-none px-2 py-1 text-lg font-bold ripple-parent ripple-relative"
          part="label-button"
          aria-label={
            this.isCollapsed
              ? `Expand the ${this.panelTitle} selector`
              : `Collapse the ${this.panelTitle} selector`
          }
          aria-expanded={!this.isCollapsed}
          onClick={this.toggleCollapse}>
          <div class="truncate ripple-relative">{this.panelTitle}</div>
          <atomic-icon
            part="label-button-icon"
            class={{
              'ml-4 w-3 shrink-0 self-center hydrated ripple-relative': true,
              // rotate the chevron 180° when isCollapsed
              'rotate-180': this.isCollapsed,
            }}
            icon={chevronSvg}
            aria-hidden="true"
          ></atomic-icon>
        </button>
        <div class={{ 'panel-body': true, isCollapsed: this.isCollapsed }} part="content">
          <div class="distance-metric-rb" part="metric-container">
            <input type="radio" part="km-input" id="kilometers" name="unit" value="Kilometers" checked={this.unit === 'Kilometers'} onChange={() => this.setUnit('Kilometers')} />
            <label htmlFor="kilometers" part="km-label">Kilometers</label>
            <input type="radio" part="mile-input" id="miles" name="unit" value="Miles" checked={this.unit === 'Miles'} onChange={() => this.setUnit('Miles')} />
            <label htmlFor="miles" part="mile-label">Miles</label>
          </div>
          <div class="form-container" part="form-container">
            {/* Only render the select if geospatialDistances is set */}
            {this.geospatialDistances && (
              <Fragment>
                <div class="distance-field" part="distance-selector-container">
                  <div class="locDistance" part="distance-selector-wrapper">
                    <select part="distance-selector" class="no-selectize no-bg" onInput={(event) => this.setDistance(event)}>
                      {Array.from(this.distances.entries()).map(([key, value]) => (
                        <option value={value}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Fragment>
            )}

            {/* Only render if geospatialDistances and googleApiKey are both set */}
            {this.geospatialDistances && this.googleApiKey && (
              <Fragment>
                <div part="from-box" class="seperator">from</div>
              </Fragment>
            )}

            {/* Only render the input if googleApiKey is set */}
            {this.googleApiKey && (
              <Fragment>
                {/* dynamic mobile breakpoint styles */}
                <style>{`
                  .apply-btn.mobile-only { display: none; }
                  @media (max-width: ${this.validatedBreakpoint}) {
                    .apply-btn.mobile-only { display: inline-block; }
                  }
                `}</style>
                <div class="postal-code-box" part="postal-field-container">
                  <input
                    id="location-filter"
                    part="postal-filter-input"
                    class="location-filter-setLocation flex"
                    type="text"
                    placeholder="Postal Code/City"
                    aria-label="Enter Postal Code or City"
                    aria-invalid="false"
                    onKeyDown={(event) => this.handleLocationInput(event as KeyboardEvent)}
                    ref={(el) => this.postalInputEl = el as HTMLInputElement}
                  />
                </div>
                <div part="error-message" id="error-message" aria-live="assertive" role="alert"></div>
                <button
                  part="postal-submit-button"
                  class="bg-background border-neutral rounded-lg border p-4 my-4"
                  aria-label="Apply location filter"
                  onClick={() => this.applyLocation()}>
                  Apply
                </button>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
}
