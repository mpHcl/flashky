import { useRouter } from 'next/navigation';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

export type ListElement = {
  id: number,
  name: string,
  preview: string,
}

type RawCrudListProps = {
  data: ListElement[],
  showUpdateBtn: boolean,
  showDeleteBtn: boolean,
  showSaveBtn: boolean
  viewOnClick: (id: number) => void
  editOnClick: (id: number) => void
  deleteOnClick: (id: number) => void
  saveOnClick: (id: number) => void
}

// for legacy support
export default function CrudList({ data, showUpdateDeleteBtns, path }: { data: ListElement[], path: string, showUpdateDeleteBtns: boolean, }) {
  const router = useRouter();

  const viewOnClick = (id: number) => {
    router.push("/" + path + "/" + id);
  }
  const editOnClick = (id: number) => {
    router.push("/" + path + "/edit/" + id);
  }
  const deleteOnClick = (id: number) => {
    console.log("delete " + path + " " + id);
  }

  return <RawCrudList
    data={data}
    showUpdateBtn={showUpdateDeleteBtns}
    showDeleteBtn={showUpdateDeleteBtns}
    showSaveBtn={false}
    viewOnClick={viewOnClick}
    editOnClick={editOnClick}
    deleteOnClick={deleteOnClick}
    saveOnClick={() => { }}
  />
}

export function RawCrudList({ data, showUpdateBtn, showDeleteBtn, showSaveBtn, viewOnClick, editOnClick, deleteOnClick, saveOnClick }: RawCrudListProps) {
  const MAX_PREVIEW = 50;
  return <Box sx={{ width: '90%', bgcolor: 'background.card', margin: "auto" }}>
    <List>
      {data.map((el, index) =>
        <ListItem key={el.id} secondaryAction={
          <div>
            <Tooltip title="View details" placement="bottom" disableInteractive>
              <IconButton edge="end" aria-label="view" onClick={() => { viewOnClick(el.id); }}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            {showUpdateBtn && <span>
              <Tooltip title="Edit" placement="bottom" disableInteractive>
                <IconButton edge="end" aria-label="edit" onClick={() => { editOnClick(el.id); }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </span>}
            {showDeleteBtn && <span>
              <Tooltip title="Delete" placement="bottom" disableInteractive>
                <IconButton edge="end" aria-label="delete" onClick={() => { deleteOnClick(el.id); }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </span>}
            {showSaveBtn && <span>
              <Tooltip title="Save" placement="bottom" disableInteractive>
                <IconButton edge="end" aria-label="save" onClick={() => { saveOnClick(el.id); }}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            </span>}
          </div>
        } sx={[index % 2 == 0 ? { bgcolor: 'rgba(127, 127, 127, 0.2)' } : { bgcolor: null }]}>
          <ListItemText primary={el.name} secondary={el.preview.length > MAX_PREVIEW ? el.preview.substring(0, MAX_PREVIEW) + "..." : el.preview} />
        </ListItem>)}
    </List>
  </Box>
}