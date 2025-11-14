import Link from "next/link";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { HiMiniMinusSmall, HiMiniPlusSmall } from "react-icons/hi2";

const Text = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-[14px] leading-[1.7rem] text-light-800 dark:text-dark-800">
      {children}
    </p>
  );
};

const Faqs = () => {
  const faqs = [
    {
      question: "Why make an open source Trello?",
      answer: (
        <Text>
          When Trello launched in 2011, it blew everyone away with its carefully designed simplicity, but over the years it lost its magic and grew into something closer to &quot;Jira Lite&quot;. This project is our attempt to recapture the original magic of Trello&apos;s simplicity, in open source.
        </Text>
      ),
    },
    {
      question: "What's the difference between Kan and Trello?",
      answer: (
        <Text>
          {"The main difference between Kan and Trello is that Kan is open source, allowing anyone to view, modify, and contribute to our code. Our cloud offering also offers no restrictions on features for individual use, whereas Trello locks basic features such as the number of boards you can create behind a paywall."}
        </Text>
      ),
    },
    {
      question: "How is the project funded?",
      answer: (
        <Text>
          {"For long-term sustainability, we recognise all good open source projects need a source of revenue. Ours comes from the paid cloud offering for workspaces with multiple users and for custom workspace slugs. There's no obligation to use it, and you can self-host the software on your own infrastructure free of charge."}
        </Text>
      ),
    },
    {
      question: "How do I import my Trello boards?",
      answer: (
        <Text>
          
            Importing your Trello boards into Kan is easy. You can follow our
            step-by-step guide{" "}
            <Link
              href="https://docs.kan.bn/imports/trello"
              className="underline"
            >
              here
            </Link>
            .
          
        </Text>
      ),
    },
    {
      question: "How do I get a custom URL?",
      answer: (
        <Text>
          
            You can get a custom workspace URL, like{" "}
            <Link href="https://kan.bn/kan" className="underline">
              kan.bn/kan
            </Link>
            , by going into your{" "}
            <Link href="https://kan.bn/settings" className="underline">
              workspace settings
            </Link>{" "}
            and purchasing a pro workspace subscription. All subscriptions help
            fund the development of the project!
          
        </Text>
      ),
    },
    {
      question: "Do you offer a free plan?",
      answer: (
        <Text>
          {"Yes, we offer an forever free plan for individual use. No restrictions, no paywalls, no limits."}
        </Text>
      ),
    },
    {
      question: "What license are you using?",
      answer: (
        <Text>
          
            We are using the{" "}
            <Link
              href="https://github.com/kan-bn/kan/blob/main/LICENSE"
              className="underline"
            >
              AGPL-3.0 license
            </Link>
            .
          
        </Text>
      ),
    },
    {
      question: "How do I invite team members?",
      answer: (
        <Text>
          
            You can invite team members by clicking the "Invite" button in the
            top right corner of the{" "}
            <Link href="https://kan.bn/members" className="underline">
              members page
            </Link>{" "}
            and entering their email address. They will receive an email with a
            link to join the workspace.
          
        </Text>
      ),
    },
    {
      question: "How do I self-host?",
      answer: (
        <Text>
          
            You can self-host by following the instructions in our{" "}
            <Link href="https://github.com/kanbn/kan" className="underline">
              repo
            </Link>
            .
          
        </Text>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[900px] px-4">
      <div className="flex flex-col items-center justify-center pb-12">
        <div className="flex items-center gap-2 rounded-full border bg-light-50 px-4 py-1 text-center text-xs text-light-1000 dark:border-dark-300 dark:bg-dark-50 dark:text-dark-900 lg:text-sm">
          <p>{"FAQs"}</p>
        </div>

        <p className="mt-2 text-center text-3xl font-bold text-light-1000 dark:text-dark-1000 lg:text-4xl">
          {"Questions?"}
        </p>
        <p className="text lg:text-md mt-3 max-w-[500px] text-center text-light-950 dark:text-dark-900">
          
            Find answers to common questions about Kan. Can't find what you're
            looking for? Feel free to{" "}
            <Link href="mailto:support@kan.bn" className="underline">
              contact us
            </Link>
            .
          
        </p>
      </div>
      <div className="rounded-2xl bg-light-50 ring-1 ring-light-300 dark:bg-dark-50 dark:ring-dark-200">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-16">
          <div className="mx-auto max-w-4xl">
            <dl className="divide-y divide-light-300 dark:divide-dark-200">
              {faqs.map((faq) => (
                <Disclosure
                  key={faq.question}
                  as="div"
                  className="py-5 first:pt-0 last:pb-0"
                >
                  <dt>
                    <DisclosureButton className="group flex w-full items-center justify-between text-left text-light-1000 dark:text-dark-1000">
                      <span className="text-[14px] font-semibold">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center text-light-800 dark:text-dark-800">
                        <HiMiniPlusSmall
                          aria-hidden="true"
                          className="size-6 group-data-[open]:hidden"
                        />
                        <HiMiniMinusSmall
                          aria-hidden="true"
                          className="size-6 group-[&:not([data-open])]:hidden"
                        />
                      </span>
                    </DisclosureButton>
                  </dt>
                  <DisclosurePanel as="dd" className="mt-2 pr-12">
                    {faq.answer}
                  </DisclosurePanel>
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
