import { fetchAuthGET, fetchAuthPOST, PostBodyType } from "@/app/lib/fetch";
import { Comment } from "./types";


export const getComments = async (
  deck_id: number,
  setComments: React.Dispatch<React.SetStateAction<Comment[] | undefined>>
) => {
  const onSuccess = async (response: Response) => {
    const result = await response.json();
    setComments(result.comments);
  }
  await fetchAuthGET(`comments?deck_id=${deck_id}&max_depth=3`, 200, onSuccess);
}


export const getCommentChildren = async (
  currentComment: Comment,
  setCurrentComment: React.Dispatch<React.SetStateAction<Comment>>
) => {
  const onSuccess = async (response: Response) => {
    const result = await response.json();
    setCurrentComment(result);
  };
  fetchAuthGET(`comments/${currentComment.id}?max_depth=1`, 200, onSuccess);
}


export const uploadReply = async (
  parentComment: Comment,
  setParentComment: React.Dispatch<React.SetStateAction<Comment>>,
  reply: string
) => {
  const body = {
    "deck_id": parentComment.deck_id,
    "parent_id": parentComment.id,
    "content": reply
  }

  const onSuccess = async (response: Response) => {
    const result = await response.json();
    setParentComment(prev => ({
      ...prev,
      children: [...prev.children, result],
      children_ids: [...prev.children_ids, result.id],
    }));
  }

  return await fetchAuthPOST(`comments`, 200, PostBodyType.JSON, body, onSuccess);
}
