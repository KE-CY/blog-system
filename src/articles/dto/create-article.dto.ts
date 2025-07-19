import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsDateString()
  @IsOptional()
  publishTime?: string;
}
