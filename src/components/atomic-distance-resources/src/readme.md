# atomic-distance-resources



<!-- Auto Generated Below -->


## Properties

| Property                           | Attribute              | Description                                                                                                                                             | Type                 | Default       |
| ---------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------- |
| `defaultLatitude`                  | `default-latitude`     | The default latitude value to be used if no other location is provided.                                                                                 | `number`             | `33.9348279`  |
| `defaultLongitude`                 | `default-longitude`    | The default longitude value to be used if no other location is provided.                                                                                | `number`             | `-84.3546017` |
| `distanceField` _(required)_       | `distance-field`       | Specifies the name of the field in which to store the distance value.                                                                                   | `string`             | `undefined`   |
| `geospatialDistances` _(required)_ | `geospatial-distances` | The array of geospatial distances, as a string (e.g., `"[25, 50, 100]"`), which will be parsed and converted into options for the distance dropdown.    | `string \| string[]` | `undefined`   |
| `googleApiKey` _(required)_        | `google-api-key`       | A valid Google API key to be used for geocoding a city or postal code.                                                                                  | `string`             | `undefined`   |
| `isCollapsed`                      | `is-collapsed`         | Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property. | `boolean`            | `false`       |
| `latitudeField` _(required)_       | `latitude-field`       | Specifies the name of the field that contains the latitude value.                                                                                       | `string`             | `undefined`   |
| `longitudeField` _(required)_      | `longitude-field`      | Specifies the name of the field that contains the longitude value.                                                                                      | `string`             | `undefined`   |
| `mobileBreakpoint`                 | `mobile-breakpoint`    | Mobile breakpoint at which the Apply button becomes visible                                                                                             | `string`             | `'640px'`     |
| `panelTitle`                       | `panel-title`          | The text that appears in the header.                                                                                                                    | `string`             | `'Distance'`  |
| `useNavigator`                     | `use-navigator`        | Whether to request the geolocation service of the web browser. If not defined, will not try to request the service. Defaults to `true`.                 | `boolean`            | `true`        |


## Shadow Parts

| Part                            | Description |
| ------------------------------- | ----------- |
| `"content"`                     |             |
| `"distance-selector"`           |             |
| `"distance-selector-container"` |             |
| `"distance-selector-wrapper"`   |             |
| `"error-message"`               |             |
| `"form-container"`              |             |
| `"from-box"`                    |             |
| `"km-input"`                    |             |
| `"km-label"`                    |             |
| `"label-button"`                |             |
| `"label-button-icon"`           |             |
| `"metric-container"`            |             |
| `"mile-input"`                  |             |
| `"mile-label"`                  |             |
| `"panel"`                       |             |
| `"postal-field-container"`      |             |
| `"postal-filter-input"`         |             |
| `"postal-submit-button"`        |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
