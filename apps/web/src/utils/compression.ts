import pako from 'pako'

const COMPRESSION_THRESHOLD = 100 * 1024 // 100KB

/**
 * Compress content using gzip
 */
export function compressContent(content: string): string {
	try {
		const compressed = pako.deflate(content, { level: 9 })
		return btoa(String.fromCharCode(...compressed))
	} catch (error) {
		console.error('Compression error:', error)
		return content
	}
}

/**
 * Decompress content
 */
export function decompressContent(compressed: string): string {
	try {
		const binary = atob(compressed)
		const bytes = new Uint8Array(binary.length)
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i)
		}
		const decompressed = pako.inflate(bytes, { to: 'string' })
		return decompressed
	} catch (error) {
		console.error('Decompression error:', error)
		return compressed
	}
}

/**
 * Check if content should be compressed
 */
export function shouldCompress(content: string): boolean {
	const size = new Blob([content]).size
	return size > COMPRESSION_THRESHOLD
}

/**
 * Get compression ratio
 */
export function getCompressionRatio(
	original: string,
	compressed: string
): number {
	const originalSize = new Blob([original]).size
	const compressedSize = new Blob([compressed]).size
	return ((originalSize - compressedSize) / originalSize) * 100
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get content size
 */
export function getContentSize(content: string): number {
	return new Blob([content]).size
}
