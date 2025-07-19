import { Module, forwardRef } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { CommentsModule } from '../comments/comments.module';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [forwardRef(() => CommentsModule), forwardRef(() => LikesModule)],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
