import { randomUUID } from "node:crypto";
import type { Role } from "../constants/roles";
import { isDatabaseConnected } from "../config/database";
import { mockDoctors } from "../data/mock-doctors";
import { Booking } from "../models/booking.model";
import { Message } from "../models/message.model";
import { Pet } from "../models/pet.model";
import { Prescription } from "../models/prescription.model";
import { User } from "../models/user.model";
import type { AuthenticatedUser } from "../types/auth";
import { HttpError } from "../utils/http-error";
import { hashPassword, verifyPassword } from "../utils/password";
import * as demoStore from "./demo-store";
import type {
  BookingRecord,
  BookingStatus,
  BookingStatusHistoryEntry,
  BookingView,
  ChatMessageRecord,
  ChatMessageView,
  ConversationView,
  MedicalHistoryPetView,
  PetRecord,
  PrescriptionMedicine,
  PrescriptionRecord,
  PrescriptionView,
} from "./demo-store";

type DbUser = {
  appId: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  doctorProfileId?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type DbPet = {
  appId: string;
  userAppId: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  sex: "male" | "female" | "unknown";
  createdAt: Date | string;
  updatedAt: Date | string;
};

type DbBooking = {
  appId: string;
  userAppId: string;
  doctorProfileId: string;
  petAppId: string;
  scheduledAt: Date | string;
  consultationMode: "Clinic" | "Video";
  status: BookingStatus;
  notes?: string;
  rejectionReason?: string;
  statusHistory: Array<{
    status: BookingStatus;
    changedAt: Date | string;
    actorRole: Role;
    actorName: string;
    note?: string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type DbMessage = {
  appId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  bookingId?: string;
  content: string;
  sentAt?: Date | string;
  createdAt: Date | string;
};

type DbPrescription = {
  appId: string;
  doctorProfileId: string;
  userAppId: string;
  petAppId: string;
  bookingAppId: string;
  diagnosis: string;
  notes?: string;
  followUp?: string;
  medicines: PrescriptionMedicine[];
  issuedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type CreatePetInput = Parameters<typeof demoStore.createPet>[0];
type CreateBookingInput = Parameters<typeof demoStore.createBooking>[0];
type UpdateBookingStatusInput = Parameters<typeof demoStore.updateBookingStatus>[0];
type CreateChatMessageInput = Parameters<typeof demoStore.createChatMessage>[0];
type CreatePrescriptionInput = Parameters<typeof demoStore.createPrescription>[0];

function createTimestamp() {
  return new Date().toISOString();
}

function toIso(value: Date | string | undefined) {
  if (!value) {
    return createTimestamp();
  }

  return new Date(value).toISOString();
}

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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

function createConversationId(userId: string, doctorProfileId: string) {
  return `${userId}__${doctorProfileId}`;
}

function parseConversationId(conversationId: string) {
  const [userId, doctorProfileId] = conversationId.split("__");

  if (!userId || !doctorProfileId) {
    throw new HttpError(400, "Conversation id is invalid.");
  }

  return { userId, doctorProfileId };
}

function isActiveRelationshipBooking(booking: Pick<DbBooking, "status">) {
  return booking.status !== "rejected" && booking.status !== "cancelled";
}

function mapAuthenticatedUser(user: DbUser): AuthenticatedUser {
  return {
    id: user.appId,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    doctorProfileId: user.doctorProfileId,
    isActive: user.isActive,
    createdAt: toIso(user.createdAt),
    updatedAt: toIso(user.updatedAt),
  };
}

function mapPetRecord(pet: DbPet): PetRecord {
  return {
    id: pet.appId,
    userId: pet.userAppId,
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    sex: pet.sex,
    createdAt: toIso(pet.createdAt),
    updatedAt: toIso(pet.updatedAt),
  };
}

function mapBookingRecord(booking: DbBooking): BookingRecord {
  return {
    id: booking.appId,
    userId: booking.userAppId,
    doctorProfileId: booking.doctorProfileId,
    petId: booking.petAppId,
    scheduledAt: toIso(booking.scheduledAt),
    consultationMode: booking.consultationMode,
    status: booking.status,
    notes: booking.notes,
    rejectionReason: booking.rejectionReason,
    statusHistory: booking.statusHistory.map((entry) => ({
      status: entry.status,
      actorRole: entry.actorRole,
      actorName: entry.actorName,
      changedAt: toIso(entry.changedAt),
      note: entry.note,
    })),
    createdAt: toIso(booking.createdAt),
    updatedAt: toIso(booking.updatedAt),
  };
}

function mapMessageRecord(message: DbMessage): ChatMessageRecord {
  return {
    id: message.appId,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    createdAt: toIso(message.sentAt ?? message.createdAt),
  };
}

function mapPrescriptionRecord(prescription: DbPrescription): PrescriptionRecord {
  return {
    id: prescription.appId,
    bookingId: prescription.bookingAppId,
    doctorProfileId: prescription.doctorProfileId,
    userId: prescription.userAppId,
    petId: prescription.petAppId,
    diagnosis: prescription.diagnosis,
    notes: prescription.notes,
    followUp: prescription.followUp,
    medicines: prescription.medicines,
    issuedAt: toIso(prescription.issuedAt),
    createdAt: toIso(prescription.createdAt),
    updatedAt: toIso(prescription.updatedAt),
  };
}

function expandBookingFromMaps(
  booking: BookingRecord,
  userMap: Map<string, AuthenticatedUser>,
  petMap: Map<string, PetRecord>,
) {
  const owner = userMap.get(booking.userId);
  const pet = petMap.get(booking.petId);
  const doctor = mockDoctors.find((candidate) => candidate.id === booking.doctorProfileId);

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
  } satisfies BookingView;
}

async function getUsersByIds(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds));
  const users = (await User.find({ appId: { $in: uniqueIds } }).lean()) as DbUser[];
  return new Map(users.map((user) => [user.appId, mapAuthenticatedUser(user)]));
}

async function getPetsByIds(petIds: string[]) {
  const uniqueIds = Array.from(new Set(petIds));
  const pets = (await Pet.find({ appId: { $in: uniqueIds } }).lean()) as DbPet[];
  return new Map(pets.map((pet) => [pet.appId, mapPetRecord(pet)]));
}

async function expandBookings(bookings: BookingRecord[]) {
  const userMap = await getUsersByIds(bookings.map((booking) => booking.userId));
  const petMap = await getPetsByIds(bookings.map((booking) => booking.petId));

  return bookings.map((booking) => expandBookingFromMaps(booking, userMap, petMap));
}

async function expandChatMessages(messages: ChatMessageRecord[]) {
  const userMap = await getUsersByIds(messages.map((message) => message.senderId));

  return messages.map((message) => {
    const sender = userMap.get(message.senderId);

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
    } satisfies ChatMessageView;
  });
}

