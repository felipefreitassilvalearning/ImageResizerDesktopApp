const fs = require('fs')
const os = require('os')
const path = require('path')
const resizeImg = require('resize-img')
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

let mainWindow

function createMainWindow () {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300,
    })

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}

app.whenReady().then(() => {
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(buildMenu())
    Menu.setApplicationMenu(mainMenu)

    mainWindow.on('close', () => (mainWindow = null))

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
})

function buildMenu() {
    const menu = []
    const aboutTab = {
        label: 'About',
        click: createAboutWindow
    }

    if (isMac) {
        menu.push({
            label: app.name,
            submenu: [aboutTab]
        })
    }
    menu.push({
        role: 'fileMenu',
        submenu: [
            {
                label: 'Quit',
                accelerator: isMac ? 'Command+W' : 'Ctrl+W',
                click: () => app.quit()
            }
        ]
    })
    if (!isMac) {
        menu.push({
            label: 'Help',
            submenu: [aboutTab]
        })
    }
    return menu
}

ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage({
        ...options,
        width: parseInt(options.width),
        height: parseInt(options.height)
    })
})

async function resizeImage({ imgPath, width, height, dest }) {
    try {
        const newImage = await resizeImg(fs.readFileSync(imgPath), { width, height })

        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }

        let filename = path.basename(imgPath)
        for (let i = 0; fs.existsSync(path.join(dest, filename)); i++) {
            filename = `${i}_${path.basename(imgPath)}`
        }
        fs.writeFileSync(path.join(dest, filename), newImage)

        mainWindow.webContents.send('image:done', {
            dest,
            filename
        })

        // Show image on file explorer
        shell.openPath(dest)
    } catch (error) {
        console.log("TODO: Implement")
    }
}

app.on('window-all-closed', function () {
    if (!isMac) {
        app.quit()
    }
})
