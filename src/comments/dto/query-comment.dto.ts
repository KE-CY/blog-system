import { IsOptional, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCommentDto {
  @IsUUID()
  articleId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
