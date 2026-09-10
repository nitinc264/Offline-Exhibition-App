const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function getWebRoot() {
  /*
   * Development:
   * Electron wrapper is inside:
   * CS_Direkt_Task2/desktop/Electron wrapper/
   *
   * web files are:
   * CS_Direkt_Task2/desktop/Electron wrapper/web/
   */
  if (!app.isPackaged) {
    return path.join(__dirname, "web");
  }

  /*
   * Packaged application:
   * extra files will be placed in:
   * resources/web/
   */
  return path.join(process.resourcesPath, "web");
}

function createWindow() {
  const webRoot = getWebRoot();

  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 700,

    title: "CS Direkt | Science Exhibition Explorer",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true
    }
  });

  const indexPath = path.join(webRoot, "index.html");

  console.log("[CS Direkt] Loading:");
  console.log(indexPath);

  window.loadFile(indexPath);

  window.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error(
      `[CS Direkt] Failed to load application: ${errorCode} ${errorDescription}`
    );
  });

  if (process.env.CS_DIREKT_DEVTOOLS === "1") {
    window.webContents.openDevTools();
  }
}

ipcMain.handle("load-exhibition-data", async () => {
  const dataPath = path.join(
    getWebRoot(),
    "data.json"
  );

  try {
    const raw = await fs.promises.readFile(
      dataPath,
      "utf-8"
    );

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "[CS Direkt] Could not load data.json:",
      error
    );

    throw new Error(
      `Unable to load local exhibition data: ${error.message}`
    );
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (
      BrowserWindow.getAllWindows().length === 0
    ) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});