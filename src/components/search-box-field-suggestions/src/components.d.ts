/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    /**
     * The `search-box-field-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface SearchBoxFieldSuggestions {
        "callbackFunction": string;
        "field": string;
    }
}
declare global {
    /**
     * The `search-box-field-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface HTMLSearchBoxFieldSuggestionsElement extends Components.SearchBoxFieldSuggestions, HTMLStencilElement {
    }
    var HTMLSearchBoxFieldSuggestionsElement: {
        prototype: HTMLSearchBoxFieldSuggestionsElement;
        new (): HTMLSearchBoxFieldSuggestionsElement;
    };
    interface HTMLElementTagNameMap {
        "search-box-field-suggestions": HTMLSearchBoxFieldSuggestionsElement;
    }
}
declare namespace LocalJSX {
    /**
     * The `search-box-field-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
     */
    interface SearchBoxFieldSuggestions {
        "callbackFunction": string;
        "field": string;
    }
    interface IntrinsicElements {
        "search-box-field-suggestions": SearchBoxFieldSuggestions;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            /**
             * The `search-box-field-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of category suggestions.
             */
            "search-box-field-suggestions": LocalJSX.SearchBoxFieldSuggestions & JSXBase.HTMLAttributes<HTMLSearchBoxFieldSuggestionsElement>;
        }
    }
}