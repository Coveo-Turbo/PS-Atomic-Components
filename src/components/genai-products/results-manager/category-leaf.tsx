import { resultContext } from "@coveo/atomic";
import { Component, Element, State, h } from "@stencil/core";

/**
 * Component used to manage results & result templates.
 * See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/
 */
@Component({
  tag: "category-leaf",
  styleUrl: "category-leaf.scss",
  shadow: false,
})
export class CategoryLeaf {
  @State() private result?: any;
  @Element() private host!: HTMLElement;

  @State() private leaf?: string = "";

  public async connectedCallback() {
    await customElements.whenDefined('atomic-search-interface');
    try {
      this.result = await resultContext(this.host);
      this.result = { ...(this.result.raw || {}), ...this.result };

      this.leaf = (this.result.currentcategorydisplaynames || "").split(">").pop().trim();
    } catch (error) {
      console.error(error);
      this.host.remove();
    }
  }

  public render() {
    return <h2>{this.leaf}</h2>;
  }
}
