export default function Industries() {
  const industries = [
    "Construction",
    "NGOs",
    "Hotels",
    "Schools",
    "Healthcare",
    "Manufacturing",
    "Startups",
    "Professional Services",
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-5xl font-bold text-center mb-12">
          Industries We Serve
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {industries.map((industry) => (
            <div
              key={industry}
              className="bg-white border rounded-xl p-6 text-center shadow-sm"
            >
              {industry}
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}