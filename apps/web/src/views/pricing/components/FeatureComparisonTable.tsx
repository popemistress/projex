import { HiCheckCircle, HiXCircle } from "react-icons/hi2";

interface Feature {
  key: string;
  label: string;
  kan: boolean | string;
  trello: boolean | string;
}

interface Section {
  name: string;
  features: Feature[];
}

type FrequencyValue = "monthly" | "annually";

const CellValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string") {
    return (
      <span className="text-sm text-dark-900 dark:text-dark-900">{value}</span>
    );
  }
  return value ? (
    <HiCheckCircle className="h-5 w-5 text-light-950 dark:text-dark-1000" />
  ) : (
    <HiXCircle className="h-5 w-5 text-light-700 dark:text-dark-600" />
  );
};

const FeatureComparisonTable = ({
  frequencyValue,
}: {
  frequencyValue: FrequencyValue;
}) => {
  const sections: Section[] = [
    {
      name: "Core features",
      features: [
        {
          key: "ulimited-workspaces",
          label: "Unlimited workspaces",
          kan: true,
          trello: false,
        },
        {
          key: "unlimited-boards",
          label: "Unlimited boards",
          kan: true,
          trello: false,
        },
        {
          key: "unlimited-lists",
          label: "Unlimited lists",
          kan: true,
          trello: true,
        },
        {
          key: "unlimited-cards",
          label: "Unlimited cards",
          kan: true,
          trello: true,
        },
        {
          key: "activity-log",
          label: "Activity log",
          kan: true,
          trello: true,
        },
        {
          key: "templates",
          label: "Custom templates",
          kan: true,
          trello: false,
        },
        { key: "labels", label: "Labels & filters", kan: true, trello: true },
        { key: "checklists", label: "Checklists", kan: true, trello: true },
        {
          key: "import",
          label: "Import from Trello",
          kan: true,
          trello: false,
        },
        {
          key: "visibility",
          label: "Board visibility",
          kan: true,
          trello: true,
        },
        {
          key: "search",
          label: "Intelligent search",
          kan: true,
          trello: true,
        },
        {
          key: "workspace-url",
          label: "Custom workspace link",
          kan: true,
          trello: false,
        },
      ],
    },
    {
      name: "Teams",
      features: [
        {
          key: "pricing",
          label: "Price per user/month",
          kan: frequencyValue === "monthly" ? `$10.00` : `$8.00`,
          trello: frequencyValue === "monthly" ? `$12.00` : `$10.00`,
        },
        {
          key: "comments",
          label: "Comments & mentions",
          kan: true,
          trello: true,
        },
        {
          key: "assignments",
          label: "Assignees",
          kan: true,
          trello: true,
        },
        {
          key: "sharing",
          label: "Board sharing & invites",
          kan: true,
          trello: true,
        },
        {
          key: "invite-links",
          label: "Invite links",
          kan: true,
          trello: true,
        },
      ],
    },
    {
      name: "Platform",
      features: [
        {
          key: "api",
          label: "REST API",
          kan: true,
          trello: true,
        },
        {
          key: "open-source",
          label: "Open source",
          kan: true,
          trello: false,
        },
        {
          key: "self-hostable",
          label: "Self-hostable",
          kan: true,
          trello: false,
        },
        {
          key: "white-label",
          label: "White label",
          kan: true,
          trello: false,
        },
        {
          key: "performance",
          label: "Fast & lightweight",
          kan: true,
          trello: false,
        },
        {
          key: "this-is-a-joke",
          label: "Owned by Atlassian",
          kan: false,
          trello: true,
        },
      ],
    },
  ];

  const products = [
    {
      id: "kan",
      name: "Kan",
      featured: true,
    },
    {
      id: "trello",
      name: "Trello",
      featured: false,
    },
  ];

  return (
    <section aria-labelledby="comparison-heading" className="w-full px-4">
      <div className="mx-auto max-w-6xl py-8 lg:py-10">
        <div className="grid grid-cols-3 gap-x-8 border-t border-light-500 before:block dark:border-dark-300">
          {products.map((product) => (
            <div key={product.id} aria-hidden="true" className="-mt-px">
              <div
                className={`${product.featured ? "border-dark-200 dark:border-dark-800" : "border-transparent"} border-t-2 pt-8`}
              >
                <p
                  className={`${product.featured ? "text-dark-50 dark:text-dark-1000" : "text-light-1000 dark:text-dark-1000"} text-center text-sm font-semibold`}
                >
                  {product.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="-mt-6 space-y-12">
          {sections.map((section) => (
            <div key={section.name}>
              <h4 className="text-sm font-semibold text-light-1000 dark:text-dark-1000">
                {section.name}
              </h4>
              <div className="relative -mx-8 mt-8">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-8 inset-y-0 grid grid-cols-3 gap-x-8 before:block"
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`size-full rounded-lg ${product.featured ? "bg-white shadow-sm dark:bg-dark-50 dark:shadow-none" : ""}`}
                    />
                  ))}
                </div>

                <table className="relative w-full border-separate border-spacing-x-8">
                  <thead>
                    <tr className="text-left">
                      <th scope="col">
                        <span className="sr-only">{"Feature"}</span>
                      </th>
                      {products.map((p) => (
                        <th key={p.id} scope="col">
                          <span className="sr-only">{p.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.features.map((feature, featureIdx) => (
                      <tr key={feature.key}>
                        <th
                          scope="row"
                          className="w-1/3 py-3 pr-4 text-left text-sm font-normal text-light-1000 dark:text-dark-1000"
                        >
                          {feature.label}
                          {featureIdx !== section.features.length - 1 ? (
                            <div className="absolute inset-x-8 mt-3 h-px bg-light-500 dark:bg-dark-300" />
                          ) : null}
                        </th>
                        {products.map((p) => (
                          <td
                            key={p.id}
                            className="relative w-1/3 px-4 py-0 text-center"
                          >
                            <span className="relative inline-flex w-full items-center justify-center py-3">
                              <CellValue
                                value={
                                  p.id === "kan" ? feature.kan : feature.trello
                                }
                              />
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 inset-y-0 grid grid-cols-3 gap-x-8 before:block"
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`${product.featured ? "ring-1 ring-light-500 dark:ring-dark-800" : "ring-0"} rounded-2xl`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureComparisonTable;
