import { Component, h } from "@stencil/core";
import products from "./products.html";

/**
 * Component used to manage results & result templates.
 * See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/
 */
@Component({
  tag: "results-manager-for-products",
  shadow: false,
})
export class ResultsManagerForProducts {
  public async componentWillLoad() {
    return await customElements.whenDefined('atomic-search-interface');
  }

  public render() {
    return (
      <atomic-result-list display='grid' density='compact' image-size='small'>
        <atomic-result-template>
          <template innerHTML={products}></template>
        </atomic-result-template>
      </atomic-result-list>
    );
  }
}
