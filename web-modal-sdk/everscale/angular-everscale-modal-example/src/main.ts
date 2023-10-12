import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import { TonClient } from "@eversdk/core";
import { libWebSetup, libWeb } from "@eversdk/lib-web";

if (environment.production) {
  enableProdMode();
}

//Look at the TonClient initialization documentation for Configure EeverSDK.md file

libWebSetup({
  disableSeparateWorker: true,
});

TonClient.useBinaryLibrary(libWeb as any);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
