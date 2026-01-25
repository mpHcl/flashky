"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Typography, Stack, Chip, Divider, Button, Select, MenuItem, FormControl, InputLabel, Box, } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { fetchGetReport, fetchSetVerdict } from "../lib/fetch";
import Link from "next/link";
import { reportCardHeaderAction } from "../lib/functions";
import { ReportType } from "../lib/types";
import { checkAuthenticated, useAuth } from "@/app/(auth)/context/AuthContext";

export default function ReportDetails() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = Number(params.id);
  const [report, setReport] = useState<ReportType>();
  const [verdict, setVerdict] = useState<string>("");
  const [deckId, setDeckId] = useState<number>();

  const loadReport = () => {
    fetchGetReport(setReport, setDeckId, reportId);
  }

  useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }

    loadReport();
  }, [isAuthenticated]);

  const submitVerdict = () => {
    fetchSetVerdict(verdict, reportId, setReport);
  };

  return (
    report &&
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 4, mb: 4 }}>
      <Card sx={{ maxWidth: 700, minWidth: 600, mx: "auto" }}>
        <CardHeader
          title={`${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report #${report.id}`}
          subheader={new Date(report.creation_date).toLocaleString()}
          action={reportCardHeaderAction(report)}
        />

        <CardContent>
          <Stack spacing={2}>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1">Description</Typography>
              <Typography>{report.description}</Typography>
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1">Related entities</Typography>

              {report.deck_id && (
                <Chip
                  label={`Deck #${report.deck_id}`}
                  component={Link}
                  href={`/decks/${report.deck_id}`}
                  clickable
                  variant="outlined"
                  size="medium"
                />
              )}

              {report.flashcard_id && (
                <Chip
                  label={`Flashcard #${report.flashcard_id}`}
                  component={Link}
                  href={`/flashcards/${report.flashcard_id}`}
                  clickable
                  variant="outlined"
                  size="medium"
                />
              )}

              {report.comment_id && (
                <Chip
                  label={`Comment #${report.comment_id}`}
                  component={Link}
                  href={`/decks/${deckId}`}
                  clickable
                  variant="outlined"
                  size="medium"
                />
              )}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1">Related Users</Typography>

              <Chip
                label={`Report Owner #${report.reporter_id}`}
                component={Link}
                href={`/users/${report.reporter_id}`}
                clickable
                variant="outlined"
                size="medium"
              />

              {report.reported_user_id && (
                <Chip
                  label={`Reported User #${report.reported_user_id}`}
                  component={Link}
                  href={`/users/${report.reported_user_id}`}
                  clickable
                  variant="outlined"
                  size="medium"
                />
              )}

              {report.moderator_id && (
                <Chip
                  label={`Moderator #${report.moderator_id}`}
                  component={Link}
                  href={`/users/${report.moderator_id}`}
                  clickable
                  variant="outlined"
                  size="medium"
                />
              )}
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="verdict-label">Verdict</InputLabel>
                <Select
                  labelId="verdict-label"
                  value={verdict}
                  label="Verdict"
                  onChange={(e) => setVerdict(e.target.value as string)}
                >
                  <MenuItem key={"violation"} value={"violation"}>
                    Violation
                  </MenuItem>
                  <MenuItem key={"non-violation"} value={"no-violation"}>
                    No-violation
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={submitVerdict}
                disabled={!verdict}
              >
                Set verdict
              </Button>
            </Stack>

            {report.resolution_date && (
              <Typography variant="caption" color="text.secondary">
                Resolved on {new Date(report.resolution_date).toLocaleString()}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
