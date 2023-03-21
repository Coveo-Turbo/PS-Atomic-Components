/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    /**
     * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface SearchBoxCategorySuggestions {
        "callbackFunction": string;
    }
}
declare global {
    /**
     * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface HTMLSearchBoxCategorySuggestionsElement extends Components.SearchBoxCategorySuggestions, HTMLStencilElement {
    }
    var HTMLSearchBoxCategorySuggestionsElement: {
        prototype: HTMLSearchBoxCategorySuggestionsElement;
        new (): HTMLSearchBoxCategorySuggestionsElement;
    };
    interface HTMLElementTagNameMap {
        "search-box-category-suggestions": HTMLSearchBoxCategorySuggestionsElement;
    }
}
declare namespace LocalJSX {
    /**
     * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface SearchBoxCategorySuggestions {
        "callbackFunction"?: string;
    }
    interface IntrinsicElements {
        "search-box-category-suggestions": SearchBoxCategorySuggestions;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            /**
             * The `search-box-category-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
             */
            "search-box-category-suggestions": LocalJSX.SearchBoxCategorySuggestions & JSXBase.HTMLAttributes<HTMLSearchBoxCategorySuggestionsElement>;
        }
    }
}