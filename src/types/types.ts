export interface User {
    firstName: string;
    lastName: string;
}

export interface Reply {
    id: number | null;
    text: string;
    created_at: string;
    user: User;
    replies: Reply[];
}

export interface Comment {
    id: number | null;
    created_at: string;
    text: string;
    user: User;
    replies: Reply[];
}

export interface MediaFile {
    type: string;
    src: string;
}

export interface PostData {
    id?: number | null;
    content: string;
    user: User;
    mediaFiles: MediaFile[];
    comments?: Comment[];
    created_at: string;
}

export interface SupabaseError {
    code: string;
    details: string | null;
    hint: string | null;
    message: string;
};


export type PostArray = PostData[];
