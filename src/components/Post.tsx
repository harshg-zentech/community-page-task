import React, { useState } from 'react';
import {
	Card,
	CardContent,
	Avatar,
	Typography,
	TextField,
	Box,
	Dialog,
	DialogContent,
	InputAdornment,
	IconButton
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addComment, } from '../features/postSlice';
import Comment from './Comment';
import { LuMessageCircleMore } from "react-icons/lu";
import Carousel from 'react-material-ui-carousel';
import { RiArrowLeftWideFill, RiArrowRightWideFill } from 'react-icons/ri';
import { supabase } from '../supabase/supabase';
import { formatDistanceToNow } from 'date-fns';
import { AppDispatch } from '../store';
import type { MediaFile, PostData } from '../types/types';
import { TbSend } from 'react-icons/tb';

const Post = ({ post }: { post: PostData }) => {
	const dispatch: AppDispatch = useDispatch();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [commentText, setCommentText] = useState('');
	const [showCommentBox, setShowCommentBox] = useState(false);
	const [openCarousel, setOpenCarousel] = useState(false)
	const [currentIndex, setCurrentIndex] = useState<number>(0)
	const [activeCommentId, setActiveCommentId] = useState<number | null>(null);

	const handleCommentSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!firstName.trim() && !commentText.trim()) {
			alert('Please enter your name and comment text.');
			return;
		}

		const newComment = {
			id: Date.now(), // Generate a unique ID for the comment
			text: commentText,
			user: {
				firstName,
				lastName,
			},
			replies: [],
			created_at: new Date().toISOString(),
		};

		try {
			// Fetch the existing comments for the post
			const { data: existingPost, error: fetchError } = await supabase
				.from('post')
				.select('comments')
				.eq('id', post.id)
				.single();

			if (fetchError) throw fetchError;

			// Ensure comments is always an array
			const updatedComments = existingPost?.comments ? [...existingPost.comments, newComment] : [newComment];

			// Update the comments array in the database
			const { error: updateError } = await supabase
				.from('post')
				.update({ comments: updatedComments })
				.eq('id', post.id);

			if (updateError) throw updateError;

			// Dispatch Redux action to update UI
			if (post.id !== undefined && post.id !== null) {
				dispatch(addComment({ postId: post.id, comment: newComment }));
			} else {
				console.error('Post ID is invalid:', post.id);
			}

			// Reset input fields
			setFirstName('');
			setLastName('');
			setCommentText('');
		} catch (error: any) {
			console.error('Error adding comment:', error.message);
			alert('Failed to add comment. Please try again later.');
		}
	};


	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleCommentSubmit(e);
			setShowCommentBox(false)
		}
	};

	const handleCarouselOpen = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
		e.preventDefault();
		setOpenCarousel(true);
		setCurrentIndex(idx)
	};

	const renderMixedMedia = (mediaFiles: MediaFile[]) => {
		if (!mediaFiles || mediaFiles.length === 0) return null;

		if (mediaFiles.length === 3) {
			// Three media files: one large and two small side-by-side
			return (
				<div
					style={{
						display: 'grid',
						gap: '8px',
					}}
				>
					{/* Large Media File */}
					<div
						style={{
							position: 'relative',
							width: '100%',
							height: '450px',
							borderRadius: '8px',
							overflow: 'hidden',
						}}
						onClick={(e) => handleCarouselOpen(e, 0)}
					>
						{mediaFiles[0].type === 'image' ? (
							<img
								src={mediaFiles[0].src}
								alt={`Media 0`}
								style={{
									width: '100%',
									height: '100%',
									maxHeight: '800px',
									objectFit: 'cover',
									cursor: 'pointer',
								}}
							/>
						) : (
							<video
								src={mediaFiles[0].src}
								controls
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									cursor: 'pointer',
								}}
							/>
						)}
					</div>

					{/* Two smaller media files */}
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: '4px',
						}}
					>
						{mediaFiles.slice(1).map((file, idx) => (
							<div
								key={idx + 1}
								style={{
									position: 'relative',
									width: '100%',
									height: '240px',
									borderRadius: '8px',
									overflow: 'hidden',
								}}
								onClick={(e: React.MouseEvent<HTMLDivElement>) => handleCarouselOpen(e, idx + 1)}
							>
								{file.type === 'image' ? (
									<img
										src={file.src}
										alt={`Media ${idx + 1}`}
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											cursor: 'pointer',
										}}
									/>
								) : (
									<video
										src={file.src}
										controls
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											cursor: 'pointer',
										}}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			);
		}
		// Default handling for other cases (more than 3 or less than 3)
		return (
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: mediaFiles.length === 1 ? '1fr' : 'repeat(2, 1fr)',
					gap: '4px',
					borderRadius: '8px',
					position: 'relative',
				}}
			>
				{mediaFiles.slice(0, 4).map((file, idx) => {
					const isLastItem = idx === 3 && mediaFiles.length > 4;

					return (
						<div
							key={idx}
							style={{
								position: 'relative',
								width: '100%',
								height: mediaFiles.length === 1 ? 'auto' : '200px',
								borderRadius: '8px',
								overflow: 'hidden',
							}}
							onClick={(e) => handleCarouselOpen(e, idx)}
						>
							{file.type === 'image' ? (
								<img
									src={file.src}
									alt={`Media ${idx}`}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										cursor: 'pointer',
										filter: isLastItem ? 'brightness(0.7)' : 'none',
									}}
								/>
							) : (
								<video
									src={file.src}
									controls
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										cursor: 'pointer',
										filter: isLastItem ? 'brightness(0.7)' : 'none',
									}}
								/>
							)}

							{isLastItem && (
								<div
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										backgroundColor: 'rgba(0, 0, 0, 0.5)',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										color: '#fff',
										fontSize: '24px',
										fontWeight: 'bold',
										cursor: 'pointer',
									}}
								>
									+{mediaFiles.length - 4} more
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<Card
			sx={{
				mt: { xs: 2, sm: 3, md: 4 }, // Responsive margin for different screen sizes
				width: { xs: '100%', sm: '100%', md: '760px' }, // Full width on small screens, fixed width on larger screens
				height: 'auto',
				backgroundColor: 'background.paper',
				boxShadow: '0 14px 54px rgba(0, 0, 0, 0.03)',
				borderRadius: 2,
				borderColor: 'divider',
				p: { xs: 0, sm: 2, md: 4 }, // Responsive padding
			}}
		>
			<CardContent>
				{/* Post Author and Content */}
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Avatar sx={{ width: 60, height: 60 }} />
					<Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 2, gap: 1 }}>
						<Typography >
							{post.user.firstName} {post.user.lastName}
						</Typography>
						<Typography sx={{ fontSize: '12px', whiteSpace: 'pre' }} color='textDisabled'>{post?.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago'}</Typography>
					</Box>
				</div>
				{post.content && <Typography sx={{ marginTop: 2, marginBottom: 2 }} variant="body1" paragraph>
					{post.content}
				</Typography>}

				{post.mediaFiles.length > 0 && renderMixedMedia(post.mediaFiles)}

				{/* Comments Header */}
				<Box display={'flex'} justifyContent={'space-between'} mt={3} >

					<Box sx={{ display: 'flex', cursor: 'pointer' }} onClick={() => setShowCommentBox((prev) => !prev)} >
						<LuMessageCircleMore style={{ color: 'gray', fontSize: '20px', marginTop: '2px' }} />
						<Typography sx={{ color: 'gray', pl: 1 }}>Comment</Typography>
					</Box>
					<Typography sx={{ color: '#2f65b9' }}>
						{(!post?.comments || post?.comments.length === 0)
							? "" // No comments, display "No Comments"
							: post?.comments.length === 1
								? "1 Comment" // Exactly one comment, display "1 Comment"
								: `${post?.comments?.length} Comments`} {/* More than one comment */}
					</Typography>

				</Box>
				{showCommentBox && (
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
								value={commentText}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setCommentText(e.target.value)
								}
								fullWidth
								placeholder="Add a comment..."
								size="small"
								onKeyDown={handleKeyDown}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleCommentSubmit(e)} sx={{ '&:hover': {
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

									},
								}}
							/>
						</Box>
					</Box>
				)}
			</CardContent>

			{/* Display Comments */}
			<div>
				{post?.comments?.map((comment: any) => (
					<Comment key={comment?.id} comment={comment} postId={post?.id ?? 0} post={post} activeCommentId={activeCommentId}
						setActiveCommentId={setActiveCommentId} />
				))}
			</div>

			<Dialog open={openCarousel} onClose={() => setOpenCarousel(false)} fullWidth maxWidth="md" sx={{ '.MuiPaper-root': {
				backgroundColor: 'transparent',
				boxShadow: 'none'
			} }}>
				<DialogContent
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						padding: 0,
						width: '100%',
						height: '600px' // Ensuring it takes full height of the dialog
					}}
				>
					<Carousel
						NextIcon={<RiArrowRightWideFill />}
						PrevIcon={<RiArrowLeftWideFill />}
						indicators={false}
						index={currentIndex} // Set the current slide index
						onChange={(now?: number) => {
							if (now !== undefined) {
								setCurrentIndex(now);
							}
						}}
						sx={{
							width: '100%',
							height: '600px', // Ensures carousel fills the available height
							overflow: 'hidden',
						}}
						autoPlay={post?.mediaFiles?.some((media: MediaFile) => media?.type === 'video') ? false : true} // Disable autoplay if there are videos
					>
						{post?.mediaFiles?.map((media: MediaFile, idx: number) => {
							return (
								<div key={idx} style={{ width: '100%', height: '600px', position: 'relative' }}>
									{post?.mediaFiles[currentIndex]?.type === 'image' ? (
										<img
											src={post?.mediaFiles[currentIndex]?.src}
											alt={`Slide ${idx + 1}`}
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'contain', // Ensure the image fits nicely within the container
											}}
										/>
									) : post?.mediaFiles[currentIndex]?.type === 'video' ? (
										<iframe
											key={idx}
											src={post?.mediaFiles[currentIndex]?.src} // Assuming this is a YouTube/Vimeo link
											width="100%" // Full width of the parent container (carousel)
											height="100%" // Full height of the parent container (carousel)
											title={`Media content ${currentIndex + 1}`}
											style={{
												objectFit: 'contain', // Ensures the video fits within the container without cropping
												border: 'none', // Removes iframe border
											}}
											allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
										/>
									) : null}

									<Typography
										sx={{
											position: 'absolute',
											bottom: 10,
											left: '50%',
											transform: 'translateX(-50%)',
											backgroundColor: 'rgba(0, 0, 0, 0.5)',
											color: 'white',
											padding: '4px 10px',
											borderRadius: '10px',
										}}
									>
										{`${currentIndex + 1} / ${post?.mediaFiles?.length}`}
									</Typography>
								</div>
							);
						})}
					</Carousel>
				</DialogContent>
			</Dialog>
		</Card >
	);
};

export default Post;

