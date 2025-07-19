import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/user.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: User,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  findAll(@Query() queryDto: QueryArticleDto) {
    return this.articlesService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Get(':id/edit-histories')
  @UseGuards(JwtAuthGuard)
  getEditHistories(
    @Param('id') id: string,
    @Request() req,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.getEditHistories(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.update(id, updateArticleDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req, @CurrentUser() user: User) {
    this.articlesService.remove(id, user.id);
    return { message: '文章已刪除' };
  }
}
