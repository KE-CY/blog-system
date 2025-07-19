import { Module, forwardRef } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ArticlesModule } from '../articles/articles.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => ArticlesModule), UsersModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
