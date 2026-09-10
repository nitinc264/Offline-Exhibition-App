const {
  contextBridge,
  ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
  "electronAPI",
  {
    loadExhibitionData: () =>
      ipcRenderer.invoke(
        "load-exhibition-data"
      )
  }
);