import { ScreenSyncPage } from './app.po';

describe('screen-sync App', function() {
  let page: ScreenSyncPage;

  beforeEach(() => {
    page = new ScreenSyncPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
