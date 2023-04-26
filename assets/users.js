const kullanicilar = [];

// kullanıcıyı chat'e ekleme
function kullaniciKatil(id, kullaniciAdi, oda) {
    const kullanici = { id, kullaniciAdi, oda };

    kullanicilar.push(kullanici);
    return kullanici;
}

// kullanıcıyı chat'ten çıkarma
function kullaniciAyril(id) {
    const index = kullanicilar.findIndex(kullanici => kullanici.id === id);

    if (index !== -1) {
        return kullanicilar.splice(index, 1)[0];
    }
}

// şuanki kullanıcıyı çekme
function suankiKullaniciyiBul(id) {
    return kullanicilar.find(kullanici => kullanici.id === id);
}

// bütün kullanıcıları çekme 
function butunKullanicilariBul(oda) {
    return kullanicilar.filter(kullanici => kullanici.oda === oda);
}

module.exports = {
    kullaniciKatil,
    kullaniciAyril,
    suankiKullaniciyiBul,
    butunKullanicilariBul
}
