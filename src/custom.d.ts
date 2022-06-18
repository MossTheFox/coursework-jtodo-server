declare namespace Express {
    export interface Request {
        user: {
            qqUnionID: string;
            username: string;
            avatarUrl: string;
            registeredAt: Date;
            save: () => Promise<any>;
        }
    }
}
