import { Bindings, initializeBindings } from "@coveo/atomic";
import { Component, Element, forceUpdate, h, Prop, State } from "@stencil/core";
import {
  TabState,
  Tab as HeadlessTab,
  TabOptions,
  TabProps,
  buildTab,
  Unsubscribe,
  loadFacetOptionsActions
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
  @Prop() expression: string = "";
  @Prop() label: string = "no-label";
  @Prop() isActive: boolean = false;
  @Prop() excludedFacets!: string;
  @Prop() tabId!: string;

  private bindings?: Bindings;
  private error?: Error;
  private tabController!: HeadlessTab;
  private tabUnsubscribe: Unsubscribe = () => {};
  private i18nUnsubscribe = () => {};
  private excludedFacetsList!: string [];
  private hasFacetList: boolean = false;


  @Element() private host!: Element;
  @State() private tabState!: TabState;

  public async connectedCallback() {
    await customElements.whenDefined('atomic-search-interface');
    try {

      this.bindings = await initializeBindings(this.host);

      this.hasFacetList = this.excludedFacets? true : false;


      const options: TabOptions = {
        id: this.tabId? this.tabId : this.label,
        expression: this.expression,
      };


      const props: TabProps = {
        initialState: { isActive: this.isActive },
        options: options,
      };


      this.tabController = buildTab(this.bindings.engine, props);
      this.excludedFacetsList = this.excludedFacets?.split(',');
      //Subscribe to controller state changes.
      this.tabUnsubscribe = this.tabController.subscribe(
        () => (this.updateState())
      );
        
      if(this.tabState.isActive){
        this.disableExcludedFacets();
      }

      const updateLanguage = () => forceUpdate(this);
      this.bindings!.i18n.on("languageChanged", updateLanguage);
      this.i18nUnsubscribe = () => 
        this.bindings!.i18n.off("languageChanged", updateLanguage);

    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  public disconnectedCallback() {
    this.tabUnsubscribe();
    this.i18nUnsubscribe();
  }

  private updateState(){
    this.tabState = this.tabController.state
    this.enableExcludedFacets()
  }

  private disableExcludedFacets(){

    const { disableFacet } = loadFacetOptionsActions(this.bindings.engine); 
    this.excludedFacetsList?.forEach((facet)=>{
      this.bindings.engine.dispatch(disableFacet(facet.trimStart()));
    });
  }

  private enableExcludedFacets(){

    const { enableFacet } = loadFacetOptionsActions(this.bindings.engine); 
    this.excludedFacetsList?.forEach((facet)=>{
      this.bindings.engine.dispatch(enableFacet(facet.trimStart()));
    });
  }

  public componentWillLoad(){
    if (this.isActive && this.hasFacetList){
       this.disableExcludedFacets();
    } 
  }
  
  public componentDidUpdate(){
    if(this.tabState.isActive){
      this.disableExcludedFacets();
    }
  }

  private tabSelect(){
    this.tabController.select();
    this.disableExcludedFacets();
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

    const activeClass = this.tabState.isActive ? 'active': '';
    return (
      <a part={`tab-anchor ${activeClass}`} class={activeClass} onClick={() => this.tabSelect()}>
        <span part="tab-label">{this.bindings.i18n.t(this.label)}</span>
      </a>
    );
  }
}