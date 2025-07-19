import { IsUUID, IsNotEmpty } from 'class-validator';

export class ToggleLikeDto {
  @IsUUID()
  @IsNotEmpty()
  articleId: string;
}
