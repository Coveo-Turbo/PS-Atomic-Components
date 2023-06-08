import { Bindings, initializeBindings } from "@coveo/atomic";
import { Component, Host, h, State, Element } from '@stencil/core'
const LS_KEY = 'coveo-search-queries'
import {
  loadSearchActions,
  loadSearchAnalyticsActions,
  loadQueryActions
} from "@coveo/headless";

interface Query {
  name: string
  url: string
}

@Component({
  tag: 'save-query',
  styleUrl: 'save-query.css',
  shadow: true,
})
export class SaveQuery {
  @State() private bindings?: Bindings;

  private addQueryTextInput?: HTMLInputElement
  private filterQueryTextInput?: HTMLInputElement
  @Element() private host!: Element
  @State() private modalIsOpen = false
  @State() private dropdownIsOpen = false
  @State() private queries: Query[] = []

  async connectedCallback() {
    await customElements.whenDefined('atomic-search-interface');
    this.bindings = await initializeBindings(this.host);

    this.queries = this.getQueries()
    document.body.addEventListener('click', this.handleOnOutsideClick)
  }

  addQuery = (query: Query) => {
    const newQueries = [...this.queries]
    newQueries.push(query)
    this.queries = newQueries
    this.handleModalOpen(false)
    this.saveQueries()
  }

  handleOnEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (this.addQueryTextInput && this.addQueryTextInput.value) {
        this.addQuery({
          name: this.addQueryTextInput.value,
          url: window.location.href,
        })
        this.addQueryTextInput.value = ''
      }
    }
  }

  handleModalOpen = (isOpen: boolean) => {
    this.modalIsOpen = isOpen
  }

  handleOnRemove = (queryName: string, e: MouseEvent) => {
    e.stopPropagation()
    const newQueries = this.queries.filter(({ name }) => queryName !== name)
    this.queries = [...newQueries]
  }

  saveQueries = () => {
    window.localStorage.setItem(LS_KEY, JSON.stringify(this.queries))
  }

  getQueries = () => {
    const lsQueriesJSON = window.localStorage.getItem(LS_KEY) || '[]'
    try {
      const lsQueries = JSON.parse(lsQueriesJSON)
      return lsQueries
    } catch (e) {
      console.error('Error parsing LS saved queries', e)
      return []
    }
  }

  filterQueries = () => {
    if (this.filterQueryTextInput && this.filterQueryTextInput.value) {
      const filteredQueries = this.queries.filter(({ name }) =>
        name
          .toLowerCase()
          .startsWith(this.filterQueryTextInput!.value.toLowerCase())
      )
      this.queries =
        filteredQueries && filteredQueries.length
          ? [...filteredQueries]
          : this.getQueries()
    } else {
      this.queries = this.getQueries()
    }
  }

  handleOnQueryClick = (query: string) => {
    if (!this.bindings) return;
    const engine = this.bindings.engine;
    const { executeSearch } = loadSearchActions(engine);
    const { logSearchboxSubmit } = loadSearchAnalyticsActions(engine);
    const { updateQuery } = loadQueryActions(engine);
    const action = updateQuery({q: query});

    engine.dispatch(action);
    engine.dispatch(executeSearch(logSearchboxSubmit()));
    this.handleDropdownOpen(false)
  }

  handleDropdownOpen = (isDropdownOpen: boolean) => {
    this.dropdownIsOpen = isDropdownOpen
  }

  handleOnOutsideClick = (e: MouseEvent) => {
    const { target } = e
    if (!this.host.contains(target as HTMLElement)) {
      this.handleDropdownOpen(false)
    }
  }

  render() {
    return (
      <Host>
        <button
          class={`my-queries-button ${this.dropdownIsOpen ? 'clicked' : ''}`}
          onClick={() => this.handleDropdownOpen(true)}
        >
          My Queries
        </button>
        <div
          class='saved-dropdown'
          style={{ display: this.dropdownIsOpen ? 'block' : 'none' }}
        >
          <input
            ref={(el) => (this.filterQueryTextInput = el)}
            type='text'
            placeholder='Filter queries'
            onInput={this.filterQueries}
          />
          <ul>
            {this.queries.map((query) => (
              <li onClick={() => this.handleOnQueryClick(query.name)}>
                {query.name}{' '}
                <span
                  class='close'
                  onClick={(e) => this.handleOnRemove(query.name, e)}
                >
                  &#x2715;
                </span>
              </li>
            ))}
          </ul>
          <div class='add-query' onClick={() => this.handleModalOpen(true)}>
            Add query
          </div>
        </div>
        <div
          class='modal'
          style={{ display: this.modalIsOpen ? 'block' : 'none' }}
        >
          <div class='background'></div>
          <div class='add-query-window'>
            <span class='title'>Add query</span>
            <input
              class='input'
              type='text'
              placeholder='Query name'
              onKeyDown={this.handleOnEnterKey}
              ref={(el) => (this.addQueryTextInput = el)}
            />
            <button class='close' onClick={() => this.handleModalOpen(false)}>
              &#x2715;
            </button>
          </div>
        </div>
      </Host>
    )
  }
}
