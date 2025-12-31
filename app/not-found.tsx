"use client";
import Link from "next/link";

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboards/overview/account"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Return to Home
        </Link>
        <p className="text-sm text-gray-400 mt-4">
          You will be automatically redirected to the homepage in 5 seconds.
        </p>
      </div>
    </div>
  );
}
