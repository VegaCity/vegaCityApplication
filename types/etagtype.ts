export interface EtagType {                
  name: string;                       
  imageUrl?: string;
  bonusRate: number;                      
  amount: number;              
}

export interface EtagTypePost extends EtagType {
  walletTypeId: string;
}
  