import { Component, h } from "@stencil/core";
import template1 from "./template-1.html";

/**
 * Component used to manage results & result templates.
 * See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/
 */
@Component({
  tag: "results-manager",
  shadow: false,
})
export class ResultsManager {
  
  public async componentWillLoad() {
    return await customElements.whenDefined('atomic-search-interface');
  }

  public render() {
    return (
      <atomic-result-list>
        <atomic-result-template>
          <template innerHTML={template1}></template>
        </atomic-result-template>
      </atomic-result-list>
    );
  }
}
