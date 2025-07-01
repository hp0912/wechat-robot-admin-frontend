import styled from 'styled-components';

export const Container = styled.div`
	.moment-nickname {
		color: #4683d0;
	}

	.moment-content {
		margin: 0;
		padding: 0;
		white-space: pre-wrap;
		word-break: break-all;
		color: #090909;
		margin-bottom: 3px;
	}

	.moment-media-list {
		margin-bottom: 3px;
	}

	.moment-location {
		color: #4683d0;
	}

	.moment-delete {
		color: #4683d0;
	}

	.moment-likes,
	.moment-comments,
	.moment-actions {
		border-radius: 6px;
		background-color: #f5f5f5;
		margin: 12px 8px 0 0;
	}

	.moment-likes,
	.moment-actions .likes {
		padding: 8px 10px;
		border-block-end: 1px solid rgba(5, 5, 5, 0.06);

		.like {
			color: #4683d0;
			margin-right: 5px;
		}

		.user {
			color: #4683d0;
			font-size: 13px;
		}
	}

	.moment-comments,
	.moment-actions .comments {
		padding: 8px 10px;

		.comment-item {
			margin: 8px 0;

			.user {
				color: #4683d0;
				font-size: 13px;
			}

			.comment {
				color: #353434;
				font-size: 13px;
			}

			.delete-comment {
				display: none;
				margin-left: 8px;
				color: #ad5454;
				cursor: pointer;
				font-size: 13px;
			}

			.reply-comment {
				display: none;
				margin-left: 8px;
				color: #4683d0;
				cursor: pointer;
				font-size: 13px;
			}
		}

		.comment-item:hover {
			.delete-comment,
			.reply-comment {
				display: inline-block;
			}
		}

		.comment-item:first-child {
			margin-top: 0;
		}

		.comment-item:last-child {
			margin-bottom: 0;
		}
	}
`;
