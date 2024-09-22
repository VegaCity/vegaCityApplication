import React, { useEffect, useState } from 'react';
import { UserServices } from '@/components/services/userServices';
import { Users } from '@/types/user';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found in local storage');
        }
        const response = await UserServices.getUserById(userId);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data found</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.fullName}</p>
      <p>Email: {user.email}</p>
      
    </div>
  );
};

export default ProfilePage;