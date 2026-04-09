export type DoctorProfile = {
  id: string;
  slug: string;
  name: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  consultationModes: string[];
  languages: string[];
  location: string;
  clinic: string;
  bio: string;
  focusAreas: string[];
};

export const mockDoctors: DoctorProfile[] = [
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
    languages: ["English", "Sinhala"],
    location: "Colombo",
    clinic: "Green Paws Veterinary Centre",
    bio: "Builds calm, prevention-first care plans for dogs and cats with a strong focus on diagnostics and owner education.",
    focusAreas: ["Annual wellness", "Chronic disease follow-up", "Vaccination plans"],
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
    languages: ["English", "Sinhala"],
    location: "Nugegoda",
    clinic: "Blue Haven Animal Care",
    bio: "Helps pets recover from recurring allergies, skin infections, coat loss, and irritation with structured care plans.",
    focusAreas: ["Allergy management", "Skin infection treatment", "Long-term skin monitoring"],
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
    languages: ["English", "Sinhala"],
    location: "Battaramulla",
    clinic: "PetCare Surgical Hub",
    bio: "Leads surgical consultations with clear pre-op planning, safe recovery guidance, and strong coordination with pet owners.",
    focusAreas: ["Soft tissue surgery", "Recovery planning", "Second-opinion reviews"],
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
    languages: ["English"],
    location: "Dehiwala",
    clinic: "Happy Tails Wellness Studio",
    bio: "Designs routines for healthy weight, feeding transitions, senior wellness, and habit-based daily care.",
    focusAreas: ["Nutrition plans", "Weight management", "Senior pet routines"],
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
    languages: ["English", "Sinhala", "Tamil"],
    location: "Colombo",
    clinic: "24/7 Paw Response Unit",
    bio: "Supports urgent cases with fast triage, practical remote guidance, and dependable escalation to in-person care.",
    focusAreas: ["Urgent triage", "After-hours care", "Stabilization guidance"],
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
    languages: ["English", "Sinhala"],
    location: "Mount Lavinia",
    clinic: "Little Paws and Wings",
    bio: "Treats rabbits, birds, reptiles, and small mammals with species-aware handling and tailored consultation plans.",
    focusAreas: ["Bird wellness", "Rabbit care", "Exotic pet follow-ups"],
  },
];

export function getDoctorBySlug(slug: string) {
  return mockDoctors.find((doctor) => doctor.slug === slug);
}
