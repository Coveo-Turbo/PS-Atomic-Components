import { Bindings, initializeBindings } from "@coveo/atomic";
import {
  GeneratedAnswer,
  GeneratedAnswerState,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  loadPaginationActions,
  loadSearchAnalyticsActions,
  loadSearchActions,
  buildContext,
} from "@coveo/headless";
import { Component, Element, State, h, Prop } from "@stencil/core";

/**
 * @internal
 */
@Component({
  tag: "products-from-generated-answer",
  styleUrl: "./genai-products.css",
  shadow: false,
})
export class ProductsFromGeneratedAnswer {
  public bindings!: Bindings;
  public generatedAnswer!: GeneratedAnswer;
  public searchStatus!: SearchStatus;

  @State() private groupingField: string = "";

  @State() private query: string = "";

  @State()
  private generatedAnswerState!: GeneratedAnswerState;

  @State()
  private searchStatusState!: SearchStatusState;

  @State()
  public error!: Error;

  @State()
  hidden = true;

  @State()
  graLoading = false;

  @Element()
  private host!: Element;

  @State()
  private products!: [];
  @State()
  private rgaAnswer!: string;

  @Prop() prompt: string = `You will suggest a list of products in bullet points needed in the text provided in the user query.\n\nOnly list products, no description or brands. \nList them in order or importance.\nDont add multiple choices on the same line.\nDont list multiple products on the same line with the word or.\nDont write (optional).\nUse bullet form, starting each item with - , one item per line.\r\n`
  ;
  @Prop() rgaurl: string = "https://aiproxy.poc.coveodemo.com/AnswerToProduct/v1";
  @Prop() apikey: string;
  @Prop() orgid: string;
  @Prop() tab!:string;
  @Prop() pipeline!:string;
  @Prop() contextrga!:string;
  @Prop() contextproduct!:string;
  @Prop() filterfields!:string;
  @Prop() searchhub:string;
  @Prop() debug: boolean = false;


  public async componentDidLoad() {
    await customElements.whenDefined('atomic-search-interface');
    this.bindings = await initializeBindings(this.host);
  
    if (this.contextrga) {
        const ctx = buildContext(this.bindings.engine);
        ctx.set(JSON.parse(this.contextrga));
    }
    
    return this.loadGeneratedAnswer();
  }

