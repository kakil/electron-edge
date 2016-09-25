const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

var mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({

    width: 800,
    height: 600,
    titleBarStyle: 'hidden'
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('restored');
  });

});

//For Mac OS X - open file by drag and drop on icon
global.fileToOpen = null;

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  fileToOpen = filePath;

  if(mainWindow){
    mainWindow.send('open-file', filePath);
  }
});

ipcMain.on('set-represented-filename', (event, filename) => {
  mainWindow.setRepresentedFilename(filename);
});

ipcMain.on('main-window', (event, windowActionName) => {
  if(windowActionName === 'restore') {
    mainWindow.unmaximize();
  }else {
    mainWindow[windowActionName]();
  }
})
