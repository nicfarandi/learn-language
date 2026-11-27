import appJson from '../app.json';
import packageJson from '../package.json';
import { CURRENT_RELEASE, RELEASES } from '../src/releases';

it('patch notes lead with the version the app is built as', () => {
  expect(CURRENT_RELEASE).toBe(RELEASES[0]);
  expect(appJson.expo.version).toBe(CURRENT_RELEASE.version);
  expect(packageJson.version).toBe(CURRENT_RELEASE.version);
});
