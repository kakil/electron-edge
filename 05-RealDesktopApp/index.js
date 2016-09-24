const marked = require('marked');

const editor = document.querySelector('.editor textarea');
const preview = document.querySelector('.preview');
const container = document.querySelector('.container');

const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const openFileLink = document.querySelector('a.open-file');
const saveFileLink = document.querySelector('a.save-file');

const fs = require('fs')

const shell = require('electron').shell;
const showFileInFolderLink = document.querySelector('a.show-file-in-folder');

//Mac OS X open file from drag and drop on icon
const ipcRenderer = require('electron').ipcRenderer;
var currentFile = remote.getGlobal('fileToOpen') || null;

if (currentFile) {
  openFile(currentFile);
}

ipcRenderer.on('open-file', (event, filePath) => {
  openFile(filePath);
});
/////////////////


marked.setOptions({
  qfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

editor.onkeyup = generatePreview;

function generatePreview() {
  var content = editor.value;
  var html = marked(content);
  preview.innerHTML = html;
}

//Open File listener from HTML file (renderer)
openFileLink.onclick = (evt) => {

  console.log('Open Clicked!');
  dialog.showOpenDialog({
    title: 'Select a file to edit',
    filters: [
      {name: 'Markdown Documents',
        extensions: ['md', 'markdown'] }
    ]
  }, (filenames) => {
    if(!filenames) return;

    if(filenames.length > 0) {
      openFile(filenames[0]);
    }
  })
};

//Open File function
function openFile(filename) {
  var contents = fs.readFileSync(filename);

  //Mac OS X only - shows file name and path in top of app bar
  document.title = filename;
  ipcRenderer.send('set-represented-filename', filename);

  currentFile = filename;

  editor.value = contents;

  container.classList.remove('hidden');

  generatePreview();

  remote.app.addRecentDocument(filename);

}

//Save File Listener from HTML (renderer)
saveFileLink.onclick = (evt) => {

  console.log('Save Clicked');
  dialog.showSaveDialog({
    title: 'Save File',
    buttonLabel: 'Save',
    filters: [
      {name: 'Markdown Documents',
       extensions: ['md', 'markdown']}
    ]
  }, (filename) => {

    if(filename.length > 0) {
      saveFile(filename);
    }
  })
};

//Save File function
function saveFile(filename) {

  fs.writeFileSync(filename, editor.value, 'utf8');
}

//Show File in folder Listener
showFileInFolderLink.onclick = (evt) => {
  shell.showItemInFolder(currentFile);
}
