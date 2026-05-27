"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function generateCalendar(month: number, year: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return [...blanks, ...days];
}

export default function AppointmentsPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(
    today.getDate()
  );

  const calendarDays = generateCalendar(currentMonth, currentYear);

  const changeMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" }
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Appointments</h1>
        <p className="text-black mt-1">
          Schedule and manage donation appointments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>

            <h2 className="font-semibold text-lg text-black">
              {monthName} {currentYear}-
            </h2>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 text-center text-sm font-medium text-black mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm text-black">
            {calendarDays.map((day, index) =>
              day ? (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`py-2 rounded-lg cursor-pointer transition ${
                    selectedDate === day
                      ? "bg-red-600 text-white font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {day}
                </div>
              ) : (
                <div key={index}></div>
              )
            )}
          </div>

          <button className="mt-6 w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition">
            + Schedule Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
