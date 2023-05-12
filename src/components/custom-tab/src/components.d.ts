/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface CustomTab {
        "excludedFacets": string;
        "expression": string;
        "isActive": boolean;
        "label": string;
    }
}
declare global {
    interface HTMLCustomTabElement extends Components.CustomTab, HTMLStencilElement {
    }
    var HTMLCustomTabElement: {
        prototype: HTMLCustomTabElement;
        new (): HTMLCustomTabElement;
    };
    interface HTMLElementTagNameMap {
        "custom-tab": HTMLCustomTabElement;
    }
}
declare namespace LocalJSX {
    interface CustomTab {
        "excludedFacets": string;
        "expression": string;
        "isActive": boolean;
        "label": string;
    }
    interface IntrinsicElements {
        "custom-tab": CustomTab;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "custom-tab": LocalJSX.CustomTab & JSXBase.HTMLAttributes<HTMLCustomTabElement>;
        }
    }
}
