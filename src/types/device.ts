export interface FeatureLocks {
  camera: boolean;
  network: boolean;
  wifi: boolean;
  powerOff: boolean;
  reset: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  lastUpdated: Date;
}

export interface PaymentRecord {
  id: string;
  emiNumber: number;
  amount: number;
  paidDate: string;
  transactionId: string;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card';
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface EMIDetails {
  totalAmount: number;
  emiAmount: number;
  tenure: number;
  paidEmis: number;
  nextDueDate: string;
  financeName: string;
  paymentHistory: PaymentRecord[];
}

export interface Device {
  id: string;
  customerName: string;
  customerEmail?: string;
  mobileNo: string;
  aadharNo: string;
  address: string;
  imei1: string;
  imei2: string;
  deviceModel: string;
  isLocked: boolean;
  location: Location;
  featureLocks: FeatureLocks;
  emiDetails: EMIDetails;
  registeredAt: Date;
  qrCodeData: string;
  isTracking?: boolean;
  permissionsGranted?: boolean;
  serverIp?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
