import { Module, forwardRef } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { ArticlesModule } from '../articles/articles.module';

@Module({
  imports: [forwardRef(() => ArticlesModule)],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
