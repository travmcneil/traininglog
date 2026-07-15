export interface ShoeDto {
  id: number;
  name: string;
  dateAcquired: string;
  retired: boolean;
  totalMileage: number;
}

export interface CreateShoeDto {
  name: string;
  dateAcquired: string;
  retired: boolean;
}
