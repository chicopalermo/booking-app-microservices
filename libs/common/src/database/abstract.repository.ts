import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";
import { AbstractDocument } from "./abstract.schema";
import { Logger, NotFoundException } from "@nestjs/common";

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
    protected abstract readonly logger: Logger;
    
    constructor(protected readonly model: Model<TDocument>) {}
    
    async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
        const createDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        return (await createDocument.save()).toJSON() as unknown as TDocument;
    }

    async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        const document = await this.model.findOne(filterQuery, {}, { lean: true });

        if(!document) {
            this.logger.warn('Document not foound with filterQuery', filterQuery);
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        updateQuery: UpdateQuery<TDocument>,
    ) {
        const document = await this.model.findOneAndUpdate(filterQuery, updateQuery, {
            lean: true,
            new: true,
        });

        if(!document) {
            this.logger.warn('Document not foound with filterQuery', filterQuery);
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    async findAll(filterQuery: FilterQuery<TDocument>) {
        return this.model.find(filterQuery, {}, { lean: true });
    }

    async filterOneAndDelete(filterQuery: FilterQuery<TDocument>) {
        return this.model.findOneAndDelete(filterQuery, { lean: true });
    }
}