async function expandPrescriptions(prescriptions: PrescriptionRecord[]) {
  const bookings = (await Booking.find({
    appId: { $in: Array.from(new Set(prescriptions.map((item) => item.bookingId))) },
  }).lean()) as DbBooking[];
  const bookingMap = new Map(
    bookings.map((booking) => [booking.appId, mapBookingRecord(booking)]),
  );
  const userMap = await getUsersByIds(prescriptions.map((item) => item.userId));
  const petMap = await getPetsByIds(prescriptions.map((item) => item.petId));

  return prescriptions.map((prescription) => {
    const booking = bookingMap.get(prescription.bookingId);
    const owner = userMap.get(prescription.userId);
    const pet = petMap.get(prescription.petId);
    const doctor = mockDoctors.find(
      (candidate) => candidate.id === prescription.doctorProfileId,
    );

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
    } satisfies PrescriptionView;
  });
}

async function findUserRecordById(userId: string) {
  const user = (await User.findOne({ appId: userId }).lean()) as DbUser | null;
  return user ? mapAuthenticatedUser(user) : null;
}

async function findDoctorUserByProfileId(doctorProfileId: string) {
  const user = (await User.findOne({ doctorProfileId }).lean()) as DbUser | null;
  return user ? mapAuthenticatedUser(user) : null;
}

