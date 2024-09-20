'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import Link from 'next/link';
import posts from '@/data/posts';
import { Post } from '@/types/posts';
import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { PackageServices } from '@/components/services/packageServices';
import { Packages } from '@/types/package';

interface PostsTableProps {
  limit?: number;
  title?: string;
}

const PostsTable = ({ limit, title }: PostsTableProps) => {
  const [packageList, setPackageList] = useState<Packages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sort posts in dec order based on date
  const sortedPosts: Post[] = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter posts to limit
  const filteredPosts = limit ? sortedPosts.slice(0, limit) : sortedPosts;

  useEffect(() => {
    // setIsLoading(true);
    // PackageServices.getPackages({page: 1, size: 10}).then((res) => {
    //   setPackageList(res.data);
    //   console.log(res.data, "res Data")
    //   setIsLoading(false);
    // }).catch((err) => setError(err));
    
    setIsLoading(true);
    const fetchPackages = async () => {
      try {
        const response = await PackageServices.getPackages({ page: 1, size: 10 });
        setPackageList(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchPackages();

  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  console.log(packageList, "package List")


  return (
    <div className='mt-10'>
      <h3 className='text-2xl mb-4 font-semibold'>{title ? title : 'Packages'}</h3>
      <Table>
        <TableCaption>A list of recent posts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className='hidden md:table-cell'>Author</TableHead>
            <TableHead className='hidden md:table-cell text-right'>
              Date
            </TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell className='hidden md:table-cell'>
                {post.author}
              </TableCell>
              <TableCell className='text-right hidden md:table-cell'>
                {post.date}
              </TableCell>
              <TableCell>
                <Link href={`/posts/edit/${post.id}`}>
                  <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs pr-3'>
                    Edit
                  </button>
                </Link>
                <Link href={`/posts/edit/${post.id}`}>
                  <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs'>
                    Delete
                  </button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PostsTable;
