// components/Pagination.tsx

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	return (
		<div className="flex items-center justify-center space-x-2 my-4">
			<Button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				variant="outline"
				className="flex items-center space-x-2"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Previous</span>
			</Button>
			<span>
				Page {currentPage} of {totalPages}
			</span>
			<Button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				variant="outline"
				className="flex items-center space-x-2"
			>
				<span>Next</span>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
