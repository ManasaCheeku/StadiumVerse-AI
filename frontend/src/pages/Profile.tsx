import MainLayout from "../layouts/MainLayout";

export default function Profile() {
  return (
    <MainLayout>

      <section className="mb-10">

        <h1 className="text-5xl font-bold">
          👤 My Profile
        </h1>

        <p className="mt-3 text-slate-400">
          Manage your StadiumVerse AI preferences and match-day experience.
        </p>

      </section>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex flex-col items-center">

            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-sky-600 text-5xl">
              👤
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              FIFA Fan
            </h2>

            <p className="text-slate-400">
              StadiumVerse Member
            </p>

          </div>

        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold">
            ⚙ Preferences
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <label className="text-slate-400">
                Preferred Language
              </label>

              <select className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white">
                <option>English</option>
                <option>Hindi</option>
                <option>Kannada</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400">
                Accessibility
              </label>

              <select className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white">
                <option>None</option>
                <option>Wheelchair Access</option>
                <option>Hearing Assistance</option>
                <option>Visual Assistance</option>
              </select>
            </div>

          </div>

        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold">
            🔔 Notifications
          </h2>

          <div className="mt-6 space-y-4">

            <label className="flex items-center justify-between">
              Match Reminder
              <input type="checkbox" defaultChecked />
            </label>

            <label className="flex items-center justify-between">
              Crowd Alerts
              <input type="checkbox" defaultChecked />
            </label>

            <label className="flex items-center justify-between">
              Parking Updates
              <input type="checkbox" defaultChecked />
            </label>

            <label className="flex items-center justify-between">
              Emergency Alerts
              <input type="checkbox" defaultChecked />
            </label>

          </div>

        </div>

      </div>

      {/* Statistics */}

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">

        <h2 className="text-3xl font-bold">
          📊 Match Statistics
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-4">

          <div className="rounded-xl bg-slate-800 p-6 text-center">
            <h3 className="text-4xl font-bold text-sky-400">
              12
            </h3>
            <p className="mt-2 text-slate-400">
              Matches Attended
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-6 text-center">
            <h3 className="text-4xl font-bold text-emerald-400">
              96%
            </h3>
            <p className="mt-2 text-slate-400">
              AI Usage
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-6 text-center">
            <h3 className="text-4xl font-bold text-yellow-400">
              5
            </h3>
            <p className="mt-2 text-slate-400">
              Stadium Visits
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-6 text-center">
            <h3 className="text-4xl font-bold text-purple-400">
              ⭐
            </h3>
            <p className="mt-2 text-slate-400">
              Premium Fan
            </p>
          </div>

        </div>

      </section>

    </MainLayout>
  );
}