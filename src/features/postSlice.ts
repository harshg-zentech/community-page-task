import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../supabase/supabase';
import { Comment, Reply, PostData } from '../types/types'; // Import the types

// Define the initial state type
interface PostsState {
    posts: PostData[];
    loading: boolean;
    error: string | null;
}

const initialState: PostsState = {
    posts: [],
    loading: false,
    error: null,
};

// Async thunk to fetch posts from Supabase
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.from('post').select('*');
    if (error) {
        return rejectWithValue(error.message);
    }
    return data as PostData[]; // Ensure data is of type Post[]
});

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        addPost: (state, action: PayloadAction<PostData>) => {
            state.posts.push(action.payload);
        },

        addComment: (state, action: PayloadAction<{ postId: number; comment: Comment }>) => {
            state.posts = state.posts.map((post) =>
                post.id === action.payload.postId
                    ? {
                        ...post,
                        comments: [...(post.comments ?? []), action.payload.comment],
                    }
                    : post
            );
        },

        addReply: (
            state,
            action: PayloadAction<{
                postId: number;
                commentId: number;
                reply: Reply;
            }>
        ) => {
            const postIndex = state.posts.findIndex((post: PostData) => post.id === action.payload.postId);
            if (postIndex === -1) return;

            const addReplyRecursively = (comments: Comment[], commentId: number, reply: Reply, created_at?: string): boolean => {
                for (const comment of comments) {
                    if (comment.id === commentId) {
                        comment.replies.push(reply);
                        return true; // Reply added successfully
                    }
                    // Recursively check in nested replies
                    if (addReplyRecursively(comment.replies, commentId, reply)) {
                        return true;
                    }
                }
                return false; // Reply not added
            };

            const post = state.posts[postIndex];

            // Generate a unique reply ID based on parent comment
            const replyId =
                post?.comments && post.comments.length > 0
                    ? Math.max(...post?.comments?.flatMap((c: Comment) => c.replies.map((r: Reply) => r.id)).filter((id): id is number => id !== null), 0) + 1
                    : action.payload.commentId * 10 + 1;

            const newReply: Reply = {
                id: replyId,
                text: action.payload.reply.text,
                user: action.payload.reply.user,
                replies: [],
                created_at: action.payload.reply.created_at,
            };

            if (post?.comments) {
                addReplyRecursively(post.comments, action.payload.commentId, newReply);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<PostData[]>) => {
                state.loading = false;
                state.posts = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { addPost, addComment, addReply } = postsSlice.actions;

export default postsSlice.reducer;
