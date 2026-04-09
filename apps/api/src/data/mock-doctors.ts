import {
  createDefaultWeeklyAvailability,
  type ConsultationMode,
  type DoctorAvailabilityDay,
  type DoctorAvailabilityOverride,
  type DoctorBlockedSlot,
} from "../utils/doctor-availability";

export type PublicDoctor = {
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
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
  blockedSlots: DoctorBlockedSlot[];
};

function createAvailabilitySeed(
  overrides: Partial<{
    availability: DoctorAvailabilityDay[];
    availabilityOverrides: DoctorAvailabilityOverride[];
    blockedSlots: DoctorBlockedSlot[];
  }> = {},
) {
  return {
    availability: overrides.availability ?? createDefaultWeeklyAvailability(),
    availabilityOverrides: overrides.availabilityOverrides ?? [],
    blockedSlots: overrides.blockedSlots ?? [],
  };
}

export const mockDoctors: PublicDoctor[] = [
  {
    id: "dr-amara-jayasinghe",
    slug: "amara-jayasinghe",
    name: "Dr. Amara Jayasinghe",
    specialization: "Companion Animal Medicine",
    experienceYears: 11,
    rating: 4.9,
    reviewCount: 184,
    nextAvailable: "Today at 4:30 PM",
    consultationModes: ["Clinic", "Video"],
    bio: "Focuses on preventive care, diagnostics, and long-term wellness plans for cats and dogs.",
    languages: ["English", "Sinhala"],
    clinic: "Green Paws Veterinary Centre",
    location: "Colombo",
    ...createAvailabilitySeed(),
  },
  {
    id: "dr-nadeesha-perera",
    slug: "nadeesha-perera",
    name: "Dr. Nadeesha Perera",
    specialization: "Dermatology",
    experienceYears: 8,
    rating: 4.8,
    reviewCount: 127,
    nextAvailable: "Tomorrow at 9:00 AM",
    consultationModes: ["Clinic", "Video"],
    bio: "Helps pets with allergies, skin infections, coat issues, and chronic irritation.",
    languages: ["English", "Sinhala"],
    clinic: "Blue Haven Animal Care",
    location: "Nugegoda",
    ...createAvailabilitySeed({
      availability: [
        {
          dayOfWeek: "monday",
          windows: [{ start: "10:00", end: "13:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "tuesday",
          windows: [{ start: "10:00", end: "15:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "wednesday",
          windows: [{ start: "10:00", end: "15:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "thursday",
          windows: [{ start: "10:00", end: "15:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "friday",
          windows: [{ start: "10:00", end: "14:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "saturday",
          windows: [{ start: "09:00", end: "12:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "sunday",
          windows: [],
          isActive: false,
        },
      ],
    }),
  },
  {
    id: "dr-kasun-ranathunga",
    slug: "kasun-ranathunga",
    name: "Dr. Kasun Ranathunga",
    specialization: "Surgery",
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 213,
    nextAvailable: "Friday at 1:15 PM",
    consultationModes: ["Clinic"],
    bio: "Performs soft tissue procedures and supports recovery planning for complex surgical cases.",
    languages: ["English", "Sinhala"],
    clinic: "PetCare Surgical Hub",
    location: "Battaramulla",
    ...createAvailabilitySeed({
      availability: [
        {
          dayOfWeek: "monday",
          windows: [{ start: "08:30", end: "12:30" }],
          isActive: true,
        },
        {
          dayOfWeek: "tuesday",
          windows: [{ start: "08:30", end: "12:30" }],
          isActive: true,
        },
        {
          dayOfWeek: "wednesday",
          windows: [],
          isActive: false,
        },
        {
          dayOfWeek: "thursday",
          windows: [{ start: "12:30", end: "17:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "friday",
          windows: [{ start: "12:30", end: "17:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "saturday",
          windows: [{ start: "09:00", end: "13:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "sunday",
          windows: [],
          isActive: false,
        },
      ],
    }),
  },
  {
    id: "dr-ishara-silva",
    slug: "ishara-silva",
    name: "Dr. Ishara Silva",
    specialization: "Nutrition and Wellness",
    experienceYears: 7,
    rating: 4.7,
    reviewCount: 92,
    nextAvailable: "Today at 6:00 PM",
    consultationModes: ["Video"],
    bio: "Designs nutrition plans and habit-based wellness programs for growing and aging pets.",
    languages: ["English"],
    clinic: "Happy Tails Wellness Studio",
    location: "Dehiwala",
    ...createAvailabilitySeed({
      availability: [
        {
          dayOfWeek: "monday",
          windows: [{ start: "16:00", end: "20:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "tuesday",
          windows: [{ start: "16:00", end: "20:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "wednesday",
          windows: [{ start: "16:00", end: "20:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "thursday",
          windows: [{ start: "16:00", end: "20:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "friday",
          windows: [{ start: "16:00", end: "20:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "saturday",
          windows: [],
          isActive: false,
        },
        {
          dayOfWeek: "sunday",
          windows: [{ start: "10:00", end: "14:00" }],
          isActive: true,
        },
      ],
    }),
  },
  {
    id: "dr-tharindu-fernando",
    slug: "tharindu-fernando",
    name: "Dr. Tharindu Fernando",
    specialization: "Emergency Care",
    experienceYears: 12,
    rating: 4.9,
    reviewCount: 241,
    nextAvailable: "On call tonight",
    consultationModes: ["Clinic", "Video"],
    bio: "Experienced in urgent triage, rapid stabilization, and after-hours consultation workflows.",
    languages: ["English", "Sinhala", "Tamil"],
    clinic: "24/7 Paw Response Unit",
    location: "Colombo",
    ...createAvailabilitySeed({
      availability: [
        {
          dayOfWeek: "monday",
          windows: [{ start: "18:00", end: "22:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "tuesday",
          windows: [{ start: "18:00", end: "22:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "wednesday",
          windows: [{ start: "18:00", end: "22:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "thursday",
          windows: [{ start: "18:00", end: "22:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "friday",
          windows: [{ start: "18:00", end: "22:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "saturday",
          windows: [{ start: "12:00", end: "18:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "sunday",
          windows: [{ start: "12:00", end: "18:00" }],
          isActive: true,
        },
      ],
    }),
  },
  {
    id: "dr-senuri-wijesinghe",
    slug: "senuri-wijesinghe",
    name: "Dr. Senuri Wijesinghe",
    specialization: "Exotic Pets",
    experienceYears: 6,
    rating: 4.8,
    reviewCount: 68,
    nextAvailable: "Saturday at 10:45 AM",
    consultationModes: ["Clinic", "Video"],
    bio: "Supports rabbits, birds, reptiles, and other exotic pets with tailored treatment plans.",
    languages: ["English", "Sinhala"],
    clinic: "Little Paws and Wings",
    location: "Mount Lavinia",
    ...createAvailabilitySeed({
      availability: [
        {
          dayOfWeek: "monday",
          windows: [],
          isActive: false,
        },
        {
          dayOfWeek: "tuesday",
          windows: [{ start: "09:30", end: "13:30" }],
          isActive: true,
        },
        {
          dayOfWeek: "wednesday",
          windows: [],
          isActive: false,
        },
        {
          dayOfWeek: "thursday",
          windows: [{ start: "09:30", end: "13:30" }],
          isActive: true,
        },
        {
          dayOfWeek: "friday",
          windows: [],
          isActive: false,
        },
        {
          dayOfWeek: "saturday",
          windows: [{ start: "10:00", end: "15:00" }],
          isActive: true,
        },
        {
          dayOfWeek: "sunday",
          windows: [],
          isActive: false,
        },
      ],
    }),
  },
];
