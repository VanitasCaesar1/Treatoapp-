export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function DoctorProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Doctor Profile</h1>
      <p>This page will show doctor details in the mobile app.</p>
    </div>
  );
}