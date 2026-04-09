import { randomUUID } from "node:crypto";
import type { Role } from "../constants/roles";
import { mockDoctors } from "../data/mock-doctors";
import type { AuthenticatedUser } from "../types/auth";
import {
  findNextAvailableSlot,
  formatRelativeAvailability,
  getAvailabilitySlotsForDate,
  getDateKey,
  normalizeAvailabilityOverrides,
  normalizeBlockedSlots,
  normalizeWeeklyAvailability,
  type DoctorAvailabilityDay,
  type DoctorAvailabilityOverride,
  type DoctorBlockedSlot,
  type DoctorAvailabilitySlot,
} from "../utils/doctor-availability";
import { HttpError } from "../utils/http-error";
import { hashPassword, verifyPassword } from "../utils/password";

type StoredUser = AuthenticatedUser & {
  passwordHash: string;
};

export type PetRecord = {
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

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export type BookingStatusHistoryEntry = {
  status: BookingStatus;
  changedAt: string;
  actorRole: Role;
  actorName: string;
  note?: string;
};

export type BookingRecord = {
  id: string;
  userId: string;
  doctorProfileId: string;
  petId: string;
  scheduledAt: string;
  consultationMode: "Clinic" | "Video";
  status: BookingStatus;
  notes?: string;
  rejectionReason?: string;
  statusHistory: BookingStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type BookingView = {
  id: string;
  scheduledAt: string;
  consultationMode: "Clinic" | "Video";
  status: BookingStatus;
  notes?: string;
  rejectionReason?: string;
  statusHistory: BookingStatusHistoryEntry[];
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

export type ChatMessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type ChatMessageView = {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: Role;
  };
};

export type ConversationView = {
  id: string;
  counterpart: {
    id: string;
    name: string;
    role: "doctor" | "user";
    specialization?: string;
    location?: string;
  };
  bookingCount: number;
  lastMessage?: ChatMessageView;
  lastActivityAt: string;
};

export type PrescriptionMedicine = {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

export type PrescriptionRecord = {
  id: string;
  bookingId: string;
  doctorProfileId: string;
  userId: string;
  petId: string;
  diagnosis: string;
  notes?: string;
  followUp?: string;
  medicines: PrescriptionMedicine[];
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PrescriptionView = {
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
    consultationMode: "Clinic" | "Video";
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

export type MedicalHistoryPetView = {
  pet: {
    id: string;
    name: string;
    type: string;
    breed?: string;
    age?: number;
    sex: "male" | "female" | "unknown";
  };
  bookings: BookingView[];
  prescriptions: PrescriptionView[];
};

export type PublicDoctorView = {
  id: string;
  slug: string;
  name: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  consultationModes: Array<"Clinic" | "Video">;
  bio: string;
  languages: string[];
  clinic: string;
  location: string;
};

export type DoctorAvailabilityManagerView = {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    consultationModes: Array<"Clinic" | "Video">;
  };
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
  blockedSlots: DoctorBlockedSlot[];
  nextAvailable: string | null;
};

export type DoctorAvailabilityDateView = {
  date: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    location: string;
    consultationModes: Array<"Clinic" | "Video">;
  };
  nextAvailable: string | null;
  slots: DoctorAvailabilitySlot[];
};

type CreatePetInput = {
  userId: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  sex: "male" | "female" | "unknown";
};

type CreateBookingInput = {
  userId: string;
  doctorProfileId: string;
  petId: string;
  scheduledAt: string;
  consultationMode: "Clinic" | "Video";
  notes?: string;
};

type UpdateBookingStatusInput = {
  bookingId: string;
  doctorProfileId: string;
  status: "accepted" | "rejected" | "completed";
  rejectionReason?: string;
};

type RescheduleBookingInput = {
  bookingId: string;
  userId: string;
  scheduledAt: string;
};

type CancelBookingInput = {
  bookingId: string;
  userId: string;
  reason?: string;
};

type CreateChatMessageInput = {
  actor: AuthenticatedUser;
  conversationId: string;
  content: string;
};

type CreatePrescriptionInput = {
  actor: AuthenticatedUser;
  bookingId: string;
  diagnosis: string;
  notes?: string;
  followUp?: string;
  medicines: PrescriptionMedicine[];
};

type UpdateDoctorAvailabilityInput = {
  doctorProfileId: string;
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
  blockedSlots: DoctorBlockedSlot[];
};

type DoctorAvailabilityRecord = {
  doctorProfileId: string;
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
  blockedSlots: DoctorBlockedSlot[];
  updatedAt: string;
};

const bookingRescheduleCutoffMs = 1000 * 60 * 60 * 12;
const bookingCancellationCutoffMs = 1000 * 60 * 60 * 2;

function createTimestamp() {
  return new Date().toISOString();
}

function createBookingStatusHistoryEntry(input: {
  status: BookingStatus;
  actorRole: Role;
  actorName: string;
  changedAt?: string;
  note?: string;
}) {
  return {
    status: input.status,
    actorRole: input.actorRole,
    actorName: input.actorName,
    changedAt: input.changedAt ?? createTimestamp(),
    note: normalizeOptionalText(input.note),
  } satisfies BookingStatusHistoryEntry;
}

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function sanitizeUser(user: StoredUser): AuthenticatedUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function createSeedUser(input: {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  doctorProfileId?: string;
}) {
  const timestamp = createTimestamp();

  return {
    id: input.id,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: input.role,
    doctorProfileId: input.doctorProfileId,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies StoredUser;
}

const users: StoredUser[] = [
  createSeedUser({
    id: "user-sarah-perera",
    name: "Sarah Perera",
    email: "sarah@petcare.local",
    password: "Owner@123",
    role: "user",
  }),
  createSeedUser({
    id: "doctor-amara-jayasinghe",
    name: "Dr. Amara Jayasinghe",
    email: "amara@petcare.local",
    password: "Doctor@123",
    role: "doctor",
    doctorProfileId: "dr-amara-jayasinghe",
  }),
  createSeedUser({
    id: "doctor-nadeesha-perera",
    name: "Dr. Nadeesha Perera",
    email: "nadeesha@petcare.local",
    password: "Doctor@123",
    role: "doctor",
    doctorProfileId: "dr-nadeesha-perera",
  }),
  createSeedUser({
    id: "admin-platform",
    name: "Platform Admin",
    email: "admin@petcare.local",
    password: "Admin@123",
    role: "admin",
  }),
];

const pets: PetRecord[] = [
  {
    id: "pet-milo",
    userId: "user-sarah-perera",
    name: "Milo",
    type: "Dog",
    breed: "Golden Retriever",
    age: 4,
    sex: "male",
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
  {
    id: "pet-luna",
    userId: "user-sarah-perera",
    name: "Luna",
    type: "Cat",
    breed: "Domestic Shorthair",
    age: 2,
    sex: "female",
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
];

const bookings: BookingRecord[] = [
  {
    id: "booking-seed-1",
    userId: "user-sarah-perera",
    doctorProfileId: "dr-amara-jayasinghe",
    petId: "pet-milo",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    consultationMode: "Video",
    status: "pending",
    notes: "Dry skin patches on both ears for the last week.",
    statusHistory: [
      createBookingStatusHistoryEntry({
        status: "pending",
        actorRole: "user",
        actorName: "Sarah Perera",
      }),
    ],
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
];

const chatMessages: ChatMessageRecord[] = [
  {
    id: "message-seed-1",
    conversationId: "user-sarah-perera__dr-amara-jayasinghe",
    senderId: "user-sarah-perera",
    content: "Hi doctor, I wanted to share a little more detail before the consultation.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "message-seed-2",
    conversationId: "user-sarah-perera__dr-amara-jayasinghe",
    senderId: "doctor-amara-jayasinghe",
    content: "Of course. Please let me know what changes you've noticed with Milo.",
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
];

const prescriptions: PrescriptionRecord[] = [];

const doctorAvailabilityRecords: DoctorAvailabilityRecord[] = mockDoctors.map(
  (doctor) => ({
    doctorProfileId: doctor.id,
    availability: normalizeWeeklyAvailability(doctor.availability),
    availabilityOverrides: normalizeAvailabilityOverrides(
      doctor.availabilityOverrides,
    ),
    blockedSlots: normalizeBlockedSlots(doctor.blockedSlots),
    updatedAt: createTimestamp(),
  }),
);

function findUserRecordById(userId: string) {
  return users.find((user) => user.id === userId);
}

function findDoctorProfile(doctorProfileId: string) {
  return mockDoctors.find((doctor) => doctor.id === doctorProfileId);
}

function findDoctorUserByProfileId(doctorProfileId: string) {
  return users.find(
    (user) => user.role === "doctor" && user.doctorProfileId === doctorProfileId,
  );
}

function findDoctorAvailabilityRecord(doctorProfileId: string) {
  return doctorAvailabilityRecords.find(
    (record) => record.doctorProfileId === doctorProfileId,
  );
}

function getDoctorAvailabilityRecord(doctorProfileId: string) {
  const existingRecord = findDoctorAvailabilityRecord(doctorProfileId);

  if (existingRecord) {
    return existingRecord;
  }

  const doctor = findDoctorProfile(doctorProfileId);

  if (!doctor) {
    return null;
  }

  const record: DoctorAvailabilityRecord = {
    doctorProfileId,
    availability: normalizeWeeklyAvailability(doctor.availability),
    availabilityOverrides: normalizeAvailabilityOverrides(
      doctor.availabilityOverrides,
    ),
    blockedSlots: normalizeBlockedSlots(doctor.blockedSlots),
    updatedAt: createTimestamp(),
  };

  doctorAvailabilityRecords.push(record);
  return record;
}

function findPetRecord(petId: string) {
  return pets.find((pet) => pet.id === petId);
}

function sortBookingsBySchedule(items: BookingRecord[]) {
  return [...items].sort((left, right) =>
    left.scheduledAt.localeCompare(right.scheduledAt),
  );
}

function sortMessagesByCreatedAt(items: ChatMessageRecord[]) {
  return [...items].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

function getActiveBookedSlotStartsForDoctor(
  doctorProfileId: string,
  excludedBookingId?: string,
) {
  return bookings
    .filter(
      (booking) =>
        booking.doctorProfileId === doctorProfileId &&
        booking.id !== excludedBookingId &&
        booking.status !== "rejected" &&
        booking.status !== "cancelled",
    )
    .map((booking) => booking.scheduledAt);
}

function getNextAvailableSummary(doctorProfileId: string) {
  const availabilityRecord = getDoctorAvailabilityRecord(doctorProfileId);

  if (!availabilityRecord) {
    return "No upcoming slots";
  }

  const nextAvailable = findNextAvailableSlot({
    availability: availabilityRecord.availability,
    availabilityOverrides: availabilityRecord.availabilityOverrides,
    blockedSlotStarts: availabilityRecord.blockedSlots.map((slot) => slot.startsAt),
    bookedSlotStarts: getActiveBookedSlotStartsForDoctor(doctorProfileId),
  });

  return nextAvailable
    ? formatRelativeAvailability(nextAvailable)
    : "No upcoming slots";
}

function assertDoctorSlotAvailable(
  doctorProfileId: string,
  scheduledAt: string,
  excludedBookingId?: string,
) {
  const availabilityRecord = getDoctorAvailabilityRecord(doctorProfileId);

  if (!availabilityRecord) {
    throw new HttpError(404, "Selected doctor could not be found.");
  }

  const date = getDateKey(scheduledAt);
  const matchingSlot = getAvailabilitySlotsForDate({
    date,
    availability: availabilityRecord.availability,
    availabilityOverrides: availabilityRecord.availabilityOverrides,
    blockedSlotStarts: availabilityRecord.blockedSlots.map((slot) => slot.startsAt),
    bookedSlotStarts: getActiveBookedSlotStartsForDoctor(
      doctorProfileId,
      excludedBookingId,
    ),
  }).find((slot) => slot.startsAt === scheduledAt);

  if (!matchingSlot) {
    throw new HttpError(
      400,
      "That time is outside the doctor's published availability.",
    );
  }

  if (matchingSlot.status === "blocked") {
    throw new HttpError(409, "That slot has been blocked by the doctor.");
  }

  if (matchingSlot.status === "booked") {
    throw new HttpError(
      409,
      "That time slot is already booked. Please choose a different time.",
    );
  }

  if (matchingSlot.status === "past") {
    throw new HttpError(400, "Bookings must be scheduled in the future.");
  }
}

function getBookingRecordForUser(bookingId: string, userId: string) {
  const booking = bookings.find((candidate) => candidate.id === bookingId);

  if (!booking) {
    throw new HttpError(404, "Booking could not be found.");
  }

  if (booking.userId !== userId) {
    throw new HttpError(403, "You can only manage your own bookings.");
  }

  return booking;
}

function formatScheduleNote(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function createConversationId(userId: string, doctorProfileId: string) {
  return `${userId}__${doctorProfileId}`;
}

function parseConversationId(conversationId: string) {
  const [userId, doctorProfileId] = conversationId.split("__");

  if (!userId || !doctorProfileId) {
    throw new HttpError(400, "Conversation id is invalid.");
  }

  return {
    userId,
    doctorProfileId,
  };
}

function isActiveRelationshipBooking(booking: BookingRecord) {
  return booking.status !== "rejected" && booking.status !== "cancelled";
}

function mapPublicDoctor(doctor: (typeof mockDoctors)[number]): PublicDoctorView {
  return {
    id: doctor.id,
    slug: doctor.slug,
    name: doctor.name,
    specialization: doctor.specialization,
    experienceYears: doctor.experienceYears,
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
    nextAvailable: getNextAvailableSummary(doctor.id),
    consultationModes: doctor.consultationModes,
    bio: doctor.bio,
    languages: doctor.languages,
    clinic: doctor.clinic,
    location: doctor.location,
  };
}

function expandBooking(booking: BookingRecord): BookingView {
  const owner = findUserRecordById(booking.userId);
  const pet = findPetRecord(booking.petId);
  const doctor = findDoctorProfile(booking.doctorProfileId);

  if (!owner || !pet || !doctor) {
    throw new HttpError(500, "Booking references missing related data.");
  }

  return {
    id: booking.id,
    scheduledAt: booking.scheduledAt,
    consultationMode: booking.consultationMode,
    status: booking.status,
    notes: booking.notes,
    rejectionReason: booking.rejectionReason,
    statusHistory: booking.statusHistory,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      location: doctor.location,
    },
    pet: {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
    },
    owner: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
    },
  };
}

function expandChatMessage(message: ChatMessageRecord): ChatMessageView {
  const sender = findUserRecordById(message.senderId);

  if (!sender) {
    throw new HttpError(500, "Message references a missing sender.");
  }

  return {
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    createdAt: message.createdAt,
    sender: {
      id: sender.id,
      name: sender.name,
      role: sender.role,
    },
  };
}

function expandPrescription(prescription: PrescriptionRecord): PrescriptionView {
  const booking = bookings.find(
    (candidateBooking) => candidateBooking.id === prescription.bookingId,
  );
  const owner = findUserRecordById(prescription.userId);
  const pet = findPetRecord(prescription.petId);
  const doctor = findDoctorProfile(prescription.doctorProfileId);

  if (!booking || !owner || !pet || !doctor) {
    throw new HttpError(500, "Prescription references missing related data.");
  }

  return {
    id: prescription.id,
    diagnosis: prescription.diagnosis,
    notes: prescription.notes,
    followUp: prescription.followUp,
    medicines: prescription.medicines,
    issuedAt: prescription.issuedAt,
    createdAt: prescription.createdAt,
    updatedAt: prescription.updatedAt,
    booking: {
      id: booking.id,
      scheduledAt: booking.scheduledAt,
      status: booking.status,
      consultationMode: booking.consultationMode,
    },
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      location: doctor.location,
    },
    pet: {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
    },
    owner: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
    },
  };
}

function getConversationBookings(conversationId: string) {
  const { userId, doctorProfileId } = parseConversationId(conversationId);

  return bookings.filter(
    (booking) =>
      booking.userId === userId &&
      booking.doctorProfileId === doctorProfileId &&
      isActiveRelationshipBooking(booking),
  );
}

function assertConversationAccess(
  actor: AuthenticatedUser,
  conversationId: string,
) {
  const { userId, doctorProfileId } = parseConversationId(conversationId);
  const relatedBookings = getConversationBookings(conversationId);

  if (relatedBookings.length === 0) {
    throw new HttpError(
      403,
      "Chat is only available for active doctor-pet owner booking relationships.",
    );
  }

  if (actor.role === "user" && actor.id !== userId) {
    throw new HttpError(403, "You cannot access this conversation.");
  }

  if (actor.role === "doctor" && actor.doctorProfileId !== doctorProfileId) {
    throw new HttpError(403, "You cannot access this conversation.");
  }

  if (actor.role === "admin") {
    throw new HttpError(403, "Admin users cannot access direct conversations.");
  }

  return {
    userId,
    doctorProfileId,
    relatedBookings,
  };
}

export function getUserById(userId: string) {
  const user = findUserRecordById(userId);
  return user ? sanitizeUser(user) : null;
}

export function getDoctorUserByProfileId(doctorProfileId: string) {
  const user = findDoctorUserByProfileId(doctorProfileId);
  return user ? sanitizeUser(user) : null;
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = users.find((user) => user.email === input.email);

  if (existingUser) {
    throw new HttpError(409, "An account with that email already exists.");
  }

  const timestamp = createTimestamp();
  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash: hashPassword(input.password),
    role: "user",
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  users.push(user);

  return sanitizeUser(user);
}

export function authenticateUser(email: string, password: string) {
  const user = users.find((candidate) => candidate.email === email.toLowerCase());

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new HttpError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new HttpError(403, "This account is currently inactive.");
  }

  return sanitizeUser(user);
}

export function listPublicDoctors() {
  return mockDoctors.map(mapPublicDoctor);
}

export function getPublicDoctorBySlug(slug: string) {
  const doctor = mockDoctors.find((candidate) => candidate.slug === slug);
  return doctor ? mapPublicDoctor(doctor) : null;
}

export function getDoctorAvailabilityForDate(
  doctorProfileId: string,
  date: string,
): DoctorAvailabilityDateView {
  const doctor = findDoctorProfile(doctorProfileId);
  const availabilityRecord = getDoctorAvailabilityRecord(doctorProfileId);

  if (!doctor || !availabilityRecord) {
    throw new HttpError(404, "Doctor could not be found.");
  }

  return {
    date,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      location: doctor.location,
      consultationModes: doctor.consultationModes,
    },
    nextAvailable:
      findNextAvailableSlot({
        availability: availabilityRecord.availability,
        availabilityOverrides: availabilityRecord.availabilityOverrides,
        blockedSlotStarts: availabilityRecord.blockedSlots.map(
          (slot) => slot.startsAt,
        ),
        bookedSlotStarts: getActiveBookedSlotStartsForDoctor(doctorProfileId),
      }) ?? null,
    slots: getAvailabilitySlotsForDate({
      date,
      availability: availabilityRecord.availability,
      availabilityOverrides: availabilityRecord.availabilityOverrides,
      blockedSlotStarts: availabilityRecord.blockedSlots.map((slot) => slot.startsAt),
      bookedSlotStarts: getActiveBookedSlotStartsForDoctor(doctorProfileId),
    }),
  };
}

export function getDoctorAvailability(
  doctorProfileId: string,
): DoctorAvailabilityManagerView {
  const doctor = findDoctorProfile(doctorProfileId);
  const availabilityRecord = getDoctorAvailabilityRecord(doctorProfileId);

  if (!doctor || !availabilityRecord) {
    throw new HttpError(404, "Doctor could not be found.");
  }

  return {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      consultationModes: doctor.consultationModes,
    },
    availability: normalizeWeeklyAvailability(availabilityRecord.availability),
    availabilityOverrides: normalizeAvailabilityOverrides(
      availabilityRecord.availabilityOverrides,
    ),
    blockedSlots: normalizeBlockedSlots(availabilityRecord.blockedSlots),
    nextAvailable:
      findNextAvailableSlot({
        availability: availabilityRecord.availability,
        availabilityOverrides: availabilityRecord.availabilityOverrides,
        blockedSlotStarts: availabilityRecord.blockedSlots.map(
          (slot) => slot.startsAt,
        ),
        bookedSlotStarts: getActiveBookedSlotStartsForDoctor(doctorProfileId),
      }) ?? null,
  };
}

export function updateDoctorAvailability(input: UpdateDoctorAvailabilityInput) {
  const doctor = findDoctorProfile(input.doctorProfileId);
  const availabilityRecord = getDoctorAvailabilityRecord(input.doctorProfileId);

  if (!doctor || !availabilityRecord) {
    throw new HttpError(404, "Doctor could not be found.");
  }

  availabilityRecord.availability = normalizeWeeklyAvailability(input.availability);
  availabilityRecord.availabilityOverrides = normalizeAvailabilityOverrides(
    input.availabilityOverrides,
  );
  availabilityRecord.blockedSlots = normalizeBlockedSlots(input.blockedSlots);
  availabilityRecord.updatedAt = createTimestamp();

  return getDoctorAvailability(input.doctorProfileId);
}

export function listPetsForUser(userId: string) {
  return pets
    .filter((pet) => pet.userId === userId)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function createPet(input: CreatePetInput) {
  const timestamp = createTimestamp();

  const pet: PetRecord = {
    id: randomUUID(),
    userId: input.userId,
    name: input.name.trim(),
    type: input.type.trim(),
    breed: normalizeOptionalText(input.breed),
    age: input.age,
    sex: input.sex,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  pets.push(pet);

  return pet;
}

export function createBooking(input: CreateBookingInput) {
  const owner = findUserRecordById(input.userId);

  if (!owner) {
    throw new HttpError(404, "Booking owner could not be found.");
  }

  const doctor = findDoctorProfile(input.doctorProfileId);

  if (!doctor) {
    throw new HttpError(404, "Selected doctor could not be found.");
  }

  const pet = findPetRecord(input.petId);

  if (!pet || pet.userId !== input.userId) {
    throw new HttpError(404, "Selected pet could not be found.");
  }

  if (!doctor.consultationModes.includes(input.consultationMode)) {
    throw new HttpError(
      400,
      `${doctor.name} does not currently offer ${input.consultationMode.toLowerCase()} consultations.`,
    );
  }

  const scheduledDate = new Date(input.scheduledAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    throw new HttpError(400, "Booking date is invalid.");
  }

  if (scheduledDate.getTime() < Date.now()) {
    throw new HttpError(400, "Bookings must be scheduled in the future.");
  }

  const normalizedScheduledAt = scheduledDate.toISOString();
  assertDoctorSlotAvailable(doctor.id, normalizedScheduledAt);

  const timestamp = createTimestamp();
  const booking: BookingRecord = {
    id: randomUUID(),
    userId: input.userId,
    doctorProfileId: doctor.id,
    petId: pet.id,
    scheduledAt: normalizedScheduledAt,
    consultationMode: input.consultationMode,
    status: "pending",
    notes: normalizeOptionalText(input.notes),
    statusHistory: [
      createBookingStatusHistoryEntry({
        status: "pending",
        actorRole: owner.role,
        actorName: owner.name,
        changedAt: timestamp,
      }),
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  bookings.push(booking);

  return expandBooking(booking);
}

export function listBookingsForUser(userId: string) {
  return sortBookingsBySchedule(
    bookings.filter((booking) => booking.userId === userId),
  ).map(expandBooking);
}

export function listBookingsForDoctor(doctorProfileId: string) {
  return sortBookingsBySchedule(
    bookings.filter((booking) => booking.doctorProfileId === doctorProfileId),
  ).map(expandBooking);
}

export function listAllBookings() {
  return sortBookingsBySchedule(bookings).map(expandBooking);
}

export function updateBookingStatus(input: UpdateBookingStatusInput) {
  const booking = bookings.find((candidate) => candidate.id === input.bookingId);

  if (!booking) {
    throw new HttpError(404, "Booking could not be found.");
  }

  if (booking.doctorProfileId !== input.doctorProfileId) {
    throw new HttpError(403, "You can only manage your own bookings.");
  }

  if (input.status === "accepted" && booking.status !== "pending") {
    throw new HttpError(400, "Only pending bookings can be accepted.");
  }

  if (input.status === "rejected" && booking.status !== "pending") {
    throw new HttpError(400, "Only pending bookings can be rejected.");
  }

  if (input.status === "completed" && booking.status !== "accepted") {
    throw new HttpError(400, "Only accepted bookings can be marked completed.");
  }

  const doctor = findDoctorUserByProfileId(input.doctorProfileId);

  if (!doctor) {
    throw new HttpError(404, "Doctor account could not be found.");
  }

  booking.status = input.status;
  booking.rejectionReason =
    input.status === "rejected"
      ? normalizeOptionalText(input.rejectionReason)
      : undefined;
  booking.updatedAt = createTimestamp();
  booking.statusHistory.push(
    createBookingStatusHistoryEntry({
      status: input.status,
      actorRole: doctor.role,
      actorName: doctor.name,
      changedAt: booking.updatedAt,
      note:
        input.status === "rejected"
          ? input.rejectionReason
          : input.status === "completed"
            ? "Consultation marked as completed."
            : "Booking accepted by doctor.",
    }),
  );

  return expandBooking(booking);
}

export function rescheduleBooking(input: RescheduleBookingInput) {
  const booking = getBookingRecordForUser(input.bookingId, input.userId);

  if (booking.status !== "pending" && booking.status !== "accepted") {
    throw new HttpError(
      400,
      "Only pending or accepted bookings can be rescheduled.",
    );
  }

  if (new Date(booking.scheduledAt).getTime() - Date.now() < bookingRescheduleCutoffMs) {
    throw new HttpError(
      400,
      "Bookings can only be rescheduled at least 12 hours before the appointment.",
    );
  }

  const owner = findUserRecordById(input.userId);

  if (!owner) {
    throw new HttpError(404, "Booking owner could not be found.");
  }

  const nextScheduledDate = new Date(input.scheduledAt);

  if (Number.isNaN(nextScheduledDate.getTime())) {
    throw new HttpError(400, "Booking date is invalid.");
  }

  if (nextScheduledDate.getTime() < Date.now()) {
    throw new HttpError(400, "Bookings must be scheduled in the future.");
  }

  const normalizedScheduledAt = nextScheduledDate.toISOString();

  if (normalizedScheduledAt === booking.scheduledAt) {
    throw new HttpError(400, "Choose a different slot before rescheduling.");
  }

  assertDoctorSlotAvailable(
    booking.doctorProfileId,
    normalizedScheduledAt,
    booking.id,
  );

  const previousScheduledAt = booking.scheduledAt;
  const requiresReconfirmation = booking.status === "accepted";
  booking.scheduledAt = normalizedScheduledAt;
  booking.status = requiresReconfirmation ? "pending" : booking.status;
  booking.updatedAt = createTimestamp();
  booking.statusHistory.push(
    createBookingStatusHistoryEntry({
      status: booking.status,
      actorRole: owner.role,
      actorName: owner.name,
      changedAt: booking.updatedAt,
      note:
        requiresReconfirmation
          ? `Rescheduled from ${formatScheduleNote(previousScheduledAt)} to ${formatScheduleNote(normalizedScheduledAt)}. Doctor confirmation is required again.`
          : `Rescheduled from ${formatScheduleNote(previousScheduledAt)} to ${formatScheduleNote(normalizedScheduledAt)}.`,
    }),
  );

  return expandBooking(booking);
}

export function cancelBooking(input: CancelBookingInput) {
  const booking = getBookingRecordForUser(input.bookingId, input.userId);

  if (booking.status !== "pending" && booking.status !== "accepted") {
    throw new HttpError(400, "Only pending or accepted bookings can be cancelled.");
  }

  if (new Date(booking.scheduledAt).getTime() - Date.now() < bookingCancellationCutoffMs) {
    throw new HttpError(
      400,
      "Bookings can only be cancelled at least 2 hours before the appointment.",
    );
  }

  const owner = findUserRecordById(input.userId);

  if (!owner) {
    throw new HttpError(404, "Booking owner could not be found.");
  }

  booking.status = "cancelled";
  booking.updatedAt = createTimestamp();
  booking.statusHistory.push(
    createBookingStatusHistoryEntry({
      status: "cancelled",
      actorRole: owner.role,
      actorName: owner.name,
      changedAt: booking.updatedAt,
      note:
        normalizeOptionalText(input.reason) ??
        "Booking cancelled by the pet owner before the appointment.",
    }),
  );

  return expandBooking(booking);
}

export function getAdminOverview() {
  const userAccounts = users.filter((user) => user.role === "user").length;
  const doctorAccounts = users.filter((user) => user.role === "doctor").length;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  return {
    counts: {
      users: userAccounts,
      doctors: doctorAccounts,
      pets: pets.length,
      bookings: bookings.length,
      pendingBookings,
    },
    recentBookings: listAllBookings().slice(-10).reverse(),
  };
}

export function listConversationsForActor(actor: AuthenticatedUser) {
  const relatedBookings = bookings.filter((booking) => {
    if (!isActiveRelationshipBooking(booking)) {
      return false;
    }

    if (actor.role === "user") {
      return booking.userId === actor.id;
    }

    if (actor.role === "doctor") {
      return booking.doctorProfileId === actor.doctorProfileId;
    }

    return false;
  });

  const uniqueConversationIds = Array.from(
    new Set(
      relatedBookings.map((booking) =>
        createConversationId(booking.userId, booking.doctorProfileId),
      ),
    ),
  );

  const mappedConversations: Array<ConversationView | null> = uniqueConversationIds.map(
    (conversationId) => {
      const { userId, doctorProfileId } = parseConversationId(conversationId);
      const owner = findUserRecordById(userId);
      const doctor = findDoctorProfile(doctorProfileId);
      const relatedConversationBookings = getConversationBookings(conversationId);
      const lastMessage = sortMessagesByCreatedAt(
        chatMessages.filter((message) => message.conversationId === conversationId),
      ).at(-1);

      if (!owner || !doctor || relatedConversationBookings.length === 0) {
        return null;
      }

      const counterpart =
        actor.role === "user"
          ? {
              id: doctor.id,
              name: doctor.name,
              role: "doctor" as const,
              specialization: doctor.specialization,
              location: doctor.location,
            }
          : {
              id: owner.id,
              name: owner.name,
              role: "user" as const,
            };

      const latestBooking = sortBookingsBySchedule(relatedConversationBookings).at(-1);
      const lastActivityAt =
        lastMessage?.createdAt ?? latestBooking?.updatedAt ?? createTimestamp();

      return {
        id: conversationId,
        counterpart,
        bookingCount: relatedConversationBookings.length,
        lastMessage: lastMessage ? expandChatMessage(lastMessage) : undefined,
        lastActivityAt,
      } satisfies ConversationView;
    },
  );

  return mappedConversations
    .filter((conversation): conversation is ConversationView => conversation !== null)
    .sort((left, right) => right.lastActivityAt.localeCompare(left.lastActivityAt));
}

export function listMessagesForConversation(
  actor: AuthenticatedUser,
  conversationId: string,
) {
  assertConversationAccess(actor, conversationId);

  return sortMessagesByCreatedAt(
    chatMessages.filter((message) => message.conversationId === conversationId),
  ).map(expandChatMessage);
}

export function createChatMessage(input: CreateChatMessageInput) {
  const { actor, conversationId } = input;
  const { userId, doctorProfileId } = assertConversationAccess(actor, conversationId);
  const normalizedContent = input.content.trim();

  if (!normalizedContent) {
    throw new HttpError(400, "Message content is required.");
  }

  if (actor.role === "user" && actor.id !== userId) {
    throw new HttpError(403, "You cannot send messages in this conversation.");
  }

  if (actor.role === "doctor" && actor.doctorProfileId !== doctorProfileId) {
    throw new HttpError(403, "You cannot send messages in this conversation.");
  }

  const message: ChatMessageRecord = {
    id: randomUUID(),
    conversationId,
    senderId: actor.id,
    content: normalizedContent,
    createdAt: createTimestamp(),
  };

  chatMessages.push(message);

  return expandChatMessage(message);
}

export function buildConversationIdForDoctorAndUser(
  userId: string,
  doctorProfileId: string,
) {
  return createConversationId(userId, doctorProfileId);
}

export function getConversationDetails(conversationId: string) {
  const { userId, doctorProfileId } = parseConversationId(conversationId);
  const owner = findUserRecordById(userId);
  const doctor = findDoctorProfile(doctorProfileId);
  const doctorUser = findDoctorUserByProfileId(doctorProfileId);

  if (!owner || !doctor || !doctorUser) {
    throw new HttpError(404, "Conversation could not be resolved.");
  }

  return {
    owner: sanitizeUser(owner),
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      location: doctor.location,
      userId: doctorUser.id,
    },
  };
}

function getBookingForDoctor(doctorProfileId: string, bookingId: string) {
  const booking = bookings.find((candidateBooking) => candidateBooking.id === bookingId);

  if (!booking) {
    throw new HttpError(404, "Booking could not be found.");
  }

  if (booking.doctorProfileId !== doctorProfileId) {
    throw new HttpError(403, "You can only access prescriptions for your own bookings.");
  }

  return booking;
}

export function createPrescription(input: CreatePrescriptionInput) {
  const booking = bookings.find((candidateBooking) => candidateBooking.id === input.bookingId);

  if (!booking) {
    throw new HttpError(404, "Booking could not be found.");
  }

  if (input.actor.role !== "doctor" || input.actor.doctorProfileId !== booking.doctorProfileId) {
    throw new HttpError(403, "You can only issue prescriptions for your own bookings.");
  }

  if (!["accepted", "completed"].includes(booking.status)) {
    throw new HttpError(
      400,
      "Prescriptions can only be issued for accepted or completed bookings.",
    );
  }

  const normalizedDiagnosis = input.diagnosis.trim();

  if (!normalizedDiagnosis) {
    throw new HttpError(400, "Diagnosis is required.");
  }

  const normalizedMedicines = input.medicines
    .map((medicine) => ({
      name: medicine.name.trim(),
      dosage: normalizeOptionalText(medicine.dosage),
      frequency: normalizeOptionalText(medicine.frequency),
      duration: normalizeOptionalText(medicine.duration),
      instructions: normalizeOptionalText(medicine.instructions),
    }))
    .filter((medicine) => medicine.name);

  if (normalizedMedicines.length === 0) {
    throw new HttpError(400, "At least one medicine is required.");
  }

  const timestamp = createTimestamp();
  const prescription: PrescriptionRecord = {
    id: randomUUID(),
    bookingId: booking.id,
    doctorProfileId: booking.doctorProfileId,
    userId: booking.userId,
    petId: booking.petId,
    diagnosis: normalizedDiagnosis,
    notes: normalizeOptionalText(input.notes),
    followUp: normalizeOptionalText(input.followUp),
    medicines: normalizedMedicines,
    issuedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  prescriptions.push(prescription);

  return expandPrescription(prescription);
}

export function listPrescriptionsForUser(userId: string) {
  return prescriptions
    .filter((prescription) => prescription.userId === userId)
    .sort((left, right) => right.issuedAt.localeCompare(left.issuedAt))
    .map(expandPrescription);
}

export function listPrescriptionsForDoctor(doctorProfileId: string) {
  return prescriptions
    .filter((prescription) => prescription.doctorProfileId === doctorProfileId)
    .sort((left, right) => right.issuedAt.localeCompare(left.issuedAt))
    .map(expandPrescription);
}

export function listPrescriptionsForBooking(
  doctorProfileId: string,
  bookingId: string,
) {
  getBookingForDoctor(doctorProfileId, bookingId);

  return prescriptions
    .filter((prescription) => prescription.bookingId === bookingId)
    .sort((left, right) => right.issuedAt.localeCompare(left.issuedAt))
    .map(expandPrescription);
}

export function getMedicalHistoryForUser(userId: string) {
  const userPets = listPetsForUser(userId);

  return userPets.map((pet) => {
    const petBookings = sortBookingsBySchedule(
      bookings.filter(
        (booking) =>
          booking.userId === userId &&
          booking.petId === pet.id &&
          booking.status !== "rejected" &&
          booking.status !== "cancelled",
      ),
    ).map(expandBooking);

    const petPrescriptions = prescriptions
      .filter(
        (prescription) => prescription.userId === userId && prescription.petId === pet.id,
      )
      .sort((left, right) => right.issuedAt.localeCompare(left.issuedAt))
      .map(expandPrescription);

    return {
      pet: {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        sex: pet.sex,
      },
      bookings: petBookings,
      prescriptions: petPrescriptions,
    } satisfies MedicalHistoryPetView;
  });
}
