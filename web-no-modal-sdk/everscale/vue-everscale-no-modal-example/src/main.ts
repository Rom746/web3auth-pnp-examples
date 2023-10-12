import { createApp } from "vue";
import {TonClient} from "@eversdk/core";
import {libWeb, libWebSetup} from "@eversdk/lib-web";
import App from "./App.vue";

// Disable separate worker
libWebSetup({
    disableSeparateWorker: true,
});

TonClient.useBinaryLibrary(libWeb as any);

createApp(App).mount("#app");
