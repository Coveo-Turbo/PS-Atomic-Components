
import { Bindings, initializeBindings } from '@coveo/atomic';
import { Component, h, State, Prop, Element } from '@stencil/core';
import { 
  ResultsPerPage,
  buildResultsPerPage,
  ResultsPerPageState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  Unsubscribe
      } from '@coveo/headless';


@Component({
  tag: 'custom-per-page',
  styleUrl: 'custom-per-page.css',
  shadow: true,
})


export class CustomPerPage{

  @Element() private host!: Element;
  private bindings?: Bindings;
  // @ts-ignore
  private error?: Error;
  private resultPerPage!: ResultsPerPage;
  public searchStatus!: SearchStatus;
  private choices!: number[];
  // @ts-ignore
  @State() private resultPerPageState!: ResultsPerPageState;
  @State() private searchStatusState!: SearchStatusState;
  
  @Prop({reflect: true}) choicesDisplayed!: string;
  @Prop({mutable: true, reflect: true}) initialChoice?: number;

  @State() currentChoice!: string;

  private statusUnsubscribe: Unsubscribe = () => {};
  private perPageUnsubscribe: Unsubscribe = () => {};

  public async connectedCallback(){
    try{
    this.bindings = await initializeBindings(this.host);
    const statusController = buildSearchStatus(this.bindings.engine);

    this.choices = this.validateChoicesDisplayed();
    this.validateInitialChoice();

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.resultPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.initialChoice},
    });

    this.statusUnsubscribe = statusController.subscribe(
      () => (this.searchStatusState = statusController.state)
    );
    
    this.perPageUnsubscribe = this.resultPerPage.subscribe(
      () => (this.resultPerPageState = this.resultPerPage.state)
    );
    } catch(error){
      console.error(error);
      this.error = error as Error;
    }

  }

  public disconnectedCallback() {
    this.perPageUnsubscribe();
    this.statusUnsubscribe();
  }

  private validateChoicesDisplayed() {
    if(!this.choicesDisplayed) {
      const errorMsg = `The choicesDisplayed options is not set or empty, it should be a number or list of number separated by commas`;
      this.bindings?.engine.logger.error(errorMsg, this);
      throw new Error(errorMsg);
    }
    return this.choicesDisplayed.split(',').map((choice) => {
      const parsedChoice = parseInt(choice.trim());
      if (isNaN(parsedChoice)) {
        const errorMsg = `The choice value "${choice}" from the "choicesDisplayed" option is not a number.`;
        this.bindings?.engine.logger.error(errorMsg, this);
        throw new Error(errorMsg);
      }

      return parsedChoice;
    });
  }

  private validateInitialChoice() {
    if (!this.initialChoice) {
      this.initialChoice = this.choices[0];
      return;
    }
    if (!this.choices.includes(this.initialChoice)) {
      const errorMsg = `The "initialChoice" option value "${this.initialChoice}" is not included in the "choicesDisplayed" option "${this.choicesDisplayed}".`;
      this.bindings?.engine.logger.error(errorMsg, this);
      throw new Error(errorMsg);
    }
  }

  private buildChoice(choice: number){
    const isSelected = this.resultPerPage.isSetTo(choice);

    return (
      <option value={choice} selected={isSelected}>{choice}</option>
    );
  }

  private onChoiceClick(e: Event){
    if (
      !this.bindings || !this.searchStatusState.hasResults
    ) {
      return;
    }
    this.currentChoice = (e.target as HTMLSelectElement).value;
    if(!this.currentChoice) return;
    let choice = Number(this.currentChoice);
    console.log(choice);
    this.resultPerPage.set(choice);
  }

  atomicIcon() {
    return (
        <div part="select-separator" class="seperator"><atomic-icon class="w-2.5 hydrated" icon="<svg viewBox=&quot;0 0 12.6 7.2&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><path d=&quot;m11.421 7.04c-.3 0-.5-.1-.7-.3l-4.6-4.6-4.6 4.6c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l5.2-5.2c.4-.4 1.2-.4 1.6 0l5.2 5.2c.4.4.4 1 0 1.4-.2.2-.4.3-.7.3&quot; transform=&quot;matrix(-1 0 0 -1 12.366 7.086)&quot;/></svg>"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.6 7.2"><path transform="matrix(-1 0 0 -1 12.366 7.086)" d="m11.421 7.04c-.3 0-.5-.1-.7-.3l-4.6-4.6-4.6 4.6c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l5.2-5.2c.4-.4 1.2-.4 1.6 0l5.2 5.2c.4.4.4 1 0 1.4-.2.2-.4.3-.7.3"></path></svg></atomic-icon></div>
    )
  }

  render() {
    if (
      !this.bindings || !this.searchStatusState.hasResults
    ) {
      return;
    }
    return (
      <div class="relative">
        <label part="label">{this.bindings?.i18n.t("results-per-page")}</label>
        <div class="wrapper">
          <select id="paginator" part="select" onChange={(e) => this.onChoiceClick(e)}>
              {this.choices.map((choice) => this.buildChoice(choice))}
          </select>
          {this.atomicIcon()}
        </div>
      </div>
    )
  }
}
