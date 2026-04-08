import { randomUUID } from "node:crypto";
import type { Role } from "../constants/roles";
import { mockDoctors } from "../data/mock-doctors";
import type { AuthenticatedUser } from "../types/auth";
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

function createTimestamp() {
  return new Date().toISOString();
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
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
];

function findUserRecordById(userId: string) {
  return users.find((user) => user.id === userId);
}

function findDoctorProfile(doctorProfileId: string) {
  return mockDoctors.find((doctor) => doctor.id === doctorProfileId);
}

function findPetRecord(petId: string) {
  return pets.find((pet) => pet.id === petId);
}

function sortBookingsBySchedule(items: BookingRecord[]) {
  return [...items].sort((left, right) =>
    left.scheduledAt.localeCompare(right.scheduledAt),
  );
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

export function getUserById(userId: string) {
  const user = findUserRecordById(userId);
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
  const conflictingBooking = bookings.find(
    (booking) =>
      booking.doctorProfileId === doctor.id &&
      booking.scheduledAt === normalizedScheduledAt &&
      booking.status !== "rejected" &&
      booking.status !== "cancelled",
  );

  if (conflictingBooking) {
    throw new HttpError(
      409,
      "That time slot is already booked. Please choose a different time.",
    );
  }

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

  booking.status = input.status;
  booking.rejectionReason =
    input.status === "rejected"
      ? normalizeOptionalText(input.rejectionReason)
      : undefined;
  booking.updatedAt = createTimestamp();

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
