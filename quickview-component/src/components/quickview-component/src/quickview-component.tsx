import { Bindings, initializeBindings, resultContext } from "@coveo/atomic";
import { buildQuickview, Result } from "@coveo/headless";
import { QuickviewState } from "@coveo/headless";
import { Quickview } from "@coveo/headless";
import { Component, Host, h, State, Element } from "@stencil/core";

@Component({
  tag: "quickview-component",
  styleUrl: "quickview-component.css",
  shadow: true,
})
export class QuickviewComponent {
  private bindings?: Bindings;
  private result?: Result;
  private controller!: Quickview;

  @State() state?: QuickviewState;
  @State() isModalOpen = false;
  @State() renderOnce = false;

  @Element() private host!: Element;

  async connectedCallback() {
    this.bindings = await initializeBindings(this.host);
    this.result = await resultContext(this.host);

    this.controller = buildQuickview(this.bindings.engine, {
      options: {
        result: this.result,
      },
    });

    this.controller.subscribe(() => {
      this.state = this.controller.state;
    });
  }

  private toggleModal = (val: boolean) => {
    this.isModalOpen = val;
  };

  private openModal = () => {
    this.controller.fetchResultContent();
    this.toggleModal(true);
  };

  private closeModal = () => {
    this.toggleModal(false);
  };

  render() {
    if (!this.state?.resultHasPreview) return;

    return (
      <Host>
        <button part="button" onClick={this.openModal}>
          View
        </button>
        <div id="quick-view" class={this.isModalOpen ? "open" : "closed"}>
          <button onClick={this.closeModal}>X</button>
          <iframe srcdoc={this.state.content}></iframe>
        </div>
      </Host>
    );
  }
}