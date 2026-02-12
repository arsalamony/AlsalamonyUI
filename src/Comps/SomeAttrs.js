/* ================== helpers & styles ================== */

export const cardSx = {
    bgcolor: "#0b1220",
    border: "1px solid #1e293b",
    borderRadius: 3,
    boxShadow: "none",
};


export const chipSx = {
    bgcolor: "rgba(148,163,184,0.10)",
    border: "1px solid rgba(148,163,184,0.20)",
    color: "#e5e7eb",
    fontWeight: 700,
};

export const notesBoxSx = {
    p: 2,
    borderRadius: 2,
    bgcolor: "rgba(148,163,184,0.06)",
    border: "1px solid rgba(148,163,184,0.18)",
    color: "#e5e7eb",
    lineHeight: 1.8,
    minHeight: 70,
};

export const dialogPaperSx = {
    direction: "rtl",
    bgcolor: "#0b1220",
    border: "1px solid #1e293b",
    borderRadius: 3,
    boxShadow: "none",
};

export const closeBtnSx = {
    color: "text.secondary",
    bgcolor: "rgba(148,163,184,0.06)",
    border: "1px solid rgba(148,163,184,0.12)",
    "&:hover": { bgcolor: "rgba(148,163,184,0.10)" },
};

export const btnOutlineSx = {
    borderColor: "rgba(148,163,184,0.25)",
    color: "#e5e7eb",
    borderRadius: 2,
    "&:hover": { borderColor: "rgba(56,189,248,0.35)" },
};

export const tableScrollSx = {
    "&::-webkit-scrollbar": { height: "6px" },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(148,163,184,0.28)",
        borderRadius: "10px",
    },
};

export const inputSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(148,163,184,0.06)",
        borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(148,163,184,0.22)",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(56,189,248,0.35)",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(56,189,248,0.55)",
    },
};

export function remainingChipSx(remaining) {
    const r = Number(remaining ?? 0);

    if (r >= 500) {
        return {
            color: "#fecaca",
            bgcolor: "rgba(239,68,68,0.18)",
            border: "1px solid rgba(239,68,68,0.35)",
            fontWeight: 800,
        };
    }

    if (r >= 200) {
        return {
            color: "#fde68a",
            bgcolor: "rgba(245,158,11,0.16)",
            border: "1px solid rgba(245,158,11,0.35)",
            fontWeight: 800,
        };
    }

    return {
        color: "#a7f3d0",
        bgcolor: "rgba(34,197,94,0.14)",
        border: "1px solid rgba(34,197,94,0.30)",
        fontWeight: 800,
    };
}


export const thSx = { color: "text.secondary", fontWeight: 700 };

export const iconBoxSx = {
    width: 44,
    height: 44,
    borderRadius: 2,
    display: "grid",
    placeItems: "center",
    bgcolor: "rgba(56,189,248,0.12)",
    border: "1px solid rgba(56,189,248,0.25)",
};

export const selectSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(148,163,184,0.06)",
        borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(148,163,184,0.22)",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(56,189,248,0.35)",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(56,189,248,0.55)",
    },
};

export const okChipSx = {
    bgcolor: "rgba(34,197,94,0.15)",
    color: "#22c55e",
    border: "1px solid rgba(34,197,94,0.35)",
    fontWeight: 800,
};

export const badChipSx = {
    bgcolor: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.35)",
    fontWeight: 800,
};

export const actionBtnSx = {
    color: "#e5e7eb",
    bgcolor: "rgba(148,163,184,0.10)",
    border: "1px solid rgba(148,163,184,0.20)",
    "&:hover": { bgcolor: "rgba(56,189,248,0.12)" },
};

export const errorBoxSx = {
    p: 2,
    borderRadius: 2,
    border: "1px solid rgba(239,68,68,0.35)",
    bgcolor: "rgba(239,68,68,0.10)",
};

export const primaryBtnSx = {
    borderRadius: 2,
    fontWeight: 800,
    bgcolor: "rgba(56,189,248,0.18)",
    border: "1px solid rgba(56,189,248,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(56,189,248,0.26)" },
    "&.Mui-disabled": {
        opacity: 0.6,
        color: "#e5e7eb",
    },
};

export const actionPrimaryBtnSx = {
    justifyContent: "space-between",
    borderRadius: 2,
    py: 1.2,
    bgcolor: "rgba(56,189,248,0.16)",
    border: "1px solid rgba(56,189,248,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(56,189,248,0.24)" },
    textTransform: "none",
    fontWeight: 800,
};

