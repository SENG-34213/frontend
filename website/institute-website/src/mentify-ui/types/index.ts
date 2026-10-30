export type Language = 'en' | 'ta' | 'si';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export type MaterialCategory =
  | 'Notes'
  | 'Short Notes'
  | 'Past Papers'
  | 'Exam Papers'
  | 'Model Papers'
  | 'Worksheets'
  | 'Question Banks'
  | 'Marking Schemes'
  | 'Revision Packs'
  | 'Study Guides'
  | 'Tutorials'
  | 'Practice Papers'
  | 'Other';

export interface MaterialItem {
  id: string;
  materialId: string;
  title: string;
  description: string;
  category: MaterialCategory;
  subject: string;
  gradeId: string;
  gradeName?: string;
  price: number;
  free: boolean;
  discountPercent?: number;
  finalPrice: number;
  currency: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  thumbnailUrl: string;
  fileFormat?: 'PDF' | 'DOCX' | 'ZIP';
  fileSize?: string;
  pages?: number;
  authorName?: string;
  createdAt?: string;
  downloadCount?: number;
  rating?: number;
  reviewsCount?: number;
}

export interface CourseItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  grade: string;
  gradeId: string;
  subject: string;
  description: string;
  teacher: {
    id: string;
    name: string;
    title: string;
    avatarUrl: string;
    rating: number;
  };
  learningFormat: 'Online Live' | 'Physical Classroom' | 'Hybrid' | 'Self-Paced';
  schedule: string;
  duration: string;
  fee: {
    amount: number;
    currency: string;
    period: 'monthly' | 'term' | 'course';
  };
  availability: 'Enrollment Open' | 'Limited Seats' | 'Waitlist' | 'Closed';
  syllabus: {
    term: string;
    weeks: number;
    topics: string[];
  }[];
  outcomes: string[];
  features: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  thumbnailUrl: string;
  enrolledStudentsCount?: number;
  featured?: boolean;
}

export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  subjects: string[];
  grades: string[];
  bio: string;
  qualifications: string[];
  experienceYears: number;
  coursesCount: number;
  verified: boolean;
  featured?: boolean;
}

export interface AdmissionsFormData {
  studentFullName: string;
  studentInitials: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  studentEmail?: string;
  studentPhone?: string;
  district: string;
  city: string;
  address: string;
  grade: string;
  stream?: string;
  preferredSubjects: string[];
  learningPreference: 'Online Live' | 'Physical Classroom' | 'Hybrid';
  preferredContactMethod: 'WhatsApp' | 'Phone Call' | 'Email';
  previousSchool?: string;
  specialRequests?: string;
  consentAgreed: boolean;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: 'admissions' | 'marketplace' | 'courses' | 'tech_support' | 'partnership' | 'other';
  subject: string;
  message: string;
}

export interface CartItem {
  material: MaterialItem;
  quantity: number;
}

export type OrderPaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'requires_action';

export interface OrderPreparationState {
  orderId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderPaymentStatus;
  checkoutSessionId?: string;
  errorMessage?: string;
}