async function findPetRecordById(petId: string) {
  const pet = (await Pet.findOne({ appId: petId }).lean()) as DbPet | null;
  return pet ? mapPetRecord(pet) : null;
}

async function getConversationBookings(conversationId: string) {
  const { userId, doctorProfileId } = parseConversationId(conversationId);
  const bookings = (await Booking.find({
    userAppId: userId,
    doctorProfileId,
    status: { $nin: ["rejected", "cancelled"] },
  })
    .sort({ scheduledAt: 1 })
    .lean()) as DbBooking[];

  return bookings.map(mapBookingRecord);
}

async function assertConversationAccess(
  actor: AuthenticatedUser,
  conversationId: string,
) {
  const { userId, doctorProfileId } = parseConversationId(conversationId);
  const relatedBookings = await getConversationBookings(conversationId);

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

  return { userId, doctorProfileId, relatedBookings };
}

async function getBookingForDoctor(doctorProfileId: string, bookingId: string) {
  const booking = (await Booking.findOne({ appId: bookingId }).lean()) as DbBooking | null;

  if (!booking) {
    throw new HttpError(404, "Booking could not be found.");
  }

  if (booking.doctorProfileId !== doctorProfileId) {
    throw new HttpError(403, "You can only access prescriptions for your own bookings.");
  }

  return mapBookingRecord(booking);
}

export async function getUserById(userId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.getUserById(userId);
  }

  return findUserRecordById(userId);
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  if (!isDatabaseConnected()) {
    return demoStore.registerUser(input);
  }

  const existingUser = (await User.findOne({
    email: input.email.toLowerCase().trim(),
  }).lean()) as DbUser | null;

  if (existingUser) {
    throw new HttpError(409, "An account with that email already exists.");
  }

  const user = await User.create({
    appId: randomUUID(),
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    password: hashPassword(input.password),
    role: "user",
    isActive: true,
  });

  return mapAuthenticatedUser(user.toObject() as DbUser);
}

export async function authenticateUser(email: string, password: string) {
  if (!isDatabaseConnected()) {
    return demoStore.authenticateUser(email, password);
  }

  const user = (await User.findOne({
    email: email.toLowerCase().trim(),
  }).lean()) as DbUser | null;

  if (!user || !verifyPassword(password, user.password)) {
    throw new HttpError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new HttpError(403, "This account is currently inactive.");
  }

  return mapAuthenticatedUser(user);
}

export async function listPetsForUser(userId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.listPetsForUser(userId);
  }

  const pets = (await Pet.find({ userAppId: userId }).sort({ name: 1 }).lean()) as DbPet[];
  return pets.map(mapPetRecord);
}

export async function createPet(input: CreatePetInput) {
  if (!isDatabaseConnected()) {
    return demoStore.createPet(input);
  }

  const pet = await Pet.create({
    appId: randomUUID(),
    userAppId: input.userId,
    name: input.name.trim(),
    type: input.type.trim(),
    breed: normalizeOptionalText(input.breed),
    age: input.age,
    sex: input.sex,
  });

  return mapPetRecord(pet.toObject() as DbPet);
}

export async function createBooking(input: CreateBookingInput) {
  if (!isDatabaseConnected()) {
    return demoStore.createBooking(input);
  }

  const owner = await findUserRecordById(input.userId);

  if (!owner) {
    throw new HttpError(404, "Booking owner could not be found.");
  }

  const doctor = mockDoctors.find((candidate) => candidate.id === input.doctorProfileId);

  if (!doctor) {
    throw new HttpError(404, "Selected doctor could not be found.");
  }

  const pet = await findPetRecordById(input.petId);

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
  const conflictingBooking = (await Booking.findOne({
    doctorProfileId: doctor.id,
    scheduledAt: new Date(normalizedScheduledAt),
    status: { $nin: ["rejected", "cancelled"] },
  }).lean()) as DbBooking | null;

  if (conflictingBooking) {
    throw new HttpError(
      409,
      "That time slot is already booked. Please choose a different time.",
    );
  }

  const timestamp = createTimestamp();
  const booking = await Booking.create({
    appId: randomUUID(),
    userAppId: input.userId,
    doctorProfileId: doctor.id,
    petAppId: pet.id,
    scheduledAt: new Date(normalizedScheduledAt),
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
  });

  const [expandedBooking] = await expandBookings([
    mapBookingRecord(booking.toObject() as DbBooking),
  ]);

  return expandedBooking;
}