export const actionSuccessBtnSx = {
    justifyContent: "space-between",
    borderRadius: 2,
    py: 1.2,
    bgcolor: "rgba(34,197,94,0.16)",
    border: "1px solid rgba(34,197,94,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(34,197,94,0.24)" },
    textTransform: "none",
    fontWeight: 800,
};

export const btnSaveSx = {
    borderRadius: 2,
    fontWeight: 900,
    bgcolor: "rgba(56,189,248,0.18)",
    border: "1px solid rgba(56,189,248,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(56,189,248,0.26)" },
    "&.Mui-disabled": {
        opacity: 0.6,
        color: "#e5e7eb",
        bgcolor: "rgba(148,163,184,0.10)",
        border: "1px solid rgba(148,163,184,0.18)",
    },
};


export const successBtnSx = {
    borderRadius: 2,
    fontWeight: 800,
    bgcolor: "rgba(34,197,94,0.16)",
    border: "1px solid rgba(34,197,94,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(34,197,94,0.24)" },
    "&.Mui-disabled": { opacity: 0.6, color: "#e5e7eb" },
};

export const dangerBtnSx = {
    borderRadius: 2,
    fontWeight: 800,
    bgcolor: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(239,68,68,0.26)" },
    "&.Mui-disabled": { opacity: 0.6, color: "#e5e7eb" },
};

export const chipCollectSx = {
    bgcolor: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.28)",
    color: "#a7f3d0",
    fontWeight: 800,
};

export const chipDeductSx = {
    bgcolor: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.28)",
    color: "#fecaca",
    fontWeight: 800,
};

export const btnPrimarySx = {
    borderRadius: 2,
    fontWeight: 800,
    bgcolor: "rgba(56,189,248,0.18)",
    border: "1px solid rgba(56,189,248,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(56,189,248,0.26)" },
};

export const btnAdminSx = {
    borderRadius: 2,
    fontWeight: 700,
    borderColor: "rgba(245,158,11,0.40)",
    color: "#fde68a",
    "&:hover": {
        borderColor: "rgba(245,158,11,0.60)",
        bgcolor: "rgba(245,158,11,0.08)",
    },
};

export const infoBtnSx = {
    color: "#38bdf8",
    bgcolor: "rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.22)",
    "&:hover": { bgcolor: "rgba(56,189,248,0.18)" },
};

export const moreBtnSx = {
    color: "#e5e7eb",
    bgcolor: "rgba(148,163,184,0.10)",
    border: "1px solid rgba(148,163,184,0.20)",
    "&:hover": { bgcolor: "rgba(56,189,248,0.12)" },
};


export function amountChipSx(p) {
    if (p.added && p.paymentMethod === "كاش") {
        return {
            color: "#a7f3d0",
            bgcolor: "rgba(34,197,94,0.14)",
            border: "1px solid rgba(34,197,94,0.30)",
            fontWeight: 900,
        };
    }
    if (p.added) {
        return {
            color: "#e5e7eb",
            bgcolor: "rgba(56,189,248,0.12)",
            border: "1px solid rgba(56,189,248,0.25)",
            fontWeight: 900,
        };
    }
    return {
        color: "#fecaca",
        bgcolor: "rgba(239,68,68,0.14)",
        border: "1px solid rgba(239,68,68,0.28)",
        fontWeight: 900,
    };
}

export function summaryToneSx(tone) {
    if (tone === "success") {
        return {
            iconBox: toneIcon(
                "rgba(34,197,94,0.14)",
                "rgba(34,197,94,0.28)",
                "#a7f3d0",
            ),
        };
    }
    if (tone === "danger") {
        return {
            iconBox: toneIcon(
                "rgba(239,68,68,0.14)",
                "rgba(239,68,68,0.28)",
                "#fecaca",
            ),
        };
    }
    if (tone === "cash") {
        return {
            iconBox: toneIcon(
                "rgba(56,189,248,0.12)",
                "rgba(56,189,248,0.25)",
                "#e5e7eb",
            ),
        };
    }
    return {
        iconBox: toneIcon(
            "rgba(148,163,184,0.10)",
            "rgba(148,163,184,0.20)",
            "#e5e7eb",
        ),
    };
}

export function toneIcon(bg, border, color) {
    return {
        width: 42,
        height: 42,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        bgcolor: bg,
        border: `1px solid ${border}`,
        color,
    };
}


