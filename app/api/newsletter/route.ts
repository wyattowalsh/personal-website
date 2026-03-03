import { z } from 'zod';
import { ApiError, api as coreApi, logger } from '@/lib/core';

const NewsletterSchema = z.object({
	email: z.string().email('Invalid email address'),
});

export const POST = coreApi.middleware.withErrorHandler(
	async (request: Request) => {
		const { email } = await coreApi.middleware.validateRequest(request, NewsletterSchema);

		// Newsletter integration not yet implemented
		logger.warning('Newsletter subscription attempted but service not configured', { email });

		throw new ApiError(501, 'Newsletter service is not yet available');
	},
);
