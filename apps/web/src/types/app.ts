export type UserRole = "user" | "doctor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  doctorProfileId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type Pet = {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  sex: "male" | "female" | "unknown";
  createdAt: string;
  updatedAt: string;
};

export type ConsultationMode = "Clinic" | "Video";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type AvailabilityWindow = {
  start: string;
  end: string;
};

export type DoctorAvailabilityDay = {
  dayOfWeek: DayOfWeek;
  windows: AvailabilityWindow[];
  isActive: boolean;
};

export type DoctorAvailabilityOverride = {
  date: string;
  windows: AvailabilityWindow[];
  isClosed: boolean;
};

export type DoctorBlockedSlot = {
  startsAt: string;
  reason?: string;
};

export type DoctorAvailabilitySlot = {
  startsAt: string;
  label: string;
  isAvailable: boolean;
  status: "available" | "booked" | "blocked" | "past";
};

export type PublicDoctorProfile = {
  id: string;
  slug: string;
  name: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  consultationModes: ConsultationMode[];
  bio: string;
  languages: string[];
  clinic: string;
  location: string;
};

export type DoctorAvailabilityDateView = {
  date: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    location: string;
    consultationModes: ConsultationMode[];
  };
  nextAvailable: string | null;
  slots: DoctorAvailabilitySlot[];
};

export type DoctorAvailabilityManagerView = {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    consultationModes: ConsultationMode[];
  };
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
  blockedSlots: DoctorBlockedSlot[];
  nextAvailable: string | null;
};

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export type BookingStatusEvent = {
  status: BookingStatus;
  changedAt: string;
  actorRole: UserRole;
  actorName: string;
  note?: string;
};

export type Booking = {
  id: string;
  scheduledAt: string;
  consultationMode: ConsultationMode;
  status: BookingStatus;
  notes?: string;
  rejectionReason?: string;
  statusHistory: BookingStatusEvent[];
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    location: string;
  };
  pet: {
    id: string;
    name: string;
    type: string;
    breed?: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

export type AdminOverview = {
  counts: {
    users: number;
    doctors: number;
    pets: number;
    bookings: number;
    pendingBookings: number;
  };
  recentBookings: Booking[];
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: UserRole;
  };
};

export type Conversation = {
  id: string;
  counterpart: {
    id: string;
    name: string;
    role: "doctor" | "user";
    specialization?: string;
    location?: string;
  };
  bookingCount: number;
  lastMessage?: ChatMessage;
  lastActivityAt: string;
};

export type ConversationDetails = {
  details: {
    owner: AuthUser;
    doctor: {
      id: string;
      name: string;
      specialization: string;
      location: string;
      userId: string;
    };
  };
  messages: ChatMessage[];
};

export type NotificationType =
  | "booking"
  | "reminder"
  | "prescription"
  | "system"
  | "payment";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: {
    bookingId?: string;
    prescriptionId?: string;
    status?: string;
  };
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsFeed = {
  items: AppNotification[];
  unreadCount: number;
};

export type PrescriptionMedicine = {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

export type Prescription = {
  id: string;
  diagnosis: string;
  notes?: string;
  followUp?: string;
  medicines: PrescriptionMedicine[];
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    scheduledAt: string;
    status: BookingStatus;
    consultationMode: ConsultationMode;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    location: string;
  };
  pet: {
    id: string;
    name: string;
    type: string;
    breed?: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

export type MedicalHistoryPet = {
  pet: {
    id: string;
    name: string;
    type: string;
    breed?: string;
    age?: number;
    sex: "male" | "female" | "unknown";
  };
  bookings: Booking[];
  prescriptions: Prescription[];
};
