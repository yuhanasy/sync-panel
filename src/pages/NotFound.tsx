import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <FileQuestion className="w-16 h-16 text-gray-300 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-500 mb-8">Page not found</p>
      <Link
        to="/"
        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        Back to integrations
      </Link>
    </div>
  );
}
