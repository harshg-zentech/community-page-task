import React, { useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import {
    Box,
    TextField,
    Avatar,
    Typography,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { addReply } from '../features/postSlice';
import { supabase } from '../supabase/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Comment, PostData, Reply } from '../types/types';
import { TbSend } from 'react-icons/tb';

interface CommentProps {
    comment: Comment;
    postId: number;
    post: PostData;
    activeCommentId: number | null;
    setActiveCommentId: React.Dispatch<React.SetStateAction<number | null>>;
}

const Comments: React.FC<CommentProps> = ({ comment, postId, post, activeCommentId, setActiveCommentId }) => {
    const dispatch = useAppDispatch();
    const [replyText, setReplyText] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleReplyClick = () => {
        // Toggle the reply input for this comment
        setActiveCommentId((prev: number | null) => (prev === comment.id ? null : comment.id));
    };
    const handleModalClose = () => {
        setActiveCommentId(null);
        setReplyText('');
        setFirstName('');
        setLastName('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, comment: Comment) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (comment.id !== null) {
                handleReplySubmit(e, comment.id);
            }
        }
    };

    const handleReplySubmit = async (e: React.FormEvent, commentId: number) => {
        e.preventDefault();

        if (!firstName.trim() && !replyText.trim()) {
            alert('Please add your name and comment text.');
            return;
        }

        const newReply = {
            id: Date.now(), // Unique ID for the reply
            text: replyText,
            user: { firstName, lastName },
            replies: [], // Initialize replies for future nested replies
            created_at: new Date().toISOString(),
        };

        try {
            // Fetch the current comments for the post
            const { data: existingPost, error: fetchError } = await supabase
                .from('post')
                .select('comments')
                .eq('id', postId)
                .single();

            if (fetchError) throw fetchError;

            const existingComments = existingPost?.comments || [];

            // Recursive function to add reply to the correct comment or reply
            const addReplyRecursively = (comments: Comment[], targetId: number): Reply[] | Comment[] => {
                return comments.map((comment) => {
                    if (comment.id === targetId) {
                        // Append the new reply to the replies array
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReply],
                        };
                    }
                    // Recursively process replies
                    return {
                        ...comment,
                        replies: addReplyRecursively(comment.replies || [], targetId),
                    };
                });
            };

            // Update comments with the new reply
            let updatedComments = existingComments;
            if (comment.id !== null) {
                updatedComments = addReplyRecursively(existingComments, comment.id);
            }

            // Update the database
            const { error: updateError } = await supabase
                .from('post')
                .update({ comments: updatedComments })
                .eq('id', postId);

            if (updateError) throw updateError;

            if (post.id !== undefined && post.id !== null) {
                dispatch(addReply({ postId: post.id, commentId, reply: newReply }));
            } else {
                console.error('Post ID is invalid');
            }
            handleModalClose(); // Close modal and reset form fields
        } catch (error: any) {
            console.error('Error adding reply:', error.message);
            alert('Failed to add reply. Please try again.');
        }
    };


    return (
        <Box sx={{
            // ml: comment.level * 20,
            // marginBottom: 2,
            pl: 2,
            sm: {
                // ml: comment.level * 10, // Adjust the margin-left on small screens
                pl: 1,
            },
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                sm: {
                    gap: '4px', // Reduce the gap on smaller screens
                },
            }}>
                <Avatar sx={{ width: 30, height: 30 }}>
                    {comment?.user?.firstName[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    sm: {
                        flexDirection: 'column', // Stack elements vertically on small screens
                        alignItems: 'flex-start',
                    },
                    xs: {
                        flexDirection: 'row', // Row layout for xs screens
                        justifyContent: 'flex-start', // Align to the left on extra small screens
                    },
                }}>
                    <Typography mr={1} sx={{
                        fontSize: {
                            xs: "12px", // Extra small screens (mobile)
                            sm: "14px", // Small screens
                            md: "16px", // Medium screens
                            lg: "16px", // Large screens
                            xl: "16px", // Extra large screens
                        },
                    }}>
                        {comment?.user?.firstName.charAt(0).toUpperCase() + comment?.user?.firstName.slice(1).toLowerCase()} {comment?.user?.lastName.charAt(0).toUpperCase() + comment?.user?.lastName.slice(1).toLowerCase()}
                    </Typography>

                    <Typography sx={{
                        fontSize: '12px',
                        fontStyle: 'normal',
                        color: 'gray',
                        xs: {
                            fontSize: '10px', // Adjust font size for xs screens
                        },
                    }}>
                        replied {comment?.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'some time ago'}
                    </Typography>
                </Box>

            </Box>

            <Box mb={3}>
                <Typography sx={{
                    width: '100%',
                    p: 1,
                    m: 1,
                    ml: 4,
                    sm: {
                        ml: 2, // Adjust the left margin on smaller screens
                    },
                    fontSize: {
                        xs: "12px", // Extra small screens (mobile)
                        sm: "12px", // Small screens
                        md: "12px", // Medium screens
                        lg: "12px", // Large screens
                        xl: "12px", // Extra large screens
                    },
                }} >
                    <span style={{ backgroundColor: "whitesmoke", padding: '6px', borderRadius: '4px' }}>
                        {comment.text}
                    </span>
                </Typography>
                <Box m={1} pl={4} display={'flex'} gap={2}>
                    {comment?.replies.length > 0 && (
                        <span
                            style={{
                                // marginLeft: '10px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                color: 'gray',
                            }}
                        >
                            {comment?.replies?.length === 0
                                ? "" // No replies, show nothing
                                : comment?.replies?.length === 1
                                    ? "1 reply" // One reply, show "1 reply"
                                    : `${comment?.replies?.length} replies`} {/* More than one, show "X replies" */}
                        </span>
                    )}


                    <span
                        onClick={handleReplyClick}
                        style={{
                            // marginLeft: '10px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            color: 'gray',

                        }}
                    >
                        Reply
                    </span>
                </Box>
            </Box>

            {/* Render replies */}
            <div style={{ marginLeft: '10px' }}>
                {comment?.replies?.map((reply: Reply) => (
                    <Comments key={reply.id} comment={reply} postId={postId} post={post} activeCommentId={activeCommentId} setActiveCommentId={setActiveCommentId} />
                ))}
            </div>

            {/* Modal for reply */}
            {activeCommentId === comment.id && (
                <Box display="flex" flexDirection="column" my={2} gap={1}>
                    <Box display="flex" gap={1} alignItems="center">
                        <TextField
                            type="text"
                            value={firstName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFirstName(e.target.value)
                            }
                            placeholder="First Name"
                            fullWidth
                            required
                            size="small"
                            InputProps={{
                                sx: {
                                    borderRadius: '8px',

                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid rgba(0, 0, 0, 0.23)', // Default MUI border on hover
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid rgba(0, 0, 0, 0.23)', // No border by default
                                    },
                                    '&:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid rgba(0, 0, 0, 0.23)', // Set hover border after losing focus
                                    },

                                },
                            }}
                        />
                        <TextField
                            type="text"
                            value={lastName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setLastName(e.target.value)
                            }
                            placeholder="Last Name"
                            size="small"
                            fullWidth
                            required
                            InputProps={{
                                sx: {
                                    borderRadius: '8px',

                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid rgba(0, 0, 0, 0.23)', // Default MUI border on hover
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid rgba(0, 0, 0, 0.23)', // No border by default
                                    },

                                },
                            }}
                        />
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                        <TextField
                            type="text"
                            value={replyText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setReplyText(e.target.value)
                            }
                            fullWidth
                            placeholder="Add a comment..."
                            size="small"
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, comment)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleReplySubmit(e, comment.id || 0)} sx={{ '&:hover': {
                                            backgroundColor: 'transparent',
                                        } }}>
                                            <TbSend fontSize={24} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: '8px',

                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid rgba(0, 0, 0, 0.23)', // Default MUI border on hover
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid rgba(0, 0, 0, 0.23)', // No border by default
                                    },

                                }
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>

    );
};

export default Comments;