export async function listBookingsForUser(userId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.listBookingsForUser(userId);
  }

  const bookings = (await Booking.find({ userAppId: userId })
    .sort({ scheduledAt: 1 })
    .lean()) as DbBooking[];
  return expandBookings(bookings.map(mapBookingRecord));
}

export async function listBookingsForDoctor(doctorProfileId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.listBookingsForDoctor(doctorProfileId);
  }

  const bookings = (await Booking.find({ doctorProfileId })
    .sort({ scheduledAt: 1 })
    .lean()) as DbBooking[];
  return expandBookings(bookings.map(mapBookingRecord));
}

export async function listAllBookings() {
  if (!isDatabaseConnected()) {
    return demoStore.listAllBookings();
  }

  const bookings = (await Booking.find().sort({ scheduledAt: 1 }).lean()) as DbBooking[];
  return expandBookings(bookings.map(mapBookingRecord));
}

export async function updateBookingStatus(input: UpdateBookingStatusInput) {
  if (!isDatabaseConnected()) {
    return demoStore.updateBookingStatus(input);
  }

  const bookingDocument = await Booking.findOne({ appId: input.bookingId });

  if (!bookingDocument) {
    throw new HttpError(404, "Booking could not be found.");
  }

  if (bookingDocument.doctorProfileId !== input.doctorProfileId) {
    throw new HttpError(403, "You can only manage your own bookings.");
  }

  if (input.status === "accepted" && bookingDocument.status !== "pending") {
    throw new HttpError(400, "Only pending bookings can be accepted.");
  }

  if (input.status === "rejected" && bookingDocument.status !== "pending") {
    throw new HttpError(400, "Only pending bookings can be rejected.");
  }

  if (input.status === "completed" && bookingDocument.status !== "accepted") {
    throw new HttpError(400, "Only accepted bookings can be marked completed.");
  }

  const doctor = await findDoctorUserByProfileId(input.doctorProfileId);

  if (!doctor) {
    throw new HttpError(404, "Doctor account could not be found.");
  }

  const timestamp = createTimestamp();
  bookingDocument.status = input.status;
  bookingDocument.rejectionReason =
    input.status === "rejected"
      ? normalizeOptionalText(input.rejectionReason)
      : undefined;
  bookingDocument.statusHistory.push(
    createBookingStatusHistoryEntry({
      status: input.status,
      actorRole: doctor.role,
      actorName: doctor.name,
      changedAt: timestamp,
      note:
        input.status === "rejected"
          ? input.rejectionReason
          : input.status === "completed"
            ? "Consultation marked as completed."
            : "Booking accepted by doctor.",
    }),
  );
  await bookingDocument.save();

  const [expandedBooking] = await expandBookings([
    mapBookingRecord(bookingDocument.toObject() as DbBooking),
  ]);

  return expandedBooking;
}

export async function getAdminOverview() {
  if (!isDatabaseConnected()) {
    return demoStore.getAdminOverview();
  }

  const [userAccounts, doctorAccounts, petsCount, bookingsCount, pendingBookings] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "doctor" }),
      Pet.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
    ]);

  return {
    counts: {
      users: userAccounts,
      doctors: doctorAccounts,
      pets: petsCount,
      bookings: bookingsCount,
      pendingBookings,
    },
    recentBookings: (await listAllBookings()).slice(-10).reverse(),
  };
}

