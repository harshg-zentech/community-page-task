
import React, { useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { addPost, fetchPosts } from '../features/postSlice';
import { Box, Button, styled, TextField, Card, CardContent, IconButton, Backdrop, CircularProgress, InputAdornment } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase } from '../supabase/supabase';
import { MdOutlinePermMedia } from "react-icons/md";
import { PostData } from '../types/types';
import { TbSend } from "react-icons/tb";
import { toast } from 'react-toastify';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const PostCreationForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUploadFiles = async () => {
        const urls: { url: string; type: string }[] = []; // Array to store URL and media type

        const userFolder = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;

        for (const file of mediaFiles) {
            const fileName = `${Date.now()}_${file.name}`; // Unique filename to avoid overwrites
            const path = `user_media/${userFolder}/${fileName}`; // Dynamic path with user's name

            const { error } = await supabase.storage
                .from('postImages') // Bucket name
                .upload(path, file);

            if (error) {
                console.error('Error uploading file:', error.message);
                toast.error('Error while uploading the file :(');
                return [];
            } else {
                const publicURL = supabase.storage.from('postImages').getPublicUrl(path).data.publicUrl;
                const type = file.type.startsWith('video') ? 'video' : 'image'; // Determine the file type
                urls.push({ url: publicURL, type }); // Save the URL and type
            }
        }

        return urls; // Return all the URLs and their types after all files are uploaded
    };


    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setMediaFiles((prev) => [...prev, ...filesArray]); // Append new files
        }
    };

    const handleRemoveMedia = (index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!firstName || !lastName) {
            toast.info('Please add your name!');
            return;
        }

        if (!content.trim() && mediaFiles.length === 0) {
            toast.info('Please post something or add media!');
            return;
        }

        try {
            setIsLoading(true);

            // Upload files and get public URLs
            const urls = await handleUploadFiles(); // Await for all file uploads to finish

            // const newPost: PostData = {
            //     content,
            //     mediaFiles: urls.map(({ url }) => url), // Store all uploaded file URLs
            //     mediaTypes: urls.map(({ type }) => type), // Store corresponding media types
            //     user: { firstName, lastName },
            //     created_at: new Date().toISOString(),
            // };
            const newPost: PostData = {
                content,
                mediaFiles: urls.map(({ url, type }) => ({ type, src: url })), // Corrected: Store type and URL together
                user: { firstName, lastName },
                created_at: new Date().toISOString(),
            };

            // Insert the post into Supabase
            const { error } = await supabase.from('post').insert([newPost]);
            dispatch(addPost(newPost));
            dispatch(fetchPosts());

            if (error) {
                throw error;
            }
            // Clear form state
            setContent('');
            setMediaFiles([]);
            setFirstName('');
            setLastName('');
        } catch (error) {
            console.error('Error adding post to Supabase:', error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Card
                sx={{
                    backgroundColor: 'background.paper',
                    boxShadow: '0 14px 54px rgba(0, 0, 0, 0.03)',
                    borderRadius: 2,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderColor: 'divider',
                    p: 1,
                    width: '760px',
                    height: 'auto',
                }}
            >
                <CardContent>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <Box sx={{display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1}}>
                            <TextField
                                type="text"
                                value={firstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                required
                                size="small"
                                fullWidth
                            />
                            <TextField
                                type="text"
                                value={lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                size="small"
                                fullWidth
                                required
                            />
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                                id="status-input"
                                fullWidth
                                placeholder="What's on your mind?"
                                variant="outlined"
                                size="small"
                                value={content}
                                sx={{ position: 'relative' }}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        handleSubmit(e);
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit(e)} sx={{ '&:hover': {
                                                backgroundColor: 'transparent',
                                            } }}>
                                                <TbSend fontSize={24} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                sx={{ color: 'text.secondary', padding: '0px', border: '1px solid #c4c4c4', height: '40px' }}
                                component="label"
                            >
                                <MdOutlinePermMedia style={{ fontSize: '24px' }} />
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleMediaChange}
                                    multiple
                                    accept="image/*,video/*"
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                            </Button>
                        </Box>
                    </Box>
                    {mediaFiles.length > 0 && (
                        <Box display="flex" flexWrap={'wrap'} gap={2} mb={2} mt={2}>
                            {mediaFiles.map((file, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: '64px',
                                        height: '64px',
                                        position: 'relative',
                                        borderRadius: 2,
                                        overflow: 'visible',
                                        border: '1px solid #ccc',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {file.type.startsWith('image') ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '1',
                                            }}


                                        />
                                    ) : (
                                        <video
                                            src={URL.createObjectURL(file)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                            muted
                                        />
                                    )}
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            zIndex: 10,
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                            color: 'white',
                                            height: '24px',
                                            width: '24px',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)'
                                            }
                                        }}
                                        onClick={() => handleRemoveMedia(index)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}


                </CardContent>
            </Card>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default PostCreationForm;
