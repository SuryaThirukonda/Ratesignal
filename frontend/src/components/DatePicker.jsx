import { useEffect, useRef, useState } from "react";

function parseDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  const date = parseDate(value);

  if (!date) {
    return "Select date";
  }

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
}

function getMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function shiftMonth(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function DatePicker({ label, value, onChange }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDate(value) ?? new Date());

  useEffect(() => {
    if (open) {
      setViewDate(parseDate(value) ?? new Date());
    }
  }, [open, value]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedDate = parseDate(value);
  const today = new Date();
  const monthCells = getMonthGrid(viewDate);
  const monthTitle = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  function handleSelect(date) {
    onChange(toISODate(date));
    setOpen(false);
  }

  return (
    <div className="date-picker" ref={rootRef}>
      <span className="field__label">{label}</span>

      <button
        type="button"
        className="date-picker__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{formatDisplayDate(value)}</span>
        <span className="date-picker__chevron" aria-hidden="true">
          v
        </span>
      </button>

      {open ? (
        <div className="date-picker__popup" role="dialog" aria-label={label}>
          <div className="date-picker__header">
            <button
              type="button"
              className="date-picker__nav"
              onClick={() => setViewDate((current) => shiftMonth(current, -1))}
              aria-label="Previous month"
            >
              {"<"}
            </button>
            <strong>{monthTitle}</strong>
            <button
              type="button"
              className="date-picker__nav"
              onClick={() => setViewDate((current) => shiftMonth(current, 1))}
              aria-label="Next month"
            >
              {">"}
            </button>
          </div>

          <div className="date-picker__weekdays" aria-hidden="true">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="date-picker__grid">
            {monthCells.map((day) => {
              const iso = toISODate(day);
              const isCurrentMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = selectedDate ? iso === toISODate(selectedDate) : false;
              const isToday =
                day.getFullYear() === today.getFullYear() &&
                day.getMonth() === today.getMonth() &&
                day.getDate() === today.getDate();

              return (
                <button
                  key={iso}
                  type="button"
                  className={[
                    "date-picker__day",
                    isCurrentMonth ? "" : "is-outside",
                    isSelected ? "is-selected" : "",
                    isToday ? "is-today" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelect(day)}
                  aria-pressed={isSelected}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