export async function listConversationsForActor(actor: AuthenticatedUser) {
  if (!isDatabaseConnected()) {
    return demoStore.listConversationsForActor(actor);
  }

  const relatedBookings = ((await Booking.find({
    ...(actor.role === "user"
      ? { userAppId: actor.id }
      : { doctorProfileId: actor.doctorProfileId }),
    status: { $nin: ["rejected", "cancelled"] },
  })
    .sort({ scheduledAt: 1 })
    .lean()) as DbBooking[]).map(mapBookingRecord);

  const uniqueConversationIds = Array.from(
    new Set(
      relatedBookings.map((booking) =>
        createConversationId(booking.userId, booking.doctorProfileId),
      ),
    ),
  );

  const messages = (await Message.find({
    conversationId: { $in: uniqueConversationIds },
  })
    .sort({ sentAt: 1, createdAt: 1 })
    .lean()) as DbMessage[];
  const userMap = await getUsersByIds([
    ...relatedBookings.map((booking) => booking.userId),
    ...messages.map((message) => message.senderId),
  ]);

  const mappedConversations: Array<ConversationView | null> = uniqueConversationIds.map(
    (conversationId) => {
      const { userId, doctorProfileId } = parseConversationId(conversationId);
      const owner = userMap.get(userId);
      const doctor = mockDoctors.find((candidate) => candidate.id === doctorProfileId);
      const relatedConversationBookings = relatedBookings.filter(
        (booking) =>
          booking.userId === userId &&
          booking.doctorProfileId === doctorProfileId &&
          isActiveRelationshipBooking(booking),
      );
      const lastMessageRecord = messages
        .filter((message) => message.conversationId === conversationId)
        .at(-1);

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

      const latestBooking = relatedConversationBookings.at(-1);
      const lastActivityAt =
        (lastMessageRecord
          ? toIso(lastMessageRecord.sentAt ?? lastMessageRecord.createdAt)
          : undefined) ??
        latestBooking?.updatedAt ??
        createTimestamp();

      return {
        id: conversationId,
        counterpart,
        bookingCount: relatedConversationBookings.length,
        lastMessage: lastMessageRecord
          ? {
              id: lastMessageRecord.appId,
              conversationId: lastMessageRecord.conversationId,
              content: lastMessageRecord.content,
              createdAt: toIso(lastMessageRecord.sentAt ?? lastMessageRecord.createdAt),
              sender: {
                id: lastMessageRecord.senderId,
                name: userMap.get(lastMessageRecord.senderId)?.name ?? lastMessageRecord.senderId,
                role:
                  userMap.get(lastMessageRecord.senderId)?.role === "doctor"
                    ? "doctor"
                    : "user",
              },
            }
          : undefined,
        lastActivityAt,
      } satisfies ConversationView;
    },
  );

  return mappedConversations
    .filter((conversation): conversation is ConversationView => conversation !== null)
    .sort((left, right) => right.lastActivityAt.localeCompare(left.lastActivityAt));
}

export async function listMessagesForConversation(
  actor: AuthenticatedUser,
  conversationId: string,
) {
  if (!isDatabaseConnected()) {
    return demoStore.listMessagesForConversation(actor, conversationId);
  }

  await assertConversationAccess(actor, conversationId);
  const messages = (await Message.find({ conversationId })
    .sort({ sentAt: 1, createdAt: 1 })
    .lean()) as DbMessage[];

  return expandChatMessages(messages.map(mapMessageRecord));
}

export async function createChatMessage(input: CreateChatMessageInput) {
  if (!isDatabaseConnected()) {
    return demoStore.createChatMessage(input);
  }

  const { actor, conversationId } = input;
  const { userId, doctorProfileId, relatedBookings } = await assertConversationAccess(
    actor,
    conversationId,
  );
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

  const receiverId =
    actor.role === "user"
      ? (await findDoctorUserByProfileId(doctorProfileId))?.id
      : userId;

  if (!receiverId) {
    throw new HttpError(404, "Conversation receiver could not be resolved.");
  }

  const latestBooking = relatedBookings.at(-1);
  const message = await Message.create({
    appId: randomUUID(),
    conversationId,
    senderId: actor.id,
    receiverId,
    bookingId: latestBooking?.id,
    content: normalizedContent,
    sentAt: new Date(),
  });

  const [expandedMessage] = await expandChatMessages([
    mapMessageRecord(message.toObject() as DbMessage),
  ]);

  return expandedMessage;
}

