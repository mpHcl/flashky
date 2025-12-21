import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

export type ListElement = {
    id: number,
    name: string
}

export default function CrudList({data} : {data: ListElement[]})
{
    return <List>
        {data.map((el) => <ListItemButton key={el.id}>
            <ListItemText>{el.name}</ListItemText>
        </ListItemButton>)}
    </List>
}