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
			setProgress(1); // Start at 1% to show immediate feedback

			return new Promise((resolve, reject) => {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('workspacePublicId', workspace.publicId); // Pass workspace public ID
				formData.append('userId', session.user.id); // Pass user ID
				if (folderId) {
					formData.append('folderId', folderId.toString());
				}

				const xhr = new XMLHttpRequest();

				// Track Upload Progress
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const percentComplete = (event.loaded / event.total) * 100;
						setProgress(Math.round(percentComplete));
					}
				};

				// Handle Completion
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						// Force 100% on success so UI reflects completion
						setProgress(100);

						try {
							const response = JSON.parse(xhr.responseText);
							showPopup({
								header: 'Upload Complete',
								message: `"${file.name}" uploaded successfully.`,
								icon: 'success',
							});

							// Slight delay to let user see the 100% bar before hiding
							setTimeout(() => {
								setIsUploading(false);
								setProgress(0);

								// Dispatch event to refresh list
								window.dispatchEvent(
									new CustomEvent('fileCreated', { detail: { folderId } })
								);
								resolve(response);
							}, 500);
						} catch (e) {
							setIsUploading(false);
							reject('Invalid server response');
						}
					} else {
						setIsUploading(false);
						showPopup({
							header: 'Upload Failed',
							message: `Server Error: ${xhr.statusText}`,
							icon: 'error',
						});
						reject(xhr.statusText);
					}
				};

				// Handle Errors
				xhr.onerror = () => {
					setIsUploading(false);
					showPopup({
						header: 'Network Error',
						message: 'Connection interrupted.',
						icon: 'error',
					});
					reject('Network Error');
				};

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
