import { Component, Element, State, h } from "@stencil/core";
import { resultContext } from "@coveo/atomic";
import { Result } from "@coveo/headless";

/**
 * Component used to manage results & result templates.
 * See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/
 */
@Component({
  tag: "product-grouping",
  styleUrl: "product-grouping.scss",
  shadow: false,
})
export class ResultsManagerForProducts {
  @State() private result?: any;
  @Element() private host!: HTMLElement;

  public async connectedCallback() {
    await customElements.whenDefined('atomic-search-interface');
    try {
      this.result = await resultContext(this.host);
      // expand "raw" to simplify the rest of the code
      this.result = { ...(this.result.raw || {}), ...this.result };
    } catch (error) {
      console.error(error);
      this.host.remove();
    }
  }

  private showRelatedProducts() {
    if (this.result) {
      // const ec_categories = this.result.ec_category || [];
      // const categories = ec_categories.map((c: string) => <nobr>{c}</nobr>).reduce((prev: any, curr: any) => [prev, " / ", curr]);
      return (
        <div class='related-products-container'>
          <div class='related-products'>
            {this.result.childResults.map((product: Result) => {
              const p: any = { ...product.raw, ...product };
              return <img src={p.ec_images} alt={p.ec_name} title={p.ec_name} />;
            })}
          </div>
        </div>
      );
    }
    return null;
  }

  public render() {
    return <div>{this.showRelatedProducts()}</div>;
  }
}
