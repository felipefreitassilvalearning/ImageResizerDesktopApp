const { contextBridge, ipcRenderer } = require('electron')
const os = require('os')
const path = require('path')
const Toastify = require('toastify-js')

contextBridge.exposeInMainWorld('os', { HOME_DIR: os.homedir() })
contextBridge.exposeInMainWorld('path', { join: path.join })
contextBridge.exposeInMainWorld('Toastify', { toast: (options) => Toastify(options).showToast() })
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
})
