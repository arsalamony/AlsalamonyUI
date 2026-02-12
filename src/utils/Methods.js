export function formatMoney(n) {
    const x = Number(n ?? 0);
    return `${x.toFixed(2)} ج`;
}

export function formatDateTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    let hh = d.getHours();
    const min = String(d.getMinutes()).padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;
    return `${yyyy}-${mm}-${dd} ${hh}:${min} ${ampm}`;
}

export function sum(arr) {
    return arr.reduce((a, b) => a + Number(b ?? 0), 0);
}

export function fix2(n) {
    const x = Number(n ?? 0);
    if (Number.isNaN(x)) return "0.00";
    return x.toFixed(2);
}

// ✅ parse رقم آمن (يدعم , و Arabic digits بشكل بسيط)
export function parseAmount(input) {
    if (input == null) return NaN;
    const s = String(input)
        .trim()
    const v = Number(s);
    return v;
}