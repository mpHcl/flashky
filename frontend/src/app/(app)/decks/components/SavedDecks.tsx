import { RawCrudList } from "@/app/components/crudlist";
import Pagination from "@/app/components/Pagination";
import { Deck } from "@/app/lib/types";
import { Box, Stack } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { getSavedDecks, removeSavedDeck } from "../lib/fetch";


export const pageSize = 10;

export default function SavedDecks() {
  const router = useRouter();
  const [data, setData] = useState<Deck[]>();
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getSavedDecks(setData, page, setTotal, pageSize);
  }, [page, refreshKey])

  const viewOnClick = (id: number) => {
    router.push("/decks/" + id);
  }

  const deleteOnClick = (id: number) => {
    removeSavedDeck(id, setData).then(() => {
      setPage(0);
      setRefreshKey(prev => prev + 1)
    });
  }

  return (
    data &&
    <Stack>
      <RawCrudList
        data={data.map((el: Deck) => {
          return { "id": el.id, "name": el.name, "preview": el.description }
        })}
        showUpdateBtn={false}
        showDeleteBtn={true}
        showSaveBtn={false}
        showLearnBtn={true}
        viewOnClick={viewOnClick}
        deleteOnClick={deleteOnClick}

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