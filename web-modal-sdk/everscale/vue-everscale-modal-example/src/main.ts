import { createApp } from "vue";
import {TonClient} from "@eversdk/core";
import {libWeb, libWebSetup} from "@eversdk/lib-web";
import App from "./App.vue";

//Look at the TonClient initialization documentation for Configure EeverSDK.md file

libWebSetup({
    disableSeparateWorker: true,
});

TonClient.useBinaryLibrary(libWeb as any);

createApp(App).mount("#app");