  private async loadGeneratedAnswer() {
    this.generatedAnswerState = {} as GeneratedAnswerState;
    try {
      this.bindings = await initializeBindings(this.host);
      this.searchStatus = buildSearchStatus(this.bindings.engine);
      
      this.bindings.engine.subscribe(() => {
        const newState: any = this.bindings.engine.state.generatedAnswer || {};

        if (this.generatedAnswerState.answer !== newState.answer || newState.isLoading || newState.isStreaming || !newState.isVisible) {
          this.graLoading = true;
          this.rgaAnswer = "";
          this.products = [];
        }

        if (newState && newState.citations?.length && this.graLoading && !newState.isLoading && !newState.isStreaming && newState.isVisible) {
          this.graLoading = false;
          if (newState.answer) {
            this.getProductKeywords(newState.answer);
          }
        }

        this.generatedAnswerState = newState;
      });

     this.searchStatus.subscribe(() => {
        this.searchStatusState = this.searchStatus.state;
      });
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  public async getProductKeywords(rgaAnswer: string) {
    this.rgaAnswer = rgaAnswer;

    let payload = {
     prompt : this.prompt,
     answer : this.rgaAnswer,
     orgid :  this.orgid,
     apikey : this.apikey,
     searchhub : '',
     pipeline : '',
     tab: '',
     context : {},
     filterfield: this.groupingField,
    }

    if (this.searchhub) {
      payload.searchhub = this.searchhub;
    }

    if (this.pipeline) {
      payload.pipeline = this.pipeline;
    }

    if (this.tab) {
      payload.tab = this.tab;
    }

    if(this.contextproduct != ""){
      payload.context = JSON.parse(this.contextproduct || "");
    }

    const config = {
     method: 'POST',
     headers: {
       'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
 
    const res = await (await fetch(this.rgaurl || 'https://aiproxy.poc.coveodemo.com/AnswerToProduct/v1',config)).json();

    this.products = res.results;
    this.query = res.rga_query;

    this.updateSearchInterface();
  }

  private get hasRetryableError() {
    
    return !this.searchStatusState?.hasError && this.generatedAnswerState.error?.isRetryable;
  }

  private get shouldBeHidden() {
    if (!!this.generatedAnswerState) {
      const { isLoading, answer, citations } = this.generatedAnswerState;
      return !(isLoading || answer !== undefined || citations?.length) && !this.hasRetryableError;
    }
    return true;
  }

  private async updateSearchInterface() {
    const searchInterface: HTMLAtomicSearchInterfaceElement = this.host.querySelector("#internal-si")!;
    const organizationId = this.orgid!;
    const accessToken = this.apikey!;
    await searchInterface.initialize({
      accessToken,
      organizationId,
      //organizationEndpoints: await searchInterface.getOrganizationEndpoints(organizationId),

      search: {
        preprocessSearchResponseMiddleware: (response) => {
          if(this.products.length > 0) {
            response.body.results = this.products;
            this.products = [];
          }

          return response;
        },
      },
     preprocessRequest: (request, clientOrigin, metadata) => {
        if (metadata?.method === "search" && clientOrigin === "searchApiFetch") {
          const body = JSON.parse(request.body as string);
          body.filterField = this.groupingField;
          body.q = this.query;

          if (this.searchhub) {
            body.searchHub = this.searchhub;
          }
          if (this.pipeline) {
            body.pipeline = this.pipeline
          }

          if (this.tab) {
            body.tab = this.tab;
          }
  
          if (this.debug) {
            body.debug = true;
          }
  
          if (this.contextproduct) {
            body.context = JSON.parse(this.contextproduct);
          }

          request.body = JSON.stringify(body);
        }
        
        return request;
      },
    });

    searchInterface.engine?.dispatch(loadPaginationActions(searchInterface.engine).updateNumberOfResults(24));
    searchInterface.executeFirstSearch();
  }

  private async searchAgain() {
    if (this.searchStatus?.state?.firstSearchExecuted) {
      const searchInterface: HTMLAtomicSearchInterfaceElement = this.host.querySelector("#internal-si")!;
      const engine = searchInterface.engine!;
      const { executeSearch } = loadSearchActions(engine);
      const { logInterfaceLoad } = loadSearchAnalyticsActions(engine);
      engine.dispatch(executeSearch(logInterfaceLoad()));
    }
  }

  private getGroupingFields() {
    const fieldsStr = this.filterfields || "";

    if (fieldsStr != "") {
      const fields = fieldsStr.split(",");
      
      if(this.groupingField == "") {
        this.groupingField = fields[0];
      }

      const radioButtons = fields.map((field) => (
        <label>
          <input type='radio' name='grouping-field' value={field} checked={this.groupingField === field} />
          {field}
        </label>
      ));

      return (
        <div id='grouping_field_radiogroup' onChange={this.updateGroupingField.bind(this)}>
          <br />
          <h2>Grouping field:</h2>
          <div>{radioButtons}</div>
        </div>
      );
    } else {
      return null;
    } 
  }

  private updateGroupingField(event: any) {
    const value = event?.target?.value;
    if (value) {
      this.groupingField = value;
      this.searchAgain();
    }
  }

  private getProductRender() {
    let fieldsToInclude: string = this.filterfields || "";
    // sort, remove empty strings and duplicates
    fieldsToInclude = JSON.stringify(
      [
        ...new Set(
          fieldsToInclude
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i)
        ),
      ].sort()
    );
    return (
      <div class='inner-si'>
        <atomic-search-interface reflect-state-in-url='false' id='internal-si' fields-to-include={fieldsToInclude}>
          <atomic-search-layout>
            <atomic-layout-section section='facets'>
              <atomic-category-facet field='ec_categoryh' label='Categories' delimiting-character='|'></atomic-category-facet>
              <atomic-facet-manager>
                <atomic-facet field='ec_brand' label='Brand'></atomic-facet>
                <atomic-rating-facet field='ec_rating' label='Rating'></atomic-rating-facet>
                <atomic-numeric-facet field='ec_price' label='Price'></atomic-numeric-facet>
                {this.getGroupingFields()}
              </atomic-facet-manager>
            </atomic-layout-section>
            <atomic-layout-section section='main'>
              <atomic-layout-section section='status'>
                <atomic-breadbox></atomic-breadbox>
                <atomic-refine-toggle></atomic-refine-toggle>
              </atomic-layout-section>
              <atomic-layout-section section='results'>
                <results-manager-for-products></results-manager-for-products>
                <atomic-query-error></atomic-query-error>
                <atomic-no-results></atomic-no-results>
              </atomic-layout-section>
              <atomic-layout-section section='pagination'>
                <atomic-load-more-results></atomic-load-more-results>
              </atomic-layout-section>
            </atomic-layout-section>
          </atomic-search-layout>
        </atomic-search-interface>
      </div>
    );
  }

  public render() {
    if (this.shouldBeHidden) {
      return null;
    }
    return <host>{this.getProductRender()}</host>;
  }
}
