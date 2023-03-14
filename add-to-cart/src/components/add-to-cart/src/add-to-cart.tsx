import { Bindings, initializeBindings } from "@coveo/atomic";
import { Component, Host, h, Element, forceUpdate, Prop } from "@stencil/core";
import { Unsubscribe } from "@coveo/headless";

@Component({
  tag: "add-to-cart",
  styleUrl: "add-to-cart.css",
  shadow: true,
})
export class AddToCart {
  @Element() private host!: Element;
  // The Atomic bindings to be resolved on the parent atomic-search-interface.
  // Used to access the Headless engine in order to create controllers, dispatch actions, access state, etc.
  private bindings?: Bindings;

  private i18nUnsubscribe: Unsubscribe = () => {};

  @Prop() callbackFunction: string;

  public async connectedCallback() {
    // Wait for the Atomic bindings to be resolved.
    this.bindings = await initializeBindings(this.host);

    // (Optional) To use if component needs to rerender when the Atomic i18n language changes.
    // If your component does not use any strings or does not support multiple languages,
    // you can ignore everything related to i18n.
    const updateLanguage = () => forceUpdate(this);
    this.bindings!.i18n.on("languageChanged", updateLanguage);
    this.i18nUnsubscribe = () =>
      this.bindings!.i18n.off("languageChanged", updateLanguage);
  }

  private onAddToOptionClicked = async (e: Event) => {
    if(this.callbackFunction && this.callbackFunction in window) {
      // Calling callback function
      (window[this.callbackFunction as any] as unknown as Function)();
    }
  };

  public disconnectedCallback() {
    this.i18nUnsubscribe();
  }

  render() {
    return (
      <Host>
        {
          <div
            class="add-to-cart_wrapper"
          >
            <div class="add-to-cart_wrapper__units">
              <button
                class="add-button"
                onClick={(e) => this.onAddToOptionClicked(e)}
              >
                {this.bindings?.i18n.t("Add to cart")}
              </button>
            </div>
          </div>
        }
      </Host>
    );
  }
}