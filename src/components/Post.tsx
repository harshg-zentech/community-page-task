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
import { toast } from 'react-toastify';

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
			toast.info('Please add your name and comment!',);
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
			toast.error('Failed to add comment to post :(');
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
				<Box
					sx={{
						display: 'grid',
						gap: 1,
					}}
				>
					{/* Large Media File */}
					<Box
						sx={{
							position: 'relative',
							width: '100%',
							height: '450px',
							borderRadius: 1,
							overflow: 'hidden',
						}}
						onClick={(e: React.MouseEvent<HTMLDivElement>) => handleCarouselOpen(e, 0)}
					>
						{mediaFiles[0].type === 'image' ? (
							<img
								src={mediaFiles[0].src}
								alt={`Media 0`}
								loading='lazy'
								style={{
									width: '100%',
									height: '100%',
									maxHeight: '800px',
									objectFit: 'cover',
									cursor: 'pointer',
									transition: 'opacity 0.3s ease',
								}}
								onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
									e.currentTarget.style.opacity = '1';
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
					</Box>

					{/* Two smaller media files */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: 1,
						}}
					>
						{mediaFiles.slice(1).map((file, idx) => (
							<Box
								key={idx + 1}
								sx={{
									position: 'relative',
									width: '100%',
									height: '240px',
									borderRadius: 1,
									overflow: 'hidden',
								}}
								onClick={(e: React.MouseEvent<HTMLDivElement>) => handleCarouselOpen(e, idx + 1)}
							>
								{file.type === 'image' ? (
									<img
										src={file.src}
										alt={`Media ${idx + 1}`}
										loading='lazy'
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											cursor: 'pointer',
											transition: 'opacity 0.3s ease',
										}}
										onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
											e.currentTarget.style.opacity = '1';
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
							</Box>
						))}
					</Box>
				</Box>
			);
		}
		// Default handling for other cases (more than 3 or less than 3)
		return (
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: mediaFiles.length === 1 ? '1fr' : 'repeat(2, 1fr)',
					gap: 1,
					borderRadius: 1,
					position: 'relative',
				}}
			>
				{mediaFiles.slice(0, 4).map((file, idx) => {
					const isLastItem = idx === 3 && mediaFiles.length > 4;

					return (
						<Box
							key={idx}
							sx={{
								position: 'relative',
								width: '100%',
								height: mediaFiles.length === 1 ? 'auto' : '200px',
								borderRadius: 1,
								overflow: 'hidden',
							}}
							onClick={(e: React.MouseEvent<HTMLDivElement>) => handleCarouselOpen(e, idx)}
						>
							{file.type === 'image' ? (
								<img
									src={file.src}
									alt={`Media ${idx}`}
									loading='lazy'
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										cursor: 'pointer',
										filter: isLastItem ? 'brightness(0.7)' : 'none',
										transition: 'opacity 0.3s ease',
									}}
									onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
										e.currentTarget.style.opacity = '1';
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
								<Box
									sx={{
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
								</Box>
							)}
						</Box>
					);
				})}
			</Box>
		);
	};

	return (
		<Card
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				mt: { xs: 2, sm: 3, md: 4 },
				width: { xs: '100%', md: '760px' },
				height: 'auto',
				backgroundColor: 'background.paper',
				boxShadow: '0 14px 54px rgba(0, 0, 0, 0.03)',
				borderRadius: 2,
				borderColor: 'Boxider',
				p: { xs: 2, md: 4 },
			}}
		>
			<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0 }}>
				{/* Post Author and Content */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Avatar sx={{ width: 60, height: 60, fontSize: 30 }}>
						{post?.user?.firstName[0]?.toUpperCase()}
					</Avatar>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<Typography sx={{ fontSize: '16px' }}>
							{post.user.firstName} {post.user.lastName}
						</Typography>
						<Typography sx={{ fontSize: '12px', whiteSpace: 'pre' }} color='textDisabled'>{post?.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago'}</Typography>
					</Box>
				</Box>
				{post.content && <Typography sx={{ margin: 0 }} variant="body1" paragraph>
					{post.content}
				</Typography>}

				{post.mediaFiles.length > 0 && renderMixedMedia(post.mediaFiles)}

				{/* Comments Header */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setShowCommentBox((prev) => !prev)} >
						<LuMessageCircleMore style={{ color: 'gray', fontSize: '20px', marginTop: '2px' }} />
						<Typography sx={{ color: 'gray' }}>Comment</Typography>
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
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
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
										borderRadius: '1',

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
										borderRadius: '1',

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
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
										borderRadius: '1',

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
			<Box>
				{post?.comments?.map((comment: any) => (
					<Comment key={comment?.id} comment={comment} postId={post?.id ?? 0} post={post} activeCommentId={activeCommentId}
						setActiveCommentId={setActiveCommentId} />
				))}
			</Box>

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
						height: '600px'
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
							height: '600px',
							overflow: 'hidden',
						}}
						autoPlay={post?.mediaFiles?.some((media: MediaFile) => media?.type === 'video') ? false : true} // Disable autoplay if there are videos
					>
						{post?.mediaFiles?.map((media: MediaFile, idx: number) => {
							return (
								<Box key={idx} sx={{ width: '100%', height: '600px', position: 'relative' }}>
									{media?.type === 'image' ? (
										<img
											src={media?.src}
											alt={`Slide ${idx + 1}`}
											loading='lazy'
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'contain',
												transition: 'opacity 0.3s ease',
											}}
											onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
												e.currentTarget.style.opacity = '1';
											}}
										/>
									) : media?.type === 'video' ? (
										<iframe
											key={idx}
											src={media?.src}
											width="100%"
											height="100%"
											title={`Media content ${currentIndex + 1}`}
											style={{
												objectFit: 'cover',
												border: 'none',
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
								</Box>
							);
						})}
					</Carousel>
				</DialogContent>
			</Dialog>
		</Card >
	);
};

export default Post;

