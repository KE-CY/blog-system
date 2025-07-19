import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  articleId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
