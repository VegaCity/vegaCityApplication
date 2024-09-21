import Image from 'next/image';
import { useEffect, useState } from 'react';
import { UserServices } from '@/components/services/userServices';
 import { Users } from '@/types/user';
import logo from '../img/logo.png';

const Profile = () => {
    const [user, setUser] = useState<Users | null>(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('userId'); 
        if (!userId) {
            console.error('User ID not found in local storage');
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await UserServices.getUserById(userId);
                setUser(response.data); 
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found.</div>;

    return (
        <div className='container mx-auto p-5'>
            <h1 className='text-2xl font-bold mb-4'>Profile</h1>
            <div className='flex items-center mb-6'>
                <Image src={logo} alt='Logo' width={50} height={50} />
                <h2 className='ml-3 text-xl'>{user.fullName}</h2>
            </div>
            <div className='bg-white rounded-lg shadow-md p-5'>
                <h3 className='text-lg font-semibold mb-2'>Thông tin cá nhân</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Điện thoại:</strong> {user.phoneNumber}</p>
                <p><strong>Địa chỉ:</strong> {user.address}</p>
            </div>
        </div>
    );
};

export default Profile;
