'use client';
import {
  Box,
  Stack,
  TextField,
  Button,
  Chip,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useState, useEffect } from 'react';


export default function SearchClient({ query }: { query: string }) {
  const [owner, setOwner] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [sort, setSort] = useState(0);

  const [decks, setDecks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      const myHeaders = new Headers();
      let token = localStorage.getItem("token")
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      try {
        const response = await fetch("http://127.0.0.1:8000" + buildUrl(), requestOptions);
        const result = await response.json();

        setDecks(result.decks);
        setTotal(result.total_number);
        console.log(total)
      }
      catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchData();
  }, [query, owner, tags, page, sort]);

  useEffect(() => {
    setPage(0);
  }, [query, owner, tags, sort]);

  const addTag = () => {
    const tag = tagsInput.trim();
    if (!tag || tags.includes(tag)) return;

    setTags(prev => [...prev, tag]);
    setTagsInput("");
    setPage(0);
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setPage(0);
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const buildUrl = () => {
    return `/decks?q=${encodeURIComponent(query)}` +
      `${(owner !== '' ? "&owner=" + encodeURIComponent(owner) : "")}` +
      `${(tags.length > 0 ? "&tags=" + encodeURIComponent(tags.join(",")) : "")}` +
      `&page=${encodeURIComponent(page + 1)}` +
      `&page_size=${encodeURIComponent(pageSize)}` +
      `&sort=${encodeURIComponent(sort)}`;
  }


  return (<Stack spacing={2}>
    {/* Filters */}
    <Stack direction="row" spacing={2}>
      <TextField
        label="Owner"
        size="small"
        value={owner}
        onChange={e => {
          setOwner(e.target.value);
          setPage(0);
        }}
      />

      <TextField
        label="Add tag"
        size="small"
        value={tagsInput}
        onChange={e => setTagsInput(e.target.value)}
        onKeyDown={onTagKeyDown}
      />

      <Button variant="contained" onClick={addTag}>
        Add
      </Button>
    </Stack>

    {/* Tag list */}
    {tags.length > 0 && (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {tags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => removeTag(tag)}
            deleteIcon={<CloseIcon />}
          />
        ))}
      </Stack>
    )}

    {/* Sort */}
    <FormControlLabel
      control={
        <Checkbox
          checked={sort === 1}
          onChange={e => {
            setSort(e.target.checked ? 1 : 0);
            setPage(0);
          }}
        />
      }
      label="Sort by date"
    />

    {/* Results */}
    {loading ? (
      <Typography>Loading…</Typography>
    ) : (
      <><Box component="pre">{buildUrl()}</Box>
        {decks?.map((e, i) => (<p>{e.name}</p>))}
      </>
    )
    }

    {/* Pagination */}
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Button
        disabled={page === 0}
        onClick={() => setPage(p => p - 1)}
      >
        Previous
      </Button>

      <Typography>Page {page + 1}</Typography>

      <Button
        disabled={(page + 1) * pageSize >= total}
        onClick={() => setPage(p => p + 1)}
      >
        Next
      </Button>
    </Stack>
  </Stack>
  );
}