/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface AddToCart {
        "callbackFunction": string;
    }
    interface CustomPerPage {
        "choicesDisplayed": string;
        "initialChoice"?: number;
    }
    interface CustomTab {
        "expression": string;
        "isActive": boolean;
        "label": string;
    }
    interface ExportSearchResults {
    }
    interface SaveQuery {
    }
    /**
     * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface SearchBoxCategorySuggestions {
        "callbackFunction": string;
    }
    interface StaticFilter {
        "caption": string;
        "expression": string;
    }
}
declare global {
    interface HTMLAddToCartElement extends Components.AddToCart, HTMLStencilElement {
    }
    var HTMLAddToCartElement: {
        prototype: HTMLAddToCartElement;
        new (): HTMLAddToCartElement;
    };
    interface HTMLCustomPerPageElement extends Components.CustomPerPage, HTMLStencilElement {
    }
    var HTMLCustomPerPageElement: {
        prototype: HTMLCustomPerPageElement;
        new (): HTMLCustomPerPageElement;
    };
    interface HTMLCustomTabElement extends Components.CustomTab, HTMLStencilElement {
    }
    var HTMLCustomTabElement: {
        prototype: HTMLCustomTabElement;
        new (): HTMLCustomTabElement;
    };
    interface HTMLExportSearchResultsElement extends Components.ExportSearchResults, HTMLStencilElement {
    }
    var HTMLExportSearchResultsElement: {
        prototype: HTMLExportSearchResultsElement;
        new (): HTMLExportSearchResultsElement;
    };
    interface HTMLSaveQueryElement extends Components.SaveQuery, HTMLStencilElement {
    }
    var HTMLSaveQueryElement: {
        prototype: HTMLSaveQueryElement;
        new (): HTMLSaveQueryElement;
    };
    /**
     * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface HTMLSearchBoxCategorySuggestionsElement extends Components.SearchBoxCategorySuggestions, HTMLStencilElement {
    }
    var HTMLSearchBoxCategorySuggestionsElement: {
        prototype: HTMLSearchBoxCategorySuggestionsElement;
        new (): HTMLSearchBoxCategorySuggestionsElement;
    };
    interface HTMLStaticFilterElement extends Components.StaticFilter, HTMLStencilElement {
    }
    var HTMLStaticFilterElement: {
        prototype: HTMLStaticFilterElement;
        new (): HTMLStaticFilterElement;
    };
    interface HTMLElementTagNameMap {
        "add-to-cart": HTMLAddToCartElement;
        "custom-per-page": HTMLCustomPerPageElement;
        "custom-tab": HTMLCustomTabElement;
        "export-search-results": HTMLExportSearchResultsElement;
        "save-query": HTMLSaveQueryElement;
        "search-box-category-suggestions": HTMLSearchBoxCategorySuggestionsElement;
        "static-filter": HTMLStaticFilterElement;
    }
}
declare namespace LocalJSX {
    interface AddToCart {
        "callbackFunction"?: string;
    }
    interface CustomPerPage {
        "choicesDisplayed": string;
        "initialChoice"?: number;
    }
    interface CustomTab {
        "expression": string;
        "isActive": boolean;
        "label": string;
    }
    interface ExportSearchResults {
    }
    interface SaveQuery {
    }
    /**
     * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface SearchBoxCategorySuggestions {
        "callbackFunction"?: string;
    }
    interface StaticFilter {
        "caption": string;
        "expression": string;
    }
    interface IntrinsicElements {
        "add-to-cart": AddToCart;
        "custom-per-page": CustomPerPage;
        "custom-tab": CustomTab;
        "export-search-results": ExportSearchResults;
        "save-query": SaveQuery;
        "search-box-category-suggestions": SearchBoxCategorySuggestions;
        "static-filter": StaticFilter;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "add-to-cart": LocalJSX.AddToCart & JSXBase.HTMLAttributes<HTMLAddToCartElement>;
            "custom-per-page": LocalJSX.CustomPerPage & JSXBase.HTMLAttributes<HTMLCustomPerPageElement>;
            "custom-tab": LocalJSX.CustomTab & JSXBase.HTMLAttributes<HTMLCustomTabElement>;
            "export-search-results": LocalJSX.ExportSearchResults & JSXBase.HTMLAttributes<HTMLExportSearchResultsElement>;
            "save-query": LocalJSX.SaveQuery & JSXBase.HTMLAttributes<HTMLSaveQueryElement>;
            /**
             * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
             */
            "search-box-category-suggestions": LocalJSX.SearchBoxCategorySuggestions & JSXBase.HTMLAttributes<HTMLSearchBoxCategorySuggestionsElement>;
            "static-filter": LocalJSX.StaticFilter & JSXBase.HTMLAttributes<HTMLStaticFilterElement>;
        }
    }
}