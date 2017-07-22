// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  protocol: 'http://',
  assetRoot: "/assets/",
  url: '127.0.0.1:4200',
  root: "/",
  apiUrl: "http://dev.edushifts.world:8000/",
  googleGeoBaseURL: "https://maps.googleapis.com/maps/api/geocode/json?address=",
  googleGeoAPI: "AIzaSyBIlZDx8WDIhKeXZMIN-3wrltWoLmo_VXc",
  tokenRefresh: 300000,
  showHoldersFrontpage: true
};
