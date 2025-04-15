// frontend/src/app/page.tsx
import Link from "next/link"; // Import Link for navigation

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-brand-darkblue to-brand-midblue text-white">
      <div className="text-center">
        <h1 className="text-5xl font-arvo font-bold mb-4">
          Welcome to LearnBridge<span className="text-brand-orange">Edu</span>
        </h1>
        <p className="text-xl mb-8">
          Empowering Ghanaian Educators and Students with AI.
        </p>
        <div className="space-x-4">
          {/* Temporary Links - We'll make these functional later */}
          <Link href="/login" className="bg-brand-orange hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded transition duration-300">
            Login
          </Link>
          <Link href="/register" className="bg-white hover:bg-gray-200 text-brand-darkblue font-bold py-2 px-6 rounded transition duration-300">
            Register
          </Link>
           {/* We will add Teacher/Student dashboard links later */}
        </div>
      </div>
    </main>
  );
}