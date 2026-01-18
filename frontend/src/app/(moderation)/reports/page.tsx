"use client";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Pagination from '@/app/components/Pagination';
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText, Stack, Tooltip } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { fetchGetReports } from "./lib/fetch";
import { reportCardHeaderAction } from "./lib/functions";
import { ReportType } from './lib/types';
import { checkAuthenticated, useAuth } from '@/app/(auth)/context/AuthContext';


const pageSize = 10;
const MAX_PREVIEW = 100;

export default function Users() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [reports, setReports] = useState<ReportType[]>();

  useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }

    fetchGetReports(setReports, page, setTotal, pageSize);
  }, [fetchGetReports, isAuthenticated, page]);

  const viewOnClick = (id: number) => {
    router.push("/reports/" + id);
  }

  return ( 
    reports &&
    <Stack>
      <Box sx={{ width: '90%', bgcolor: 'background.card', margin: "auto" }}>
        <List>
          {reports.map((el, index) =>
            <ListItem key={el.id} secondaryAction={
              <div>
                <Tooltip title="View details" placement="bottom" disableInteractive>
                  <IconButton edge="end" aria-label="view" onClick={() => { viewOnClick(el.id); }}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </div>
            } sx={[index % 2 == 0 ? { bgcolor: 'rgba(127, 127, 127, 0.2)' } : { bgcolor: null }]}>
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                {reportCardHeaderAction(el)}
              </ListItemIcon>
              <ListItemText primary={`${el.creation_date.split("T")[0]} ${el.creation_date.split("T")[1].split(":")[0]}:${el.creation_date.split("T")[1].split(":")[1]}`} secondary={el.description.length > MAX_PREVIEW ? el.description.substring(0, MAX_PREVIEW) + "..." : el.description} />
            </ListItem>
          )}
        </List>
      </Box>
      {total > pageSize &&
      <Box width="30%" margin="auto">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          setPage={setPage}
        />
      </Box>}
    </Stack>
  )
}