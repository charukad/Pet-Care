import { Booking } from "../models/booking.model";
import { Doctor } from "../models/doctor.model";
import { Message } from "../models/message.model";
import { Pet } from "../models/pet.model";
import { User } from "../models/user.model";
import { mockDoctors } from "../data/mock-doctors";
import { hashPassword } from "../utils/password";

const seedUsers = [
  {
    appId: "user-sarah-perera",
    name: "Sarah Perera",
    email: "sarah@petcare.local",
    password: "Owner@123",
    role: "user" as const,
  },
  {
    appId: "doctor-amara-jayasinghe",
    name: "Dr. Amara Jayasinghe",
    email: "amara@petcare.local",
    password: "Doctor@123",
    role: "doctor" as const,
    doctorProfileId: "dr-amara-jayasinghe",
  },
  {
    appId: "doctor-nadeesha-perera",
    name: "Dr. Nadeesha Perera",
    email: "nadeesha@petcare.local",
    password: "Doctor@123",
    role: "doctor" as const,
    doctorProfileId: "dr-nadeesha-perera",
  },
  {
    appId: "admin-platform",
    name: "Platform Admin",
    email: "admin@petcare.local",
    password: "Admin@123",
    role: "admin" as const,
  },
];

const seedPets = [
  {
    appId: "pet-milo",
    userAppId: "user-sarah-perera",
    name: "Milo",
    type: "Dog",
    breed: "Golden Retriever",
    age: 4,
    sex: "male" as const,
  },
  {
    appId: "pet-luna",
    userAppId: "user-sarah-perera",
    name: "Luna",
    type: "Cat",
    breed: "Domestic Shorthair",
    age: 2,
    sex: "female" as const,
  },
];

const seedBookingScheduledAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

const seedBookings = [
  {
    appId: "booking-seed-1",
    userAppId: "user-sarah-perera",
    doctorProfileId: "dr-amara-jayasinghe",
    petAppId: "pet-milo",
    scheduledAt: seedBookingScheduledAt,
    consultationMode: "Video" as const,
    status: "pending" as const,
    notes: "Dry skin patches on both ears for the last week.",
    statusHistory: [
      {
        status: "pending" as const,
        changedAt: seedBookingScheduledAt,
        actorRole: "user" as const,
        actorName: "Sarah Perera",
      },
    ],
  },
];

const seedMessages = [
  {
    appId: "message-seed-1",
    conversationId: "user-sarah-perera__dr-amara-jayasinghe",
    senderId: "user-sarah-perera",
    receiverId: "doctor-amara-jayasinghe",
    bookingId: "booking-seed-1",
    content: "Hi doctor, I wanted to share a little more detail before the consultation.",
    sentAt: new Date(Date.now() - 1000 * 60 * 35),
  },
  {
    appId: "message-seed-2",
    conversationId: "user-sarah-perera__dr-amara-jayasinghe",
    senderId: "doctor-amara-jayasinghe",
    receiverId: "user-sarah-perera",
    bookingId: "booking-seed-1",
    content: "Of course. Please let me know what changes you've noticed with Milo.",
    sentAt: new Date(Date.now() - 1000 * 60 * 28),
  },
];

export async function seedCoreDatabase() {
  for (const user of seedUsers) {
    await User.updateOne(
      { appId: user.appId },
      {
        $setOnInsert: {
          appId: user.appId,
          name: user.name,
          email: user.email,
          password: hashPassword(user.password),
          role: user.role,
          doctorProfileId: user.doctorProfileId,
          isActive: true,
        },
      },
      { upsert: true },
    );
  }

  for (const user of seedUsers.filter((entry) => entry.role === "doctor")) {
    const doctorProfile = mockDoctors.find(
      (doctor) => doctor.id === user.doctorProfileId,
    );

    if (!doctorProfile || !user.doctorProfileId) {
      continue;
    }

    await Doctor.updateOne(
      { doctorProfileId: user.doctorProfileId },
      {
        $setOnInsert: {
          doctorProfileId: user.doctorProfileId,
          userAppId: user.appId,
          specialization: doctorProfile.specialization,
          experienceYears: doctorProfile.experienceYears,
          bio: doctorProfile.bio,
          languages: doctorProfile.languages,
          ratingAverage: doctorProfile.rating,
          reviewCount: doctorProfile.reviewCount,
        },
      },
      { upsert: true },
    );
  }

  for (const pet of seedPets) {
    await Pet.updateOne(
      { appId: pet.appId },
      {
        $setOnInsert: pet,
      },
      { upsert: true },
    );
  }

  for (const booking of seedBookings) {
    await Booking.updateOne(
      { appId: booking.appId },
      {
        $setOnInsert: booking,
      },
      { upsert: true },
    );
  }

  for (const message of seedMessages) {
    await Message.updateOne(
      { appId: message.appId },
      {
        $setOnInsert: message,
      },
      { upsert: true },
    );
  }
}
