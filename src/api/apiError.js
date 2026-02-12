export function getErrorMessage(err) {
    return (
        err?.response?.data?.message ??
        err?.response?.data?.title ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "حدث خطأ"
    );
}
