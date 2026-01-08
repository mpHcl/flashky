import { Button, Stack, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  setPage: Dispatch<SetStateAction<number>>
}

export default function Pagination(
  { page, pageSize, total, setPage }: PaginationProps
) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Button
        disabled={page === 0}
        onClick={() => setPage(p => p - 1)}
      >
        Previous
      </Button>

      <Typography>Page {page + 1} / {Math.ceil(total / pageSize)}</Typography>

      <Button
        disabled={(page + 1) * pageSize >= total}
        onClick={() => setPage(p => p + 1)}
      >
        Next
      </Button>
    </Stack>
  )
}

