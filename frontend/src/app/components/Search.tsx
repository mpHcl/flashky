'use client';
import {
  Stack,
  TextField,
  Button,
  Chip,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useState, useEffect } from 'react';
import { RawCrudList } from "./crudlist";
import { Deck } from "../lib/types";
import { fetchAuthGET, fetchAuthPOST } from "../lib/fetch";

import { useRouter } from 'next/navigation';
import Pagination from "./Pagination";
import { RequestBodyType } from "../lib/fetchOptions";

import { DialogType, useDialog } from "./dialogs/AppDialog";
import AlertDialog from "./dialogs/AppDialog";


export default function Search({ query }: { query: string }) {
  const router = useRouter()
  const [owner, setOwner] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [sort, setSort] = useState(0);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const { dialog, show, close } = useDialog();

  useEffect(() => {
    setLoading(true);
    const onSuccess = async (response: Response) => {
      const result = await response.json();

      setDecks(result.decks);
      setTotal(result.total_number);
    }

    fetchAuthGET(buildUrl(), 200, onSuccess);
    setLoading(false);
  }, [query, owner, tags, page, sort]);

  useEffect(() => {
    setPage(0);
  }, [query, owner, tags, sort]);

  const saveDeck = (id: number) => {
    const onSuccess = async (response: Response) => {
      const result = await response.json();
      show(result.message, DialogType.INFO);
    }
    const onFail = async (response: Response) => {
      const result = await response.json();
      show(result.detail, DialogType.ERROR);
    }
    fetchAuthPOST(`decks/${id}/save`, 200, RequestBodyType.EMPTY, {}, onSuccess, onFail);
  }

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
    return `decks?q=${encodeURIComponent(query)}` +
      `${(owner !== '' ? "&owner=" + encodeURIComponent(owner) : "")}` +
      `${(tags.length > 0 ? "&tags=" + encodeURIComponent(tags.join(",")) : "")}` +
      `&page=${encodeURIComponent(page + 1)}` +
      `&page_size=${encodeURIComponent(pageSize)}` +
      `&sort=${encodeURIComponent(sort)}`;
  }


  return (
    <Stack spacing={2}>
      <AlertDialog {...dialog} onClose={close} />

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

        <RawCrudList
          data={decks?.map((el) => { return { id: el.id, name: el.name, preview: el.description } })}
          showDeleteBtn={false}
          showSaveBtn={true}
          showUpdateBtn={false}
          showLearnBtn={true}
          viewOnClick={(id: number) => { router.push(`decks/${id}`) }}
          saveOnClick={(id: number) => { saveDeck(id) }}
          editOnClick={() => { }}
          deleteOnClick={() => { }}
        />

      )
      }

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        setPage={setPage}
      />
    </Stack>
  );
}