import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/core';

const NewsletterSchema = z.object({
	email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const result = NewsletterSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{
					error: 'Invalid email address',
					details: result.error.issues,
				},
				{ status: 400 }
			);
		}

		const { email } = result.data;

		// TODO: Integrate with email service (Mailchimp, ConvertKit, etc.)
		// For now, just log the subscription
		logger.info('Newsletter subscription', { email });

		// Return success response
		return NextResponse.json(
			{
				success: true,
				message: 'Successfully subscribed to newsletter',
			},
			{ status: 200 }
		);
	} catch (error) {
		logger.error(
			'Newsletter subscription error',
			error instanceof Error ? error : new Error('Unknown error')
		);

		return NextResponse.json(
			{
				error: 'Failed to process subscription',
			},
			{ status: 500 }
		);
	}
}
