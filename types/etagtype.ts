export interface EtagType {   
  id: string;             
  name: string;                       
  imageUrl?: string;
  bonusRate: number;                      
  amount: number;              
}

export interface EtagTypePost extends EtagType {
  walletTypeId: string;
}
  