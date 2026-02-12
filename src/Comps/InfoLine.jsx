

/* ================== small components ================== */

import { Box, Typography } from "@mui/material";

export default function InfoLine({ label, value, highlight }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(148,163,184,0.06)",
                border: highlight
                    ? "1px solid rgba(239,68,68,0.25)"
                    : "1px solid rgba(148,163,184,0.18)",
            }}
        >
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                {label}
            </Typography>
            <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
        </Box>
    );
}
