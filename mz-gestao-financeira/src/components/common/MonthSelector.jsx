// src/components/common/MonthSelector.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getMonthName } from '@/lib/utils';
import Select from '@/components/ui/Select'; // Vamos criar este componente
import Button from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MonthSelector = ({ initialMonth, initialYear }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const months = [
    { value: 'Jan', label: 'Janeiro' },
    { value: 'Fev', label: 'Fevereiro' },
    { value: 'Mar', label: 'Março' },
    { value: 'Abr', label: 'Abril' },
    { value: 'Mai', label: 'Maio' },
    { value: 'Jun', label: 'Junho' },
    { value: 'Jul', label: 'Julho' },
    { value: 'Ago', label: 'Agosto' },
    { value: 'Set', label: 'Setembro' },
    { value: 'Out', label: 'Outubro' },
    { value: 'Nov', label: 'Novembro' },
    { value: 'Dez', label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => initialYear - 2 + i); // Ex: 2024, 2025, 2026, 2027, 2028

  useEffect(() => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    if (monthParam && yearParam) {
      setSelectedMonth(monthParam);
      setSelectedYear(parseInt(yearParam));
    } else {
      // Se não houver params, define os valores iniciais e atualiza a URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('month', initialMonth);
      newSearchParams.set('year', initialYear.toString());
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  }, [searchParams, initialMonth, initialYear, pathname, router]);

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    updateUrl(newMonth, selectedYear);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setSelectedYear(newYear);
    updateUrl(selectedMonth, newYear);
  };

  const updateUrl = (month, year) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('month', month);
    newSearchParams.set('year', year.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const navigateMonth = (direction) => {
    const currentMonthIndex = months.findIndex(m => m.value === selectedMonth);
    let newMonthIndex = currentMonthIndex + direction;
    let newYear = selectedYear;

    if (newMonthIndex < 0) {
      newMonthIndex = 11; // Dezembro
      newYear--;
    } else if (newMonthIndex > 11) {
      newMonthIndex = 0; // Janeiro
      newYear++;
    }

    const newMonth = months[newMonthIndex].value;
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    updateUrl(newMonth, newYear);
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
        <ChevronLeftIcon className="h-5 w-5" />
      </Button>

      <div className="flex items-center space-x-2">
        <Select value={selectedMonth} onChange={handleMonthChange} className="w-32">
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </Select>
        <Select value={selectedYear} onChange={handleYearChange} className="w-24">
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </div>

      <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
        <ChevronRightIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MonthSelector;
