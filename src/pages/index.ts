import type {} from '@coveo/atomic';

async function main() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;
  await searchInterface.initialize({
    organizationId: 'barcagroupproductionkwvdy6lp',
    accessToken: 'xx5a7943ef-ea52-42e5-8742-51198cc651f7',
  });

  searchInterface.executeFirstSearch();
}

export default main;
