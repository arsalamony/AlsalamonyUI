import { Card, CardContent, Stack, Box, Typography } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import { summaryToneSx, cardSx } from "./SomeAttrs";

export default function SummaryCard({ title, value, tone }) {
    const s = summaryToneSx(tone);
    return (
        <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={s.iconBox}>
                        <PaymentsIcon />
                    </Box>
                    <Box>
                        <Typography
                            sx={{ color: "text.secondary", fontSize: 12 }}
                        >
                            {title}
                        </Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                            {value}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
