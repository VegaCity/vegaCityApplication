export interface EtagType {              
  name: string;                       
  imageUrl?: string;
  bonusRate: number;                      
  amount: number;              
}

export interface EtagTypePost {
  name: string;                       
  imageUrl?: string;
  bonusRate: number;                      
  amount: number;  
  walletTypeId: string;
}
  