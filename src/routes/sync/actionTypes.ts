export type ActionType = 
    'createCollection' | 'deleteCollection' | 'updateCollection' |
    'createItem' | 'deleteItem' | 'updateItem' |
    'clearCollectionItem' | 'clearCollection' |
    'fullSync' | 'fullSyncCollectionList' | 'fullSyncCollectionItem';   // 出现同步错误的时候，进行一遍全量同步

export type CreateCollectionPayload = {
    uuid: string;
    name: string;
    description: string;
    // createdAt 在服务端加上去
};

export type DeleteCollectionPayload = {
    uuid: string;
};

export type UpdateCollectionPayload = {
    uuid: string;
    name?: string;
    description?: string;
};

export type CreateItemPayload = {
    uuid: string;
    inCollection: string;
    name: string;
    description: string;
    // createdAt: string;  // 在服务端加上去
    // checked: boolean;   // 新建的时候，默认为 false
};

export type DeleteItemPayload = {
    uuid: string;
};

export type UpdateItemPayload = {
    uuid: string;
    inCollection?: string;
    name?: string;
    description?: string;
    // createdAt: string;   // 不可更改
    checked?: boolean;
};

export type ClearCollectionItemPayload = {
    uuid: string;
};

export type ClearAllCollectionPayload = {
    // actually empty
};

export type FullSyncPayload = {
    collections: CreateCollectionPayload[],
    items: CreateItemPayload[]
}