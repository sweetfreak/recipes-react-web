export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  text: string;
  createdAt: string | Date;
  likes: number;
}