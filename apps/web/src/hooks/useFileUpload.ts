import { useState, useCallback } from 'react';

import { authClient } from '@kan/auth/client';

import { usePopup } from '~/providers/popup';
import { useWorkspace } from '~/providers/workspace';

export function useFileUpload() {
	const [progress, setProgress] = useState<number>(0);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const { showPopup } = usePopup();
	const { workspace } = useWorkspace();
	const { data: session } = authClient.useSession();

	const uploadFile = useCallback(
		(file: File, folderId?: number) => {
			// folderId is a number
			if (!workspace || !session?.user) {
				showPopup({
					header: 'Error',
					message: 'Not authenticated',
					icon: 'error',
				});
				return Promise.reject('Not authenticated');
			}

			setIsUploading(true);
			setProgress(0);

			return new Promise((resolve, reject) => {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('workspaceId', workspace.id.toString()); // Pass workspace ID
				formData.append('userId', session.user.id); // Pass user ID
				if (folderId) {
					formData.append('folderId', folderId.toString());
				}

				const xhr = new XMLHttpRequest();

				// Listen for progress events
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const percentComplete = (event.loaded / event.total) * 100;
						setProgress(Math.round(percentComplete));
					}
				};

				// Handle completion
				xhr.onload = () => {
					setIsUploading(false);
					if (xhr.status === 200) {
						const response = JSON.parse(xhr.responseText);
						showPopup({
							header: 'Upload Complete',
							message: `"${file.name}" has been uploaded.`,
							icon: 'success',
						});
						// Dispatch event to refresh file list
						window.dispatchEvent(
							new CustomEvent('fileCreated', { detail: { folderId } })
						);
						resolve(response);
					} else {
						showPopup({
							header: 'Upload Failed',
							message: 'An error occurred during upload.',
							icon: 'error',
						});
						reject(xhr.statusText);
					}
				};

				// Handle errors
				xhr.onerror = () => {
					setIsUploading(false);
					showPopup({
						header: 'Network Error',
						message: 'Could not connect to server.',
						icon: 'error',
					});
					reject('Network Error');
				};

				// Start the request
				xhr.open('POST', '/api/storage/upload');
				xhr.send(formData);
			});
		},
		[workspace, session, showPopup]
	);

	const downloadFile = useCallback((filePublicId: string) => {
		// Simply point the browser to the download API route
		window.location.href = `/api/storage/download/${filePublicId}`;
	}, []);

	return { uploadFile, downloadFile, progress, isUploading };
}
