import { Bindings, initializeBindings } from "@coveo/atomic";
import { Component, Element, h, State, Prop } from "@stencil/core";
import {
  loadAdvancedSearchQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
  Unsubscribe,
} from "@coveo/headless";

@Component({
  tag: "static-filter",
  styleUrl: "static-filter.css",
  shadow: true,
})
export class StaticFilterComponent {
  @State() private bindings?: Bindings;

  private error?: Error;

  @Element() private host!: Element;
  @Prop() public caption!: string;
  @Prop() public expression!: string;
  @State() public active: boolean = false;
  private unsubscribeState!: Unsubscribe;

  public async connectedCallback() {
    await customElements.whenDefined('atomic-search-interface');
    try {
      this.bindings = await initializeBindings(this.host);
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  public disconnectedCallback() {
    this.unsubscribeState();
  }
  
  updateStaticFilter() {
    if (!this.bindings) return;
    const {executeSearch} = loadSearchActions(this.bindings.engine);
    const {logSearchboxSubmit} = loadSearchAnalyticsActions(this.bindings.engine);
    const {updateAdvancedSearchQueries} = loadAdvancedSearchQueryActions (this.bindings.engine)

    const action  = updateAdvancedSearchQueries({
        cq: this.active ? this.expression : ""
    });

    this.bindings?.engine.dispatch(action);
    this.bindings?.engine.dispatch(executeSearch(logSearchboxSubmit()));
  }

  toggleState() {
    if (!this.bindings || !this.bindings.engine) return;
    this.active = !this.active;
    this.updateStaticFilter();
  }

  public render() {
    if (this.error) {
      return (
        <p>
          {" "}
          Error when initializing the component, please view the console for
          more information.{" "}
        </p>
      );
    }
    if (!this.bindings) return;

    return (
      <div class="wrapper" part="wrapper">
        <label class="switch" part="switch">
          <input
            part="checkbox"
            type="checkbox"
            checked={!!this.active}
            onClick={() => this.toggleState()}
          />
          <span part="slider" class="slider round"></span>
        </label>
        <label part="label">{this.caption}</label>
      </div>
    );
  }
}