export async function getConversationDetails(conversationId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.getConversationDetails(conversationId);
  }

  const { userId, doctorProfileId } = parseConversationId(conversationId);
  const owner = await findUserRecordById(userId);
  const doctor = mockDoctors.find((candidate) => candidate.id === doctorProfileId);
  const doctorUser = await findDoctorUserByProfileId(doctorProfileId);

  if (!owner || !doctor || !doctorUser) {
    throw new HttpError(404, "Conversation could not be resolved.");
  }

  return {
    owner,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      location: doctor.location,
      userId: doctorUser.id,
    },
  };
}

export async function createPrescription(input: CreatePrescriptionInput) {
  if (!isDatabaseConnected()) {
    return demoStore.createPrescription(input);
  }

  const booking = (await Booking.findOne({
    appId: input.bookingId,
  }).lean()) as DbBooking | null;

  if (!booking) {
    throw new HttpError(404, "Booking could not be found.");
  }

  if (
    input.actor.role !== "doctor" ||
    input.actor.doctorProfileId !== booking.doctorProfileId
  ) {
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
  const prescription = await Prescription.create({
    appId: randomUUID(),
    bookingAppId: booking.appId,
    doctorProfileId: booking.doctorProfileId,
    userAppId: booking.userAppId,
    petAppId: booking.petAppId,
    diagnosis: normalizedDiagnosis,
    notes: normalizeOptionalText(input.notes),
    followUp: normalizeOptionalText(input.followUp),
    medicines: normalizedMedicines,
    issuedAt: new Date(timestamp),
  });

  const [expandedPrescription] = await expandPrescriptions([
    mapPrescriptionRecord(prescription.toObject() as DbPrescription),
  ]);

  return expandedPrescription;
}

export async function listPrescriptionsForUser(userId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.listPrescriptionsForUser(userId);
  }

  const prescriptions = (await Prescription.find({ userAppId: userId })
    .sort({ issuedAt: -1, createdAt: -1 })
    .lean()) as DbPrescription[];
  return expandPrescriptions(prescriptions.map(mapPrescriptionRecord));
}

export async function listPrescriptionsForDoctor(doctorProfileId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.listPrescriptionsForDoctor(doctorProfileId);
  }

  const prescriptions = (await Prescription.find({ doctorProfileId })
    .sort({ issuedAt: -1, createdAt: -1 })
    .lean()) as DbPrescription[];
  return expandPrescriptions(prescriptions.map(mapPrescriptionRecord));
}

export async function listPrescriptionsForBooking(
  doctorProfileId: string,
  bookingId: string,
) {
  if (!isDatabaseConnected()) {
    return demoStore.listPrescriptionsForBooking(doctorProfileId, bookingId);
  }

  await getBookingForDoctor(doctorProfileId, bookingId);
  const prescriptions = (await Prescription.find({ bookingAppId: bookingId })
    .sort({ issuedAt: -1, createdAt: -1 })
    .lean()) as DbPrescription[];
  return expandPrescriptions(prescriptions.map(mapPrescriptionRecord));
}

export async function getMedicalHistoryForUser(userId: string) {
  if (!isDatabaseConnected()) {
    return demoStore.getMedicalHistoryForUser(userId);
  }

  const [pets, bookings, prescriptions] = await Promise.all([
    listPetsForUser(userId),
    listBookingsForUser(userId),
    listPrescriptionsForUser(userId),
  ]);

  return pets.map((pet) => ({
    pet: {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      sex: pet.sex,
    },
    bookings: bookings.filter((booking) => booking.pet.id === pet.id),
    prescriptions: prescriptions.filter((prescription) => prescription.pet.id === pet.id),
  })) satisfies MedicalHistoryPetView[];
}
