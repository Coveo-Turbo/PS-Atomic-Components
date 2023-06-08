import { Bindings, initializeBindings } from '@coveo/atomic'
import { Result } from '@coveo/headless'
import { Component, Host, h, Element } from '@stencil/core'

@Component({
  tag: 'export-search-results',
  styleUrl: 'export-search-results.css',
  shadow: true,
})
export class ExportSearchResults {
  private bindings?: Bindings
  private results?: Result[]

  @Element() private host!: Element

  async connectedCallback() {
    await customElements.whenDefined('atomic-search-interface');
    this.bindings = await initializeBindings(this.host)
    this.bindings.engine.subscribe(() => {
      if (!this.bindings) return
      this.results = this.bindings.engine.state.search.results
    })
  }

  downloadCsv = (content: string) => {
    const contentType = 'text/csv;charset=utf-8,'
    const a = document.createElement('a')
    const blob = new Blob(["\uFEFF"+content], { type: contentType })
    a.href = window.URL.createObjectURL(blob)
    a.download = `search_results_${new Date().getTime()}`
    a.click()
  }

  handleOnDownload = () => {
    const csvResults = jsonToCsv(this.results)
    this.downloadCsv(csvResults)
  }

  render() {
    return (
      <Host onClick={this.handleOnDownload}>
        <div class='icon'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'>
            <path d='M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z' />
          </svg>
        </div>
        <div class='label'>Export Results</div>
      </Host>
    )
  }
}

function jsonToCsv (items: any) {
  console.log(items)
  const header = Object.keys(items[0])
  const headerString = header.join(',')

  // handle null or undefined values here
  const replacer = (_key: string, value: string) => value ?? ''

  const rowItems = items.map((row: { [key: string]: string }) =>
    header.map((fieldName: string) => JSON.stringify(row[fieldName], replacer)).join(',')
  )
  
  // join header and body, and break into separate lines
  const csv = [headerString, ...rowItems].join('\r\n')

  return csv
}
