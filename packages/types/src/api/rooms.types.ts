import { ExamCategory } from '../enums';
import { PaginationQuery } from './auth.types';

export interface RoomFilterQuery extends PaginationQuery {
    examCategory?: ExamCategory;
    subject?: string;
    isActive?: boolean;
}

export interface PostFilterQuery extends PaginationQuery {
    examCategory?: ExamCategory;
    subject?: string;
    contentType?: string;
    tags?: string[];
    userId?: string;
}
