import React, { useState, useEffect, ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { ETagServices } from '@/components/services/etagService';
import { ETag } from '@/types/etag';

interface VCardInfo {
  fullName: string;
  phoneNumber: string;
  idNumber: string;
  address: string;
  imageUrl: string;
  etagCode: string;
}

interface EditableVCardProps {
  qrCode: string; // QR code để fetch thông tin ETag
}

const EditableVCard: React.FC<EditableVCardProps> = ({ qrCode }) => {
  const [info, setInfo] = useState<VCardInfo>({
    fullName: '',
    phoneNumber: '',
    idNumber: '',
    address: '',
    imageUrl: '',
    etagCode: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchETagData = async () => {
      try {
        setIsLoading(true);
        const response = await ETagServices.getETags({ page: 1, size: 10 }); // Giả sử API hỗ trợ tìm kiếm bằng QR code
        const etagData = response.data.find((etag: ETag) => etag.qrCode === qrCode);
        
        if (etagData) {
        //   setInfo({
        //     fullName: info.name || '',
        //     phoneNumber: etagData.phone || '',
        //     idNumber: etagData.cccd || '',
        //     imageUrl: etagData.imageUrl || '',
        //     etagCode: etagData.etagCode || '',
        //   });



        } else {
          setError('Không tìm thấy thông tin ETag cho QR code này');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi lấy thông tin ETag');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchETagData();
  }, [qrCode]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEdit = (): void => setIsEditing(!isEditing);

  const handleSave = async (): Promise<void> => {
    // try {
    //   await ETagServices.editEtag(info.etagCode, {
    //     fullName: etagData.name || '',
    //     phoneNumber: etagData.phone || '',
    //     cccd: etagData.cccd || '',
    //     imageUrl: etagData.imageUrl || '',
    //     etagCode: etagData.etagCode || '',
    //   });
      setIsEditing(false);
    // } catch (err) {
    //   setError('Có lỗi xảy ra khi cập nhật thông tin');
    //   console.error(err);
    // }
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-16">
      <div className="relative">
        {info.imageUrl ? (
          <img src={info.imageUrl} alt="Profile" className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Camera size={48} className="text-gray-400" />
          </div>
        )}
        {isEditing && (
          <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full cursor-pointer">
            <Camera size={24} className="text-gray-600" />
            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        )}
      </div>
      <div className="p-6">
        {isEditing ? (
          <>
            <input
              type="text"
              name="fullName"
              value={info.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="tel"
              name="phoneNumber"
              value={info.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              name="idNumber"
              value={info.idNumber}
              onChange={handleChange}
              placeholder="CCCD/PASSPORT"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              name="address"
              value={info.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full mb-2 p-2 border rounded"
            />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">{info.fullName || 'Full Name'}</h2>
            <p className="text-gray-600 mb-1">{info.phoneNumber || 'Phone Number'}</p>
            <p className="text-gray-600 mb-1">{info.idNumber || 'CCCD/PASSPORT'}</p>
            
          </>
        )}
        <button
          onClick={isEditing ? handleSave : toggleEdit}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  );
};

export default EditableVCard;