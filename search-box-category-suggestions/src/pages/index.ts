import type {} from '@coveo/atomic';

async function main() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;
  await searchInterface.initialize({
    organizationId: 'testorganizationhk7cdfmw',
    accessToken: 'xx428d89ef-2982-4338-8250-fadeb13610b9',
  });

  searchInterface.executeFirstSearch();
}

export default main;
