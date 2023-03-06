import { Bindings, resultContext, initializeBindings } from "@coveo/atomic";
import { Component, Host, h, Element, State, forceUpdate } from "@stencil/core";
import { Result, Unsubscribe } from "@coveo/headless";

interface CustomResult extends Result {
  priceAndAvailability:
    | {
        Data: {
          netPrice: string;
          availability: number;
          shippingMultiple: number;
        };
      }
    | undefined;
}

@Component({
  tag: "add-to-cart",
  styleUrl: "add-to-cart.css",
  shadow: true,
})
export class AddToCart {
  @Element() private host!: Element;
  @State() quantity: number = 1;
  @State() private availability: number = 0;
  private result!: CustomResult;
  private bindings?: Bindings;

  private i18nUnsubscribe: Unsubscribe = () => {};

  public async connectedCallback() {
    this.bindings = await initializeBindings(this.host);
    this.result = await resultContext(this.host);
    this.quantity =
      this.result.priceAndAvailability?.Data?.shippingMultiple || 1;
    this.availability = this.result.priceAndAvailability
      ? (this.result.priceAndAvailability.Data.availability as number)
      : 0;

    const updateLanguage = () => forceUpdate(this);
    this.bindings!.i18n.on("languageChanged", updateLanguage);
    this.i18nUnsubscribe = () =>
      this.bindings!.i18n.off("languageChanged", updateLanguage);

  }

  private onAddToOptionClicked = async (e: Event) => {
    //Callback function to add element to cart
  };

  changeQuantity(e: Event) {
    const qtyValue = parseFloat((e.target as HTMLInputElement).value);

    this.quantity = qtyValue;
  }

  checkIsNumber(e: KeyboardEvent) {
    if ((this.quantity?.toString()?.length || 0) + 1 > 11) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  updateQuantity(e: KeyboardEvent) {
    this.quantity = parseFloat((e.target as HTMLInputElement).value);
  }

  public disconnectedCallback() {
    this.i18nUnsubscribe();
  }

  render() {
    const isAvailable = true;
    const isPublished = true;

    if (!isAvailable || !isPublished) {
      this.host.remove();
      return;
    }
    return (
      <Host>
        {isAvailable ? (
          <div
            class="add-to-cart_wrapper"
          >
            <div class="add-to-cart_wrapper__units">
              <input
                part="quantity"
                type="number"
                onKeyUp={(e) => this.updateQuantity(e)}
                onKeyPress={(e) => this.checkIsNumber(e)}
                value={this.quantity}
                maxLength={10}
                onChange={(e) => this.changeQuantity(e)}
              />
              <button
                class="add-button"
                onClick={(e) => this.onAddToOptionClicked(e)}
              >
                {this.bindings?.i18n.t("Add to cart")}
              </button>
            </div>
          </div>
        ) : (
          ""
        )}
      </Host>
    );
  }
}