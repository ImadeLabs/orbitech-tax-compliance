export default function TaxNews() {
  const news = [
    {
      title: "FIRS Issues New VAT Compliance Guidelines",
      date: "June 2026",
    },
    {
      title: "Companies Reminded to File Annual Returns",
      date: "June 2026",
    },
    {
      title: "PenCom Compliance Deadline Update",
      date: "June 2026",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold mb-12">
          Latest Tax & Compliance Updates
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {news.map((item) => (
            <div
              key={item.title}
              className="border rounded-xl p-6 hover:shadow-lg"
            >
              <p className="text-sm text-gray-500">
                {item.date}
              </p>

              <h3 className="text-xl font-semibold mt-3">
                {item.title}
              </h3>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}