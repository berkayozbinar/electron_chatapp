// electron modüllerini ve users yerel modülünü ekleme
const electron = require("electron");
const url = require("url");
const path = require("path");
const { kullaniciKatil, kullaniciAyril, suankiKullaniciyiBul, butunKullanicilariBul } = require('./assets/users');

// express ve socket.io modüllerini ekleme
const express = require('express');
const expApp = express();
const http = require('http');
const server = http.createServer(expApp);
const { Server } = require("socket.io");
const io = new Server(server);
expApp.use(express.static('public'))

// port ayarlama ve kontrol etme
server.listen(3000, () => {
    console.log('listening on *:3000');
});

// electron uygulamasının pencere özelliklerini ayarlama
const { app, BrowserWindow, Menu } = electron;

let anaPencere;

app.on('ready', () => {
    anaPencere = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false
        }
    });

    anaPencere.loadURL(
        url.format({
            pathname: path.join(__dirname, "public/main.html"),
            protocol: "file",
            slashes: true
        })
    );

    /*
        const anaMenu = Menu.buildFromTemplate(anaMenuSablonu);
        Menu.setApplicationMenu(anaMenu);
    */

    anaPencere.setMenuBarVisibility(false)
});

/*
// electron uygulamasının sol üst kısmı
const anaMenuSablonu = [
    {
        label: "Dosya",
        submenu: [
            {
                label: "Yeni Ekle"
            },
            {
                label: "Tümünü Sil"
            },
            {
                label: "Çıkış",
                accelerator: process.platform == "win32" ? "Ctrl+Q" : "Command+Q",
                role: "quit"
            }
        ]
    },

];

if (process.platform == "win32") {
    anaMenuSablonu.unshift({
        label: app.getName(),
        role: "TODO"
    })
};

if (process.env.NODE_ENV !== "production") {
    anaMenuSablonu.push({
        label: "Dev Tools",
        submenu: [
            {
                label: "Geliştirici",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                label: "Yenile",
                role: "reload"
            }
        ]
    })
};
*/

// express localhost ile main.html dosyasına erişme
expApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/main.html'));
});

// express localhost ile chat.html dosyasına erişme
expApp.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/chat.html'));
});

// express localhost ile css dosyalarına erişme
expApp.use(express.static(__dirname + '/public'));

// bağlanma durumunda socket.io
io.on('connection', (socket) => {
    socket.on('joinRoom', ({ kullaniciAdi, oda }) => {
        const kullanici = kullaniciKatil(socket.id, kullaniciAdi, oda);

        socket.join(kullanici.oda);
        console.log('a user connected room');

        socket.broadcast.to(kullanici.oda).emit('chat message', kullanici.kullaniciAdi + ' odaya giriş yaptı.');

        io.to(kullanici.oda).emit('roomUsers', {
            oda: kullanici.oda,
            kullanicilar: butunKullanicilariBul(kullanici.oda)
        });
    });

    // mesaj gönderme durumunda socket.io
    socket.on('chat message', (msg) => {
        const kullanici = suankiKullaniciyiBul(socket.id);
        // console.log(socket.id + ': ' + msg);
        socket.to(kullanici.oda).emit('chat message', '<strong style="color: blue;">' + kullanici.kullaniciAdi + (msg));
    });

    // mesaj yazma durumunda socket.io
    socket.on('typing', () => {
        const kullanici = suankiKullaniciyiBul(socket.id);
        socket.broadcast.to(kullanici.oda).emit('typing', kullanici.kullaniciAdi)
    });

    // bağlantıyı kesme durumunda socket.io
    socket.on('disconnect', () => {
        const kullanici = kullaniciAyril(socket.id);
        if (kullanici) {
            console.log('user disconnected');
            socket.to(kullanici.oda).emit('chat message', (kullanici.kullaniciAdi + ' odadan ayrıldı.'));
            io.to(kullanici.oda).emit('roomUsers', {
                oda: kullanici.oda,
                kullanicilar: butunKullanicilariBul(kullanici.oda)
            });
        }
    });
});