import React from 'react';
import { Button } from "@components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center mt-4 w-full mb-8">
            <Button
                className="bg-white text-black hover:bg-white outline-1 hover:outline m-1"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
            >
                {"< Previous"}
            </Button>
            {Array.from({ length: totalPages },
                (
                    _,
                    index
                ) => (
                    <Button
                        variant="outline"
                        key={index}
                        onClick={() => onPageChange(index)}
                        className={
                            currentPage === index
                                ? 'bg-white hover:bg-white text-black outline outline-1 m-1'
                                : 'bg-white hover:bg-white text-black outline-1 hover:outline m-1'
                        }
                    >
                        {index + 1}
                    </Button>
                )
            )}
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="bg-white text-black hover:bg-white outline-1 hover:outline m-1"
            >
                {"Next >"}
            </Button>
        </div>
    );
};

export default Pagination;
