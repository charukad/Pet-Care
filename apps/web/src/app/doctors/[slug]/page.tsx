import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DoctorProfileWorkspace } from "@/components/doctors/doctor-profile-workspace";
import { getDoctorBySlug, mockDoctors } from "@/data/mock-doctors";

type DoctorProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return mockDoctors.map((doctor) => ({
    slug: doctor.slug,
  }));
}

export async function generateMetadata({
  params,
}: DoctorProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = getDoctorBySlug(slug);

  if (!doctor) {
    return {
      title: "Doctor not found | Pet Care",
    };
  }

  return {
    title: `${doctor.name} | Pet Care`,
    description: `${doctor.specialization} consultations from ${doctor.clinic} in ${doctor.location}.`,
  };
}

export default async function DoctorProfilePage({
  params,
}: DoctorProfilePageProps) {
  const { slug } = await params;
  const doctor = getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  return <DoctorProfileWorkspace slug={doctor.slug} />;
}
