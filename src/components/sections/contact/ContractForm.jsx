"use client";
import { useState } from "react";
import { Icon } from "@/lib/iconify";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setLoading(true);
    setStatus(null);

    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Send failed");
      setStatus("success");
      formElement.reset();
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-8 px-4 sm:py-20 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#f8f8f8] dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 md:p-14 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 items-start">
            <header>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight text-foreground">Get in touch with us today</h1>

              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-lg">
                We would love to hear from you. Whether you have a question,
                feedback, or business inquiry, our team is ready to assist you.
              </p>

              <nav className="mt-8" aria-label="Social media links">
                <ul className="flex items-center gap-4">
                  <li>
                    <a href="https://www.facebook.com/SucculentHutt" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-gray-300 dark:border-neutral-600 flex items-center justify-center hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition" aria-label="Facebook">
                      <Icon icon="mdi:facebook" width={18} height={18} />
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-gray-300 dark:border-neutral-600 flex items-center justify-center hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition" aria-label="Twitter">
                      <Icon icon="mdi:twitter" width={18} height={18} />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/succulenthutt" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-gray-300 dark:border-neutral-600 flex items-center justify-center hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition" aria-label="Instagram">
                      <Icon icon="mdi:instagram" width={18} height={18} />
                    </a>
                  </li>
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-gray-300 dark:border-neutral-600 flex items-center justify-center hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition" aria-label="LinkedIn">
                      <Icon icon="mdi:linkedin" width={18} height={18} />
                    </a>
                  </li>
                </ul>
              </nav>
            </header>

            <div className="bg-background rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-foreground">Full name</label>
                    <input name="name" type="text" placeholder="Your Name" required className="w-full border border-gray-300 dark:border-neutral-600 rounded-xl px-3 py-2 sm:px-4 sm:py-3 outline-none bg-background text-foreground focus:border-black dark:focus:border-white transition" />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-foreground">Email address</label>
                    <input name="email" type="email" placeholder="example@email.com" required className="w-full border border-gray-300 dark:border-neutral-600 rounded-xl px-4 py-3 outline-none bg-background text-foreground focus:border-black dark:focus:border-white transition" />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-foreground">Phone number</label>
                    <input name="phone" type="tel" placeholder="+8801XXXXXXXXX" className="w-full border border-gray-300 dark:border-neutral-600 rounded-xl px-4 py-3 outline-none bg-background text-foreground focus:border-black dark:focus:border-white transition" />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-foreground">Subject</label>
                    <input name="subject" type="text" placeholder="Subject" className="w-full border border-gray-300 dark:border-neutral-600 rounded-xl px-4 py-3 outline-none bg-background text-foreground focus:border-black dark:focus:border-white transition" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-foreground">Message</label>
                    <textarea name="message" rows={6} placeholder="Write your message here..." required className="w-full border border-gray-300 dark:border-neutral-600 rounded-xl px-3 py-2 sm:px-4 sm:py-3 outline-none bg-background text-foreground focus:border-black dark:focus:border-white transition resize-none" />
                  </div>

                  <div className="md:col-span-2">
                    <Button type="submit" variant="primary" size="lg" className="rounded-xl px-8 py-3 font-medium hover:opacity-90" disabled={loading}>
                      {loading ? 'Sending…' : 'Send message'}
                    </Button>
                  </div>
                </div>
                <div aria-live="polite" className="mt-3">
                  {status === 'success' && <p className="text-green-600">Message sent — we will reply soon.</p>}
                  {status === 'error' && <p className="text-red-600">Failed to send. Try again later.</p>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}