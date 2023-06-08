import { Component, Element, State, Prop, h } from "@stencil/core";
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from "@coveo/atomic";
import {
  buildCategoryFieldSuggestions,
  CategoryFieldSuggestions,
} from "@coveo/headless";
import { CategoryFacetSearchResult } from "@coveo/headless";

/**
 * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
 *
 * @part recent-query-title - The 'Recent queries' title.
 * @part recent-query-clear - The 'Clear' button for clearing recent queries    .
 */
@Component({
  tag: "search-box-category-suggestions",
  shadow: true,
})
export class SearchBoxCategorySuggestions {
  private bindings!: SearchBoxSuggestionsBindings;
  private categoryFieldSuggestions!: CategoryFieldSuggestions;

  @Element() private host!: HTMLElement;

  @State() public error!: Error;
  @State() public categorySuggestions!: CategoryFacetSearchResult[];
  @Prop() callbackFunction!: string;
  @Prop() field!: string;
  @Prop() delimiter!: string;
  @Prop() basePath: string[] = [];

  public async connectedCallback() {
    await customElements.whenDefined('atomic-search-interface');
    try {
      dispatchSearchBoxSuggestionsEvent((bindings: any) => {
        this.bindings = bindings;
        const options = {
          field: this.field,
          facetId: this.field,
          basePath: this.basePath,
          delimitingCharacter: this.delimiter
        };
        this.categoryFieldSuggestions = buildCategoryFieldSuggestions(
          this.bindings.engine,
          {
            options: {
              facet: options,
            },
          }
        );
        return this.initialize();
      }, this.host);
    } catch (error) {
      this.error = error as Error;
    }
  }

  private initialize(): SearchBoxSuggestions {
    this.bindings.searchBoxController.subscribe(() => {
      this.getCategorySuggestions();
    });

    return {
      position: Array.from(this.host.parentNode!.children).indexOf(this.host),
      renderItems: () => this.renderItems(),
    };
  }

  private getCategorySuggestions() {
    const query = this.bindings.searchBoxController.state.value;
    this.categoryFieldSuggestions.updateText(query);
    this.categoryFieldSuggestions.search();
    this.categorySuggestions = this.categoryFieldSuggestions.state.values;
  }

  private async handleCategoryClick() {
    if(this.callbackFunction && this.callbackFunction in window) {
      // Calling callback function
      (window[this.callbackFunction as any] as unknown as Function)();
    }
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    const query = this.bindings.searchBoxController.state.value;
    if (!query) {
      return [];
    }
    const dedupCategorySuggestions = removeCategoryDuplicates(
      this.categorySuggestions
    );

    const categorySuggestions: SearchBoxSuggestionElement[] =
      dedupCategorySuggestions
        .map(({ displayValue }) => {
          const cleanDisplayValue = getDisplayCategory(displayValue);
          return this.renderItem({ cleanDisplayValue, path: displayValue });
        })
        .slice(0, 5);
    return categorySuggestions;
  }

  private renderItem({
    cleanDisplayValue: value,
    path,
  }: {
    cleanDisplayValue: string;
    path: string;
  }): SearchBoxSuggestionElement {
    const query = this.bindings.searchBoxController.state.value;
    const queryEl = document.createElement("div");
    queryEl.setAttribute("part", "recent-query-content");
    queryEl.setAttribute("data-path", path);
    queryEl.classList.add("flex", "items-center", "break-all", "text-left");
    queryEl.insertAdjacentHTML(
      "afterbegin",
      `
      <span part="recent-query-text" class="break-all line-clamp-2">
        ${query} in <b>${value}</b>
      </span>
    `
    );
    return {
      key: `cate-${encodeForDomAttribute(value)}`,
      query: value,
      part: "recent-query-item",
      content: queryEl,
      ariaLabel: this.bindings.i18n.t("recent-query-suggestion-label", {
        query: value,
        interpolation: { escapeValue: false },
      }),
      onSelect: () => this.handleCategoryClick(),
    };
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}

function encodeForDomAttribute(str: string) {
  return str
    .split("")
    .map((ch) => (ch.match(/(\d|\w)+/g) ? ch : ch.charCodeAt(0)))
    .join("");
}

function removeCategoryDuplicates(
  categorySuggestions: CategoryFacetSearchResult[]
) {
  return categorySuggestions.reduce(
    (acc: CategoryFacetSearchResult[], curr) => {
      const { displayValue } = curr;
      const displayValueExists = acc.some(
        ({ displayValue: accDisplayValue }) => accDisplayValue === displayValue
      );
      if (!displayValueExists) acc.push(curr);
      return acc;
    },
    []
  );
}

function getDisplayCategory(categories: string): string {
  const [catArr] = categories.split("|").slice(-1);
  return catArr;
}