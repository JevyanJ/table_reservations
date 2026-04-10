// Utilidad para verificar expiración de JWT y borrar cookie/token

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        // exp está en segundos desde epoch
        return Date.now() / 1000 > payload.exp;
    } catch {
        return true;
    }
}

export function removeToken() {
    localStorage.removeItem('token');
    // Si usas cookies, también puedes borrarlas aquí
    // document.cookie = 'token=; Max-Age=0; path=/;';
}
