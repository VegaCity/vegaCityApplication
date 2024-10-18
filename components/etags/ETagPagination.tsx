import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Interface phù hợp với API response
interface PaginationMetaData {
  size: number; // Số items trên mỗi trang (10)
  page: number; // Trang hiện tại (1)
  total: number; // Tổng số items (622)
  totalPages: number; // Tổng số trang (63)
}

interface ETagPaginationProps {
  metadata: PaginationMetaData;
  onPageChange: (newPage: number) => void;
}

const ETagPagination: React.FC<ETagPaginationProps> = ({
  metadata: { page, totalPages, size, total },
  onPageChange,
}) => {
  const renderPageNumbers = () => {
    const items = [];
    const maxPagesShow = 5; // Số trang hiển thị tối đa
    let startPage: number;
    let endPage: number;

    if (totalPages <= maxPagesShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesShow / 2) - 1;

      if (page <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesShow;
      } else if (page + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPagesShow + 1;
        endPage = totalPages;
      } else {
        startPage = page - maxPagesBeforeCurrentPage;
        endPage = page + maxPagesAfterCurrentPage;
      }
    }

    // Luôn hiển thị trang đầu
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          onClick={() => onPageChange(1)}
          isActive={page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Thêm dấu ... bên trái
    if (startPage > 2) {
      items.push(
        <PaginationItem key="leftEllipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Thêm các trang ở giữa
    for (
      let i = Math.max(2, startPage);
      i <= Math.min(totalPages - 1, endPage);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={() => onPageChange(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Thêm dấu ... bên phải
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="rightEllipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Thêm trang cuối nếu có nhiều hơn 1 trang
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={() => onPageChange(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="text-sm text-gray-600">
        Showing {(page - 1) * size + 1} to {Math.min(page * size, total)} of{" "}
        {total} results
      </div>
    </div>
  );
};

export default ETagPagination;
