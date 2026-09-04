(function () {
    const _0xsec = {
        _k: atob("QUl6YVN5QjI1VmFFckpFc0kzVkxCZWI1MmNwY3pLUk1FV0M0ZkVz"),
        _d: atob("cGFrLWVhcm5pbmctc2l0ZS5maXJlYmFzZWFwcC5jb20="),
        _p: atob("cGFrLWVhcm5pbmctc2l0ZQ=="),
        _b: atob("cGFrLWVhcm5pbmctc2l0ZS5maXJlYmFzZXN0b3JhZ2UuYXBw"),
        _m: atob("ODMwNjcxMzg5NzA2"),
        _a: atob("MToxODMwNjcxMzg5NzA2OndlYjoxNmFiNTU1ZmZkZDg1Y2ZmNzBjYmYz")
    };

    const _cfg = {
        apiKey: _0xsec._k,
        authDomain: _0xsec._d,
        projectId: _0xsec._p,
        storageBucket: _0xsec._b,
        messagingSenderId: _0xsec._m,
        appId: _0xsec._a
    };

    try {
        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(_cfg);
        }

        window.db = firebase.firestore();
        
        window.db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
            merge: true
        });
        
    } catch (e) {
        console.error("Secure Data link initialization error:", e);
    }
})();
