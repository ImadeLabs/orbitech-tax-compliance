const services = [
  "Tax Filing",
  "Annual Returns",
  "VAT Compliance",
  "PAYE Administration",
  "Financial Statements",
  "Audit Support",
  "PenCom Compliance",
  "Business Registration"
];

export default function Services() {
  return (
    <section className="py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-12">
          Our Services
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {services.map((service) => (
            <div
              key={service}
              className="border rounded-xl p-6 shadow-sm hover:shadow-lg"
            >
              <h3 className="font-semibold text-lg">
                {service}
              </h3>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
