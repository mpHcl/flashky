"use client";
import { checkAuthenticated, useAuth } from "@/app/(auth)/context/AuthContext";
import { Box, FormControl, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, Stack, TextField, Tooltip } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Pagination from "@/app/components/Pagination";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { User } from "./lib/types";
import { getUsers } from "./lib/fetch";
import { userCardHeaderAction } from "./lib/functions";

const pageSize = 10;
const MAX_PREVIEW = 100;

export default function Users() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [usernameFilter, setUsernameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "moderator" | "user">("all");

  const [users, setUsers] = useState<User[]>();
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }
    
    getUsers(setUsers, page, setTotal, pageSize, usernameFilter, statusFilter, roleFilter);
  }, [isAuthenticated, getUsers, page, usernameFilter, statusFilter, roleFilter]);

  const viewOnClick = (id: number) => {
    router.push("/users/" + id);
  }

  return ( 
    users &&
    <Stack>
      <Box display="flex" justifyContent="center" alignItems="flex-end" gap={5} mb={3}>
        <TextField label="Username" value={usernameFilter} size="small" slotProps={{ inputLabel: { shrink: true }}}
          onChange={(e) => {
            setPage(0);
            setUsernameFilter(e.target.value);
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter}
            onChange={(e) => {
              setPage(0);
              setStatusFilter(e.target.value as any);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={roleFilter}
            onChange={(e) => {
              setPage(0);
              setRoleFilter(e.target.value as any);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ width: '60%', bgcolor: 'background.card', margin: "auto" }}>
        <List>
          {users.map((el, index) =>
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
                {userCardHeaderAction(el)}
              </ListItemIcon>
              <ListItemText primary={`${el.username}`} secondary={el.email.length > MAX_PREVIEW ? el.email.substring(0, MAX_PREVIEW) + "..." : el.email} />
            </ListItem>
          )}
        </List>
      </Box>
      {total > pageSize &&
      <Box width="20%" margin="auto">
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