export function saveAuth(authResponse) {
    // يدعم PascalCase أو camelCase
    const token = authResponse.Token ?? authResponse.token;
    const userId = authResponse.UserId ?? authResponse.userId;
    const role = authResponse.Role ?? authResponse.role;
    const name = authResponse.Name ?? authResponse.name;

    if (!token) throw new Error("Token missing from AuthResponse");

    localStorage.setItem("token", token);
    localStorage.setItem("userId", String(userId ?? ""));
    localStorage.setItem("role", String(role ?? ""));
    localStorage.setItem("name", String(name ?? ""));
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
}

export function isLoggedIn() {
    return Boolean(localStorage.getItem("token"));
}
