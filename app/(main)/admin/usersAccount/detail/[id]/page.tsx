"use client";

import BackButton from "@/components/BackButton";
import UserDetail from "@/components/users/UserDetail";

interface UserDetailProps {
  params: { id: string };
}

const UserDetailPage = ({ params }: UserDetailProps) => {
  const { id: userId } = params;

  if (!userId) {
    return <div>Loading...</div>; // Display loading state while fetching data
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/admin/usersAccount" />
      </div>
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <UserDetail params={{ id: userId }} />
      </div>
    </div>
  );
};

export default UserDetailPage;
