const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile(path.join(__dirname, '../dist/index.html'))
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowPrerelease = false

  autoUpdater.on('update-available', () => {
    console.log('Update available. Downloading...')
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded. Installing on next app restart.')

    if (win && !win.isDestroyed()) {
      dialog.showMessageBox(win, {
        type: 'info',
        title: 'تحديث جديد',
        message: 'تم تحميل تحديث جديد للتطبيق.',
        detail: 'سيتم تثبيت التحديث عند إغلاق التطبيق وفتحه مرة أخرى.',
        buttons: ['حسنًا']
      })
    }
  })

  autoUpdater.on('error', (error) => {
    console.error('Auto update error:', error)
  })

  autoUpdater.checkForUpdates().catch((error) => {
    console.error('Update check failed:', error)
  })
}

app.whenReady().then(() => {
  createWindow()

  if (!app.isPackaged) {
    console.log('Development mode: auto update disabled.')
    return
  }

  setupAutoUpdater()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
