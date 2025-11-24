export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function AppointmentDetailsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Appointment Details</h1>
      <p>This page will show appointment details in the mobile app.</p>
    </div>
  );
}