"use client";
import { RawCrudList } from "@/app/components/crudlist";
import Pagination from "@/app/components/Pagination";
import { Box, Stack } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { getUsers } from "./lib/fetch";
import { User } from "./lib/types";
import { checkAuthenticated, useAuth } from "@/app/(auth)/context/AuthContext";


export const pageSize = 10;

export default function Users() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<User[]>();
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }
    
    getUsers(setData, page, setTotal, pageSize);
  }, [isAuthenticated, getUsers, page]);

  const viewOnClick = (id: number) => {
    router.push("/users/" + id);
  }

  return ( 
    data &&
    <Stack>
      <RawCrudList
        data={data.map((el: User) => {
          return { "id": el.id, "name": el.username, "preview": el.email}
        })}
        showUpdateBtn={false}
        showDeleteBtn={false}
        showSaveBtn={false}
        viewOnClick={viewOnClick}
        
        deleteOnClick={() => { }}
        editOnClick={() => { }}
        saveOnClick={() => { }}
      />
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