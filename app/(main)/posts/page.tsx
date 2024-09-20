'use client';
import PostsTable from '@/components/posts/PostsTable';
import BackButton from '@/components/BackButton';
import PostsPagination from '@/components/posts/PostsPagination';
import Link from 'next/link';
import { useRouter } from 'next/router';

const PostsPage = () => {
  // Ensure useRouter is used within a component context

  return (
    <>
      <BackButton text='Go Back' link='/' />
      <Link href="/posts">
        Create New Package
      </Link>
      
      <PostsTable />
      <PostsPagination />
    </>
  );
};

export default PostsPage;
