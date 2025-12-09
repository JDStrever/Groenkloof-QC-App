

export enum View {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  RUN_SETUP = 'RUN_SETUP',
  QC_LIST = 'QC_LIST',
  QC_RUN = 'QC_RUN',
  PLAAS_SETUP = 'PLAAS_SETUP',
  ONTVANGS_QC_LIST = 'ONTVANGS_QC_LIST',
  ONTVANGS_QC = 'ONTVANGS_QC',
  SIZING = 'SIZING',
  CARTON_WEIGHTS = 'CARTON_WEIGHTS',
  CARTON_EVALUATION = 'CARTON_EVALUATION',
  CLASS_EVALUATION = 'CLASS_EVALUATION',
  QUALITY_SUMMARY = 'QUALITY_SUMMARY',
  FINAL_PALLET_QC = 'FINAL_PALLET_QC',
  SHELF_LIFE = 'SHELF_LIFE',
  ADMIN = 'ADMIN',
  ADMIN_COMMODITIES = 'ADMIN_COMMODITIES',
  ADMIN_CARTONS = 'ADMIN_CARTONS',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_RUN_INFO = 'ADMIN_RUN_INFO',
  ADMIN_DATA = 'ADMIN_DATA',
  MRL = 'MRL',
  MRL_LIST = 'MRL_LIST',
  MRL_ADD = 'MRL_ADD',
  REKORDS = 'REKORDS',
  REKORDS_RUN_LIST = 'REKORDS_RUN_LIST',
  REKORDS_RUN_DETAILS = 'REKORDS_RUN_DETAILS',
  REKORDS_ONTVANGS_LIST = 'REKORDS_ONTVANGS_LIST',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Password is now optional for type safety when handling user objects
  permissions: View[];
}

export type SizingData = {
  [sizeCode: string]: (number | '')[];
};

export type ApprovalStatus = 'pending' | 'approved';

export interface ApprovalDetails {
  status: ApprovalStatus;
  approvedBy?: string;
}

export interface SizingEntry {
  id: string;
  timestamp: string;
  data: SizingData;
  approvalDetails: ApprovalDetails;
}

export interface Size {
  code: string;
  diameterRange: string;
  min: number | '';
  max: number | '';
}

export type CommodityData = { [commodity: string]: Size[] };

export interface CartonWeightSample {
  id: string;
  size: string;
  class: string;
  boxType: string;
  weights: (number | '')[];
  photo?: string;
}

export interface CartonWeightsEntry {
  id: string;
  timestamp: string;
  samples: CartonWeightSample[];
  approvalDetails: ApprovalDetails;
}

export type EvaluationDefects = {
  [defectName: string]: {
    klas1: number | '';
    klas2: number | '';
    klas3: number | '';
  };
};

export interface CustomEvaluationDefect {
  name: string;
  counts: {
    klas1: number | '';
    klas2: number | '';
    klas3: number | '';
  };
}


export interface CartonEvaluationSample {
  id: string;
  size: string;
  class: string;
  boxType: string;
  sampleSize: number | '';
  counts: {
    vsa: number | '';
    klas1: number | '';
    klas2: number | '';
    klas3: number | '';
  };
  defects?: EvaluationDefects;
  customDefects?: CustomEvaluationDefect[];
  photos?: string[]; // Legacy
  classPhotos?: { [key: string]: string[] };
  defectPhotos?: string[];
}

export interface CartonEvaluationEntry {
  id: string;
  timestamp: string;
  samples: CartonEvaluationSample[];
  approvalDetails: ApprovalDetails;
}


export interface ClassEvaluationSample {
  id: string;
  size: string;
  class: string;
  sampleSize: number | '';
  counts: {
    vsa: number | '';
    klas1: number | '';
    klas2: number | '';
    klas3: number | '';
  };
  defects?: EvaluationDefects;
  customDefects?: CustomEvaluationDefect[];
  photos?: string[]; // Legacy
  classPhotos?: { [key: string]: string[] };
  defectPhotos?: string[];
}

export interface ClassEvaluationEntry {
    id: string;
    timestamp: string;
    samples: ClassEvaluationSample[];
    approvalDetails: ApprovalDetails;
}


export interface BoxType {
  name: string;
  minWeight: number | '';
  maxWeight: number | '';
}

export interface CartonConfig {
  classes: string[];
  boxTypes: {
    [commodity: string]: BoxType[];
  };
}


export interface FinalPalletQcPhotoData {
  base: string | null;
  id: string | null;
  boxLabel: string | null;
  wholePallet: string | null;
}

export interface FinalPalletQcData {
  id: string;
  size: string;
  class: string;
  boxType: string;
  photos: FinalPalletQcPhotoData;
}

export interface FinalPalletQcEntry {
    id: string;
    timestamp: string;
    pallets: FinalPalletQcData[];
    approvalDetails: ApprovalDetails;
}

export interface ShelfLifeCheck {
    date: string;
    checkedBy: string;
    notes?: string;
}

export interface ShelfLifeBucket {
    id: string;
    size: string;
    class: string;
    boxType: string;
    phoneNumber: string;
    startDate: string;
    checks: ShelfLifeCheck[];
    status: 'active' | 'completed';
    completedDate?: string;
}


export interface Run {
  id: string;
  runNumber: string;
  puc: string;
  farmName: string;
  boord: string;
  exporter: string;
  commodity: string;
  variety: string;
  sizingData?: SizingEntry[];
  cartonWeights?: CartonWeightsEntry[];
  cartonEvaluations?: CartonEvaluationEntry[];
  classEvaluations?: ClassEvaluationEntry[];
  finalPalletQc?: FinalPalletQcEntry[];
  shelfLifeBuckets?: ShelfLifeBucket[];
}

export type ExternalQualityData = {
  [className: string]: number | '';
};

export type DefectsData = {
  [defectName: string]: number | '';
};

export interface InternalQualityData {
  totalMass: number | '';
  peelMass: number | '';
  juiceMass: number | '';
  juicePercentage: number | '';
  brix: number | '';
  titration: number | '';
  acid: number | '';
  relation: number | '';
  seeds: number | '';
  fruitsUsedForSeeds?: number | '';
}

export type InternalQualityDataKey = keyof InternalQualityData;


export interface Delivery {
  id: string;
  deliveryNote: string;
  dateReceived: string;
  puc: string;
  farmName: string;
  boord: string;
  exporter: string;
  commodity: string;
  variety: string;
  externalQuality?: ExternalQualityData;
  defects?: DefectsData;
  internalQuality?: InternalQualityData;
  sizeCounts?: { [sizeCode: string]: number | '' };
  inspectionCompletedDate?: string;
  photos?: string[]; // Legacy photos
  externalQualityPhotos?: { [className: string]: string[] };
  defectsPhotos?: string[];
}

export interface MrlResidues {
  d24: number | '';
  imazalil: number | '';
  pyrimethanil: number | '';
  thiabendazole: number | '';
}

export interface CustomMrlResidue {
  name: string;
  value: number | '';
}

export interface MrlRecord {
  id: string;
  customerRef: string;
  producer: string;
  puc: string;
  phc: string;
  orchard: string;
  dateCaptured: string;
  commodity: string;
  variety: string;
  residues: MrlResidues;
  customResidues?: CustomMrlResidue[];
  labReportPdf: string | null; // Base64 encoded PDF
}

export interface RunConfig {
  pucOptions: string[];
  farmNameOptions: string[];
  boordOptions: string[];
  exporterOptions: string[];
  varietyOptions: string[];
}