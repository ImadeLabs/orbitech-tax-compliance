export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6">

        <div className="h-20 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              Orbitech
            </h1>

            <p className="text-xs text-gray-500">
              Tax & Compliance
            </p>
          </div>

          <nav className="hidden md:flex gap-8 font-medium">
            <a href="#">Home</a>
            <a href="#">Services</a>
            <a href="#">Industries</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </nav>

          <button className="bg-blue-900 text-white px-5 py-3 rounded-lg">
            Book Consultation
          </button>

        </div>
      </div>
    </header>
  );
}