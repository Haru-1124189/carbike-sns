export interface VehicleModel {
  name: string;
  displayName: string;
  type: 'car' | 'motorcycle';
  manufacturer: string;
  generations?: VehicleGeneration[];
}

export interface VehicleGeneration {
  name: string;
  years: string;
  grades: VehicleGrade[];
}

export interface VehicleGrade {
  name: string;
  displayName: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  price?: string;
  fuelEfficiency?: string;
  power?: string;
  torque?: string;
  description?: string;
}

// 後方互換性のため、既存の構造も保持
export interface SimpleVehicleModel {
  name: string;
  displayName: string;
  type: 'car' | 'motorcycle';
}
