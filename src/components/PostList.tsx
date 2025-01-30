import React, { useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchPosts } from '../features/postSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { PostData } from '../types/types';
import Post from './Post';
import Typography from '@mui/material/Typography';
import { Box, Card, CardContent, LinearProgress, Stack } from '@mui/material';

const PostList: React.FC = () => {
    const dispatch = useAppDispatch();
    const posts = useAppSelector((state) => state.posts.posts);
    const loading = useAppSelector((state) => state.posts.loading);
    const error = useAppSelector((state) => state.posts.error);

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);

    if (loading) {
        return (
            <Stack sx={{ width: '100%', maxWidth: '760px' }}>
                <LinearProgress color="inherit" sx={{ borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }} />
            </Stack>
        )
    }

    if (error) {
        return (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3, md: 4 }}}>
                <Card
                    sx={{
                        backgroundColor: 'background.paper',
                        boxShadow: '0 14px 54px rgba(0, 0, 0, 0.03)',
                        borderRadius: 2,
                        borderColor: 'divider',
                        p: 1,
                        width: '760px',
                        height: 'auto',
                    }}
                >
                    <CardContent>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Typography color="error" align="center">{error}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // Sort posts by created_at timestamp in descending order (newest first)
    const sortedPosts: PostData[] = [...posts].sort((a, b) => new Date(b?.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <Box>
            {sortedPosts.map((post, index) => (
                <Post key={index} post={post} />
            ))}
        </Box>
    );
};

export default PostList;
