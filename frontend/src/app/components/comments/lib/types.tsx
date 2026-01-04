export type Comment = {
  id: number
  content: string
  creation_date: Date
  deck_id: number
  author_id: number
  author_name: string
  parent_id: number | undefined
  children_ids: number[]
  children: Comment[],
}