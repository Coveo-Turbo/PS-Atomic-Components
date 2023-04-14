import { Bindings, initializeBindings } from "@coveo/atomic";
import { Component, Element, h, Prop, State } from "@stencil/core";
import {
  TabState,
  Tab as HeadlessTab,
  TabOptions,
  TabProps,
  buildTab,
  Unsubscribe,
} from "@coveo/headless";

@Component({
  tag: "custom-tab",
  styleUrl: "custom-tab.css",
  shadow: true,
})

/**
 * The `custom-tab` component will provide a tab functionality in the search interface.
 *
 * @part tab-anchor - the tab anchor tag.
 * @part tab-label - the tab label.
 */

export class CustomTab {
  @Prop() expression!: string;
  @Prop() label!: string;
  @Prop() isActive!: boolean;

  private bindings?: Bindings;
  private error?: Error;
  private tabController!: HeadlessTab;
  private tabUnsubscribe: Unsubscribe = () => {};

  @Element() private host!: Element;
  @State() private tabState!: TabState;

  public async connectedCallback() {
    try {
      this.bindings = await initializeBindings(this.host);
      const options: TabOptions = {
        id: this.label,
        expression: this.expression,
      };
      const props: TabProps = {
        initialState: { isActive: this.isActive },
        options: options,
      };
      this.tabController = buildTab(this.bindings.engine, props);
      //Subscribe to controller state changes.
      this.tabUnsubscribe = this.tabController.subscribe(
        () => (this.tabState = this.tabController.state)
      );
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  public disconnectedCallback() {
    this.tabUnsubscribe();
  }

  public render() {
    if (this.error) {
      return (
        <p>
          Error when initializing the component, please view the console for
          more information.
        </p>
      );
    }

    if (!this.bindings || !this.tabState) {
      return;
    }

    const activeClass = this.isActive ? 'active': '';
    return (
      <a part="tab-anchor" class={activeClass} onClick={() => this.tabController.select()}>
        <span part="tab-label">{this.label}</span>
      </a>
    );
  }
}