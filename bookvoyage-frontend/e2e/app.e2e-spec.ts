import { BookvoyagePage } from './app.po';

describe('bookvoyage App', () => {
  let page: BookvoyagePage;

  beforeEach(() => {
    page = new BookvoyagePